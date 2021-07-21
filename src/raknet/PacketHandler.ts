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

export class PacketHandler {
  private serializer: Serializer
  private deserializer: Parser
  public readonly version: string
  constructor(version: Versions) {
    this.version = version

    this.serializer = createSerializer(this.version)
    this.deserializer = createDeserializer(this.version)
  }
  public getSerializer(): Serializer { return this.serializer }
  public getDeserializer(): Parser { return this.deserializer }

  createUnencryptedPacket(name: string, params: { [k: string]: any }): Buffer {
    const pakBuffer: Buffer = this.serializer.createPacketBuffer({
      name,
      params,
    }) as Buffer
    const varIntSize = sizeOfVarInt(pakBuffer.byteLength)
    const newPacket = Buffer.allocUnsafe(varIntSize + pakBuffer.byteLength)
    writeVarInt(pakBuffer.length, newPacket, 0)
    pakBuffer.copy(newPacket, varIntSize)

    const pakDeflate = zlib.deflateRawSync(newPacket, { level: 7 })

    return Buffer.concat([Buffer.from([0xfe]), pakDeflate])
  }
  // createEncryptedPacket(name: string, params: { [k: string]: any }): Buffer {
  //   //
  // }
  readPacket(buffer: Buffer): { name: unknown, params: unknown }[] {
    const buf = Buffer.from(buffer)
    if (buf[0] !== 0xfe) throw Error('bad batch packet header ' + buf[0])
    const b = buf.slice(1)
    const inf = zlib.inflateRawSync(b, { chunkSize: 1024 * 1024 * 2 })
    
    const packets: Buffer[] = []
    let offset = 0
    while (offset < inf.byteLength) {
      const { value, size } = readVarInt(inf, offset)
      const dec = Buffer.allocUnsafe(value)
      offset += size
      offset += inf.copy(dec, 0, offset, offset + value)
      packets.push(dec)
    }
    const final: { name: unknown, params: unknown }[] = []
    for (const packet of packets) {
      const des: { data: { name: unknown, params: unknown } } = this.deserializer.parsePacketBuffer(packet) as { data: { name: unknown, params: unknown } }
      final.push({
        name: des.data.name,
        params: des.data.params,
      })
    }

    return final
  }
}
