import {
  CipherKey,
  BinaryLike,
  CipherGCMTypes,
  getCiphers,
  createCipheriv,
  CipherGCM,
  DecipherGCM,
  createDecipheriv,
  createHash,
} from 'crypto'
import zlib from 'zlib'

export class Encryption {
  private cipher: CipherGCM
  private decipher: DecipherGCM
  private sendCounter: bigint
  private recieveCounter: bigint
  private iv: Buffer
  private secretKeyBytes: Buffer
  constructor(iv: Buffer, secretKeyBytes: Buffer) {
    this.iv = iv
    this.secretKeyBytes = secretKeyBytes

    this.cipher = this.createCipher(this.secretKeyBytes, iv.slice(0, 12), 'aes-256-gcm')
    this.decipher = this.createDecipher(this.secretKeyBytes, iv.slice(0, 12), 'aes-256-gcm')

    this.sendCounter =  0n
    this.recieveCounter = 0n
  }

  public getCipher(): CipherGCM { return this.cipher }
  public getDecipher(): DecipherGCM { return this.decipher }

  public createCipher(secret: CipherKey, iv: BinaryLike, alg: CipherGCMTypes): CipherGCM {
    if (getCiphers().includes(alg)) {
      return createCipheriv(alg, secret, iv)
    }
  }
  public createDecipher(secret: CipherKey, iv: BinaryLike, alg: CipherGCMTypes): DecipherGCM {
    if (getCiphers().includes(alg)) {
      return createDecipheriv(alg, secret, iv)
    }
  }
  public computeCheckSum(plain: BinaryLike, scounter: bigint, keyBytes: BinaryLike): Buffer {
    const digest = createHash('sha256')
    const counter = Buffer.alloc(8)
    counter.writeBigInt64LE(scounter, 0)
    digest.update(counter)
    digest.update(plain)
    digest.update(keyBytes)
    const hash = digest.digest()
    
    return hash.slice(0, 8)
  }
  public createEncryptor(): { create(blob: zlib.InputType): Promise<Buffer> } {
    const create = (chunk: zlib.InputType): Promise<Buffer> => {
      return new Promise((r) => {
        const def = zlib.deflateRawSync(chunk, { level: 7 })
        const packet = Buffer.concat([def, this.computeCheckSum(def, this.sendCounter, this.secretKeyBytes)])
        this.sendCounter++

        this.cipher.once('data', (buf) => { r(buf) })
        this.cipher.write(packet)
      })
    } 

    return { create }
  }
  public createDecryptor(): { read(blob: Buffer): Promise<Buffer> } {
    const read = (chunk: Buffer): Promise<Buffer> => {
      return new Promise((r, j) => {
        this.decipher.once('data', (buf: Buffer) => {
          const packet = buf.slice(0, buf.length - 8)
          const checksum = buf.slice(buf.length - 8, buf.length)
          const computedCheckSum = this.computeCheckSum(packet, this.recieveCounter, this.secretKeyBytes)
          this.recieveCounter++

          if (Buffer.compare(checksum, computedCheckSum) !== 0) {
            j(`Checksum mismatch ${checksum.toString('hex')} != ${computedCheckSum.toString('hex')}`)
          }

          const inf = zlib.inflateRawSync(buf, { chunkSize: 1024 * 1024 * 2 })
          r(inf)
        })
        this.decipher.write(chunk)
      })
    }

    return { read }
  }
}
