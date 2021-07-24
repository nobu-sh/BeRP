// https://github.com/PrismarineJS/bedrock-protocol/blob/master/src/transforms/serializer.js

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Compiler,
  FullPacketParser,
  Serializer, 
} from 'protodef'
const {
  ProtoDefCompiler,
  CompiledProtodef,
} = Compiler
import { resolve } from 'path'

export class Parser extends FullPacketParser {
  constructor(option1: unknown, option2: unknown) {
    super(option1, option2)
  }
  public parsePacketBuffer(buffer: Buffer): unknown {
    try {
      return super.parsePacketBuffer(buffer)
    } catch (e) {
      // Ignore For Time Being
      // console.error('Error While Decoding')
      // throw e
    }
  }
  public verify (deserialized: any, serializer: any): void {
    const { name, params } = deserialized.data
    const oldBuffer = deserialized.fullBuffer
    const newBuffer = serializer.createPacketBuffer({
      name,
      params, 
    })
    if (!newBuffer.equals(oldBuffer)) {
      console.warn('New', newBuffer.toString('hex'))
      console.warn('Old', oldBuffer.toString('hex'))
      console.log('Failed to re-encode', name, params)
      process.exit(1)
    }
  }
}

// Compiles the ProtoDef schema at runtime
export function createProtocol (version: unknown): unknown {
  const protocol = require(resolve(process.cwd(), `data/${version}/protocol.json`)).types
  const compiler = new ProtoDefCompiler()
  compiler.addTypesToCompile(protocol)
  compiler.addTypes(require(resolve(process.cwd(), 'datatypes/compiler-minecraft')))
  compiler.addTypes(require('prismarine-nbt/compiler-zigzag'))

  const compiledProto = compiler.compileProtoDefSync()
  
  return compiledProto
}

// Loads already generated read/write/sizeof code
function getProtocol (version) {
  const compiler = new ProtoDefCompiler()
  compiler.addTypes(require(resolve(process.cwd(), 'datatypes/compiler-minecraft')))
  compiler.addTypes(require('prismarine-nbt/compiler-zigzag'))

  global.PartialReadError = require('protodef/src/utils').PartialReadError
  const compile = (compiler, file) => require(file)(compiler.native)

  return new CompiledProtodef(
    compile(compiler.sizeOfCompiler, resolve(process.cwd(), `data/${version}/size.js`)),
    compile(compiler.writeCompiler, resolve(process.cwd(), `data/${version}/write.js`)),
    compile(compiler.readCompiler, resolve(process.cwd(), `data/${version}/read.js`)),
  )
}

export function createSerializer (version: unknown): Serializer {
  const proto = getProtocol(version)
  
  return new Serializer(proto, 'mcpe_packet')
}

export function createDeserializer (version: unknown): Parser {
  const proto = getProtocol(version)

  return new Parser(proto, 'mcpe_packet')
}
