/* eslint-disable */
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
import { McCompiler } from '../utils'
import { CUR_VERSION } from '../../Constants'

export class Parser extends FullPacketParser {
  constructor(option1: unknown, option2: unknown) {
    super(option1, option2)
  }
  public parsePacketBuffer(buffer: Buffer): { data: { name: string, params: unknown } } {
    try {
      return super.parsePacketBuffer(buffer) as any
    } catch (e) {
      throw e
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
      throw `'Failed to re-encode', ${name}, ${JSON.stringify(params)}... (New: ${newBuffer.toString('hex')}) (Old: ${oldBuffer.toString('hex')})`
    }
  }
}

// Compiles the ProtoDef schema at runtime
export function createProtocol (): unknown {
  const protocol = require(resolve(process.cwd(), `data/${CUR_VERSION}/protocol.json`)).types
  const compiler = new ProtoDefCompiler()
  compiler.addTypesToCompile(protocol)
  compiler.addTypes(eval(McCompiler))
  compiler.addTypes(require('prismarine-nbt/compiler-zigzag'))

  const compiledProto = compiler.compileProtoDefSync()
  
  return compiledProto
}

// Loads already generated read/write/sizeof code
function getProtocol () {
  const compiler = new ProtoDefCompiler()
  compiler.addTypes(eval(McCompiler))
  compiler.addTypes(require('prismarine-nbt/compiler-zigzag'))

  global.PartialReadError = require('protodef/src/utils').PartialReadError
  const compile = (compiler, file) => require(file)(compiler.native)

  return new CompiledProtodef(
    compile(compiler.sizeOfCompiler, resolve(process.cwd(), `data/${CUR_VERSION}/size.js`)),
    compile(compiler.writeCompiler, resolve(process.cwd(), `data/${CUR_VERSION}/write.js`)),
    compile(compiler.readCompiler, resolve(process.cwd(), `data/${CUR_VERSION}/read.js`)),
  )
}

export function createSerializer (): Serializer {
  const proto = getProtocol()
  
  return new Serializer(proto, 'mcpe_packet')
}

export function createDeserializer (): Parser {
  const proto = getProtocol()

  return new Parser(proto, 'mcpe_packet')
}
