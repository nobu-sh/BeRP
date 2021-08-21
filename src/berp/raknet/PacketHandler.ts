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
import zlib from 'zlib'
const [readVarInt, writeVarInt, sizeOfVarInt] = types.varint
import { Encryption } from './Encryption'

export class PacketHandler {
  private serializer: Serializer
  private deserializer: Parser
  private encryptor: Encryption
  private encryptionStarted = false
  constructor() {
    this.serializer = createSerializer()
    this.deserializer = createDeserializer()
  }
  public getSerializer(): Serializer { return this.serializer }
  public getDeserializer(): Parser { return this.deserializer }
  public getEncryptor(): Encryption { return this.encryptor }

  public startEncryption(iv: Buffer, secretKeyBytes: Buffer): void {
    this.encryptor = new Encryption(iv, secretKeyBytes)
    this.encryptionStarted = true
  }
  public async createPacket(name: string, params: { [k: string]: any }): Promise<Buffer> {
    try {
      const pak = this.serializer.createPacketBuffer({
        name,
        params, 
      }) as Buffer
      if (this.encryptionStarted) {
        return await this._handleWriteEPak(pak)
      } else {
        return Promise.resolve(this._handleWriteUPak(pak))
      }
    } catch (error) {
      throw error
    }
  }
  public async readPacket(buffer: Buffer): Promise<{ name: string, params: unknown }[]> {
    try {
      if (buffer[0] === 0xfe) {
        if (this.encryptionStarted) {
          return await this._handleReadEPak(buffer)
        } else {
          return Promise.resolve(this._handleReadUPak(buffer))
        }
      }
    } catch (error) {
      throw error
    }
  }
  public getPackets(buffer: Buffer): Buffer[] {
    try {
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
    } catch (error) {
      throw error
    }
  }
  public encode(packet: Buffer): Buffer {
    const def = zlib.deflateRawSync(packet, { level: 7 })

    return Buffer.concat([Buffer.from([0xfe]), def])
  }
  private _handleReadUPak(buffer: Buffer): { name: string, params: unknown }[] {
    try {
      const buf = Buffer.from(buffer)
      if (buf[0] !== 0xfe) throw Error('Bad batch packet header ' + buf[0])
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
    } catch (error) {
      // console.log("UW OW EWWR")
      throw error
    }
  }
  private async _handleReadEPak(buffer: Buffer): Promise<{ name: string, params: unknown }[]> {
    try {
      const dpacket = await this.encryptor.createDecryptor().read(buffer.slice(1))

      const ret: { name: string, params: unknown }[] = []
      for (const packet of this.getPackets(dpacket)) {
        // console.log(packet)
        try {
          var des: { data: { name: string, params: unknown } } = this.deserializer.parsePacketBuffer(packet) as { data: { name: string, params: unknown } } // eslint-disable-line
        } catch (error) {
          // Handles broken packets being mixed with okay packets.

          continue
        }
        if (!des) continue
        else {
          ret.push({
            name: des.data.name,
            params: des.data.params,
          })
        }
      }

      return ret
    } catch (error) {
      throw error
    }
  }
  private _handleWriteUPak(packet: Buffer): Buffer {
    try {
      const varIntSize = sizeOfVarInt(packet.byteLength)
      const newPacket = Buffer.allocUnsafe(varIntSize + packet.byteLength)
      writeVarInt(packet.length, newPacket, 0)
      packet.copy(newPacket, varIntSize)

      return this.encode(newPacket)
    } catch (error) {
      throw error
    }
  }
  private async _handleWriteEPak(packet: Buffer): Promise<Buffer> {
    try {
      const varIntSize = sizeOfVarInt(packet.byteLength)
      const newPacket = Buffer.allocUnsafe(varIntSize + packet.byteLength)
      writeVarInt(packet.length, newPacket, 0)
      packet.copy(newPacket, varIntSize)
      const buffer = await this.encryptor.createEncryptor().create(newPacket)

      return Buffer.concat([Buffer.from([0xfe]), buffer])
    } catch (error) {
      throw error
    }
  }
}
