// Minecraft compiler is javascript logic fed to proto-def so we can read, write, and size packets
// Due to the way proto-def is built it cannot accept typescript
// So to avoid having to keep it in a static file outside the project
// We eval the code as a string then feed to to proto-def

// TODO: Write custom protobuf, current method is iffy

export const McCompiler = `
const UUID = require('uuid-1345')
const nbt = require('prismarine-nbt')

const protoLE = nbt.protos.little
const protoLEV = nbt.protos.littleVarint
// TODO: deal with this:
const zigzag = require('prismarine-nbt/compiler-zigzag')

function readUUID (buffer, offset) {
  if (offset + 16 > buffer.length) { throw new PartialReadError() }
  return {
    value: UUID.stringify(buffer.slice(offset, 16 + offset)),
    size: 16
  }
}

function writeUUID (value, buffer, offset) {
  const buf = UUID.parse(value)
  buf.copy(buffer, offset)
  return offset + 16
}

// Little Endian + varints

function readNbt (buffer, offset) {
  return protoLEV.read(buffer, offset, 'nbt')
}

function writeNbt (value, buffer, offset) {
  return protoLEV.write(value, buffer, offset, 'nbt')
}

function sizeOfNbt (value) {
  return protoLEV.sizeOf(value, 'nbt')
}

// Little Endian

function readNbtLE (buffer, offset) {
  const r = protoLE.read(buffer, offset, 'nbt')
  if (r.value.type === 'end') return { value: r.value, size: 0 }
  return r
}

function writeNbtLE (value, buffer, offset) {
  if (value.type === 'end') return offset
  return protoLE.write(value, buffer, offset, 'nbt')
}

function sizeOfNbtLE (value) {
  if (value.type === 'end') return 0
  return protoLE.sizeOf(value, 'nbt')
}

function readEntityMetadata (buffer, offset, _ref) {
  const type = _ref.type
  const endVal = _ref.endVal

  let cursor = offset
  const metadata = []
  let item
  while (true) {
    if (offset + 1 > buffer.length) throw new PartialReadError()
    item = buffer.readUInt8(cursor)
    if (item === endVal) {
      return {
        value: metadata,
        size: cursor + 1 - offset
      }
    }
    const results = this.read(buffer, cursor, type, {})
    metadata.push(results.value)
    cursor += results.size
  }
}

function writeEntityMetadata (value, buffer, offset, _ref2) {
  const type = _ref2.type
  const endVal = _ref2.endVal

  const self = this
  value.forEach(function (item) {
    offset = self.write(item, buffer, offset, type, {})
  })
  buffer.writeUInt8(endVal, offset)
  return offset + 1
}

function sizeOfEntityMetadata (value, _ref3) {
  const type = _ref3.type

  let size = 1
  for (let i = 0; i < value.length; ++i) {
    size += this.sizeOf(value[i], type, {})
  }
  return size
}

function readIpAddress (buffer, offset) {
  const address = buffer[offset] + '.' + buffer[offset + 1] + '.' + buffer[offset + 2] + '.' + buffer[offset + 3]
  return {
    size: 4,
    value: address
  }
}

function writeIpAddress (value, buffer, offset) {
  const address = value.split('.')

  address.forEach(function (b) {
    buffer[offset] = parseInt(b)
    offset++
  })

  return offset
}

function readEndOfArray (buffer, offset, typeArgs) {
  const type = typeArgs.type
  let cursor = offset
  const elements = []
  while (cursor < buffer.length) {
    const results = this.read(buffer, cursor, type, {})
    elements.push(results.value)
    cursor += results.size
  }
  return {
    value: elements,
    size: cursor - offset
  }
}

function writeEndOfArray (value, buffer, offset, typeArgs) {
  const type = typeArgs.type
  const self = this
  value.forEach(function (item) {
    offset = self.write(item, buffer, offset, type, {})
  })
  return offset
}

function sizeOfEndOfArray (value, typeArgs) {
  const type = typeArgs.type
  let size = 0
  for (let i = 0; i < value.length; ++i) {
    size += this.sizeOf(value[i], type, {})
  }
  return size
}

const minecraft = {
  uuid: [readUUID, writeUUID, 16],
  nbt: [readNbt, writeNbt, sizeOfNbt],
  lnbt: [readNbtLE, writeNbtLE, sizeOfNbtLE],
  entityMetadataLoop: [readEntityMetadata, writeEntityMetadata, sizeOfEntityMetadata],
  ipAddress: [readIpAddress, writeIpAddress, 4],
  endOfArray: [readEndOfArray, writeEndOfArray, sizeOfEndOfArray],
  zigzag32: zigzag.zigzag32,
  zigzag64: zigzag.zigzag64
}

function sizeOfVarLong (value) {
  if (typeof value.valueOf() === 'object') {
    value = (BigInt(value[0]) << 32n) | BigInt(value[1])
  } else if (typeof value !== 'bigint') value = BigInt(value)

  let cursor = 0
  while (value > 127n) {
    value >>= 7n
    cursor++
  }
  return cursor + 1
}

/**
 * Reads a 64-bit VarInt as a BigInt
 */
function readVarLong (buffer, offset) {
  let result = BigInt(0)
  let shift = 0n
  let cursor = offset
  let size = 0

  while (true) {
    if (cursor + 1 > buffer.length) { throw new Error('unexpected buffer end') }
    const b = buffer.readUInt8(cursor)
    result |= (BigInt(b) & 0x7fn) << shift // Add the bits to our number, except MSB
    cursor++
    if (!(b & 0x80)) { // If the MSB is not set, we return the number
      size = cursor - offset
      break
    }
    shift += 7n // we only have 7 bits, MSB being the return-trigger
    if (shift > 63n) throw new Error(\`varint is too big: \${shift}\`)
  }

  return { value: result, size }
}

/**
 * Writes a zigzag encoded 64-bit VarInt as a BigInt
 */
function writeVarLong (value, buffer, offset) {
  // if an array, turn it into a BigInt
  if (typeof value.valueOf() === 'object') {
    value = BigInt.asIntN(64, (BigInt(value[0]) << 32n)) | BigInt(value[1])
  } else if (typeof value !== 'bigint') value = BigInt(value)

  let cursor = 0
  while (value > 127n) { // keep writing in 7 bit slices
    const num = Number(value & 0xFFn)
    buffer.writeUInt8(num | 0x80, offset + cursor)
    cursor++
    value >>= 7n
  }
  buffer.writeUInt8(Number(value), offset + cursor)
  return offset + cursor + 1
}


const Read = { varint64: ['native', readVarLong] }
const Write = { varint64: ['native', writeVarLong] }
const SizeOf = { varint64: ['native', sizeOfVarLong] }



/**
 * UUIDs
 */
Read.uuid = ['native', (buffer, offset) => {
  return {
    value: UUID.stringify(buffer.slice(offset, 16 + offset)),
    size: 16
  }
}]
Write.uuid = ['native', (value, buffer, offset) => {
  const buf = UUID.parse(value)
  buf.copy(buffer, offset)
  return offset + 16
}]
SizeOf.uuid = ['native', 16]

/**
 * Rest of buffer
 */
Read.restBuffer = ['native', (buffer, offset) => {
  return {
    value: buffer.slice(offset),
    size: buffer.length - offset
  }
}]
Write.restBuffer = ['native', (value, buffer, offset) => {
  value.copy(buffer, offset)
  return offset + value.length
}]
SizeOf.restBuffer = ['native', (value) => {
  return value.length
}]

/**
 * Encapsulated data with length prefix
 */
Read.encapsulated = ['parametrizable', (compiler, { lengthType, type }) => {
  return compiler.wrapCode(\`
  const payloadSize = \${compiler.callType(lengthType, 'offset')}
  const { value, size } = ctx.\${type}(buffer, offset + payloadSize.size)
  return { value, size: size + payloadSize.size }
\`.trim())
}]
Write.encapsulated = ['parametrizable', (compiler, { lengthType, type }) => {
  return compiler.wrapCode(\`
  const buf = Buffer.allocUnsafe(buffer.length - offset)
  const payloadSize = (ctx.\${type})(value, buf, 0)
  let size = (ctx.\${lengthType})(payloadSize, buffer, offset)
  size += buf.copy(buffer, size, 0, payloadSize)
  return size
\`.trim())
}]
SizeOf.encapsulated = ['parametrizable', (compiler, { lengthType, type }) => {
  return compiler.wrapCode(\`
    const payloadSize = (ctx.\${type})(value)
    return (ctx.\${lengthType})(payloadSize) + payloadSize
\`.trim())
}]

/**
 * Read NBT until end of buffer or \0
 */
Read.nbtLoop = ['context', (buffer, offset) => {
  const values = []
  while (buffer[offset] != 0) {
    const n = ctx.nbt(buffer, offset)
    values.push(n.value)
    offset += n.size
  }
  return { value: values, size: buffer.length - offset }
}]
Write.nbtLoop = ['context', (value, buffer, offset) => {
  for (const val of value) {
    offset = ctx.nbt(val, buffer, offset)
  }
  buffer.writeUint8(0, offset)
  return offset + 1
}]
SizeOf.nbtLoop = ['context', (value, buffer, offset) => {
  let size = 1
  for (const val of value) {
    size += ctx.nbt(val, buffer, offset)
  }
  return size
}]

/**
 * Read rotation float encoded as a byte
 */
Read.byterot = ['context', (buffer, offset) => {
  const val = buffer.readUint8(offset)
  return { value: (val * (360 / 256)), size: 1 }
}]
Write.byterot = ['context', (value, buffer, offset) => {
  const val = (value / (360 / 256))
  buffer.writeUint8(val, offset)
  return offset + 1
}]
SizeOf.byterot = ['context', (value, buffer, offset) => {
  return 1
}]

/**
 * NBT
 */
Read.nbt = ['native', minecraft.nbt[0]]
Write.nbt = ['native', minecraft.nbt[1]]
SizeOf.nbt = ['native', minecraft.nbt[2]]

Read.lnbt = ['native', minecraft.lnbt[0]]
Write.lnbt = ['native', minecraft.lnbt[1]]
SizeOf.lnbt = ['native', minecraft.lnbt[2]]

/**
 * Bits
 */

Read.bitflags = ['parametrizable', (compiler, { type, flags, shift, big }) => {
  let fstr = JSON.stringify(flags)
  if (Array.isArray(flags)) {
    fstr = '{'
    flags.map((v, k) => fstr += \`"\${v}": \${big ? 1n << BigInt(k) : 1 << k}\` + (big ? 'n,' : ','))
    fstr += '}'
  } else if (shift) {
    fstr = '{'
    for (const key in flags) fstr += \`"\${key}": \${1 << flags[key]},\`;
    fstr += '}'
  }
  return compiler.wrapCode(\`
    const { value: _value, size } = \${compiler.callType(type, 'offset')}
    const value = { _value }
    const flags = \${fstr}
    for (const key in flags) {
      value[key] = (_value & flags[key]) == flags[key]
    }
    return { value, size }
  \`.trim())
}]

Write.bitflags = ['parametrizable', (compiler, { type, flags, shift, big }) => {
  let fstr = JSON.stringify(flags)
  if (Array.isArray(flags)) {
    fstr = '{'
    flags.map((v, k) => fstr += \`"\${v}": \${big ? 1n << BigInt(k) : 1 << k}\` + (big ? 'n,' : ','))
    fstr += '}'
  } else if (shift) {
    fstr = '{'
    for (const key in flags) fstr += \`"\${key}": \${1 << flags[key]},\`;
    fstr += '}'
  }
  return compiler.wrapCode(\`
    const flags = \${fstr}
    let val = value._value \${big ? '|| 0n' : ''}
    for (const key in flags) {
      if (value[key]) val |= flags[key]
    }
    return (ctx.\${type})(val, buffer, offset)
  \`.trim())
}]

SizeOf.bitflags = ['parametrizable', (compiler, { type, flags, shift, big }) => {
  let fstr = JSON.stringify(flags)
  if (Array.isArray(flags)) {
    fstr = '{'
    flags.map((v, k) => fstr += \`"\${v}": \${big ? 1n << BigInt(k) : 1 << k}\` + (big ? 'n,' : ','))
    fstr += '}'
  } else if (shift) {
    fstr = '{'
    for (const key in flags) fstr += \`"\${key}": \${1 << flags[key]},\`;
    fstr += '}'
  }
  return compiler.wrapCode(\`
    const flags = \${fstr}
    let val = value._value \${big ? '|| 0n' : ''}
    for (const key in flags) {
      if (value[key]) val |= flags[key]
    }
    return (ctx.\${type})(val)
  \`.trim())
}]

/**
 * Command Packet
 * - used for determining the size of the following enum
 */
Read.enum_size_based_on_values_len = ['parametrizable', (compiler) => {
  return compiler.wrapCode(js(() => {
    if (values_len <= 0xff) return { value: 'byte', size: 0 }
    if (values_len <= 0xffff) return { value: 'short', size: 0 }
    if (values_len <= 0xffffff) return { value: 'int', size: 0 }
  }))
}]
Write.enum_size_based_on_values_len = ['parametrizable', (compiler) => {
  return str(() => {
    if (value.values_len <= 0xff) _enum_type = 'byte'
    else if (value.values_len <= 0xffff) _enum_type = 'short'
    else if (value.values_len <= 0xffffff) _enum_type = 'int'
    return offset
  })
}]
SizeOf.enum_size_based_on_values_len = ['parametrizable', (compiler) => {
  return str(() => {
    if (value.values_len <= 0xff) _enum_type = 'byte'
    else if (value.values_len <= 0xffff) _enum_type = 'short'
    else if (value.values_len <= 0xffffff) _enum_type = 'int'
    return 0
  })
}]

function js (fn) {
  return fn.toString().split('\\n').slice(1, -1).join('\\n').trim()
}

function str (fn) {
  return fn.toString() + ')();(()=>{}'
}

module.exports = { Read, Write, SizeOf }
`
