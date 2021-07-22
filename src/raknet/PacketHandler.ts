/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  types,
  Serializer,
} from 'protodef'
import {
  Parser,
  createDeserializer,
  createSerializer,
} from './Serializer'
import { Versions } from 'src/berp'
import zlib from 'zlib'
const [readVarInt, writeVarInt, sizeOfVarInt] = types.varint
import { Encryption } from './Encryption'

export class PacketHandler {
  private serializer: Serializer
  private deserializer: Parser
  private encryptor: Encryption
  public readonly version: Versions
  private encryptionStarted = false
  constructor(version: Versions) {
    this.version = version

    this.serializer = createSerializer(this.version)
    this.deserializer = createDeserializer(this.version)
  }
  public getSerializer(): Serializer { return this.serializer }
  public getDeserializer(): Parser { return this.deserializer }
  public getEncryptor(): Encryption { return this.encryptor }

  public startEncryption(iv: Buffer, secretKeyBytes: Buffer): void {
    this.encryptor = new Encryption(this.version, iv, secretKeyBytes)
    this.encryptionStarted = true
  }
  public async createPacket(name: string, params: { [k: string]: any }): Promise<Buffer> {
    const pak = this.serializer.createPacketBuffer({
      name,
      params, 
    }) as Buffer
    if (this.encryptionStarted) {
      return await this._handleWriteEPak(pak)
    } else {
      return Promise.resolve(this._handleWriteUPak(pak))
    }
  }
  public async readPacket(buffer: Buffer): Promise<{ name: string, params: unknown }[]> {
    if (buffer[0] === 0xfe) {
      if (this.encryptionStarted) {
        return await this._handleReadEPak(buffer)
      } else {
        return Promise.resolve(this._handleReadUPak(buffer))
      }
    }
  }
  public getPackets(buffer: Buffer): Buffer[] {
    const packets = []
    let offset = 0
    while (offset < buffer.byteLength) {
      const { value, size } = readVarInt(buffer, offset)
      const dec = Buffer.allocUnsafe(value)
      offset += size
      offset += buffer.copy(dec, 0, offset, offset + value)
      packets.push(dec)
    }

    return packets
  }
  public encode(packet: Buffer): Buffer {
    const def = zlib.deflateRawSync(packet, { level: 7 })

    return Buffer.concat([Buffer.from([0xfe]), def])
  }
  private _handleReadUPak(buffer: Buffer): { name: string, params: unknown }[] {
    const buf = Buffer.from(buffer)
    if (buf[0] !== 0xfe) throw Error('bad batch packet header ' + buf[0])
    const b = buf.slice(1)
    const inf = zlib.inflateRawSync(b, { chunkSize: 1024 * 1024 * 2 })
    
    const ret: { name: string, params: unknown }[] = []
    for (const packet of this.getPackets(inf)) {
      const des: { data: { name: string, params: unknown } } = this.deserializer.parsePacketBuffer(packet) as { data: { name: string, params: unknown } }
      ret.push({
        name: des.data.name,
        params: des.data.params,
      })
    }

    return ret
  }
  private async _handleReadEPak(buffer: Buffer): Promise<{ name: string, params: unknown }[]> {
    const dpacket = await this.encryptor.createDecryptor().read(buffer.slice(1))

    const ret: { name: string, params: unknown }[] = []
    for (const packet of this.getPackets(dpacket)) {
      const des: { data: { name: string, params: unknown } } = this.deserializer.parsePacketBuffer(packet) as { data: { name: string, params: unknown } }
      if (!des) continue
      else {
        ret.push({
          name: des.data.name,
          params: des.data.params,
        })
      }
    }

    return ret
  }
  private _handleWriteUPak(packet: Buffer): Buffer {
    const varIntSize = sizeOfVarInt(packet.byteLength)
    const newPacket = Buffer.allocUnsafe(varIntSize + packet.byteLength)
    writeVarInt(packet.length, newPacket, 0)
    packet.copy(newPacket, varIntSize)

    return this.encode(newPacket)
  }
  private async _handleWriteEPak(packet: Buffer): Promise<Buffer> {
    const varIntSize = sizeOfVarInt(packet.byteLength)
    const newPacket = Buffer.allocUnsafe(varIntSize + packet.byteLength)
    writeVarInt(packet.length, newPacket, 0)
    packet.copy(newPacket, varIntSize)
    const buffer = await this.encryptor.createEncryptor().create(newPacket)

    return Buffer.concat([Buffer.from([0xfe]), buffer])
  }
}
