/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ProtoDefYAMLParse,
  ProtoDefYAMLCompile,
  getFiles,
  McCompiler, 
} from './'
import {
  ProtoDataPath,
  CUR_VERSION,
} from '../../Constants'
import { Compiler } from 'protodef'
const { ProtoDefCompiler } = Compiler
import { resolve } from 'path'
import fs from 'fs'
import { Logger } from '../../console'

const latest = resolve(ProtoDataPath, 'latest')

function getJSON(path: string): any {
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

function genProtoSchema(): string {
  const parsed = ProtoDefYAMLParse(resolve(latest, 'proto.yml'))
  const version: string = parsed['!version']
  const packets = []
  for (const key in parsed) {
    if (key.startsWith('%container')) {
      const [, name] = key.split(",")
      if (name.startsWith('packet_')) {
        const children = parsed[key]
        const packetName = name.replace('packet_', '')
        const packetID = children['!id']
        packets.push([packetID, packetName, name])
      }
    }
  }
  let l1 = ''
  let l2 = ''
  for (const [id, name, fname] of packets) {
    l1 += `      0x${id.toString(16).padStart(2, '0')}: ${name}\n`
    l2 += `      if ${name}: ${fname}\n`
  }
  const t = `#Auto-generated from proto.yml, do not modify\n!import: types.yaml\nmcpe_packet:\n   name: varint =>\n${l1}\n   params: name ?\n${l2}`
  fs.writeFileSync(resolve(latest, 'packet_map.yml'), t)

  ProtoDefYAMLCompile(resolve(latest, 'proto.yml'), resolve(latest, 'proto.json'))

  return version
}

function copyData(): string {
  const version = genProtoSchema()
  fs.mkdirSync(resolve(ProtoDataPath, version), { recursive: true })
  fs.writeFileSync(resolve(ProtoDataPath, `${version}/protocol.json`), JSON.stringify({ types: getJSON(resolve(latest, 'proto.json')) }, null, 2))
  fs.unlinkSync(resolve(latest, 'proto.json')) // remove temp file
  fs.unlinkSync(resolve(latest, 'packet_map.yml')) // remove temp file

  return version
}

function createProtocol(ver: string): void {
  const compiler = new ProtoDefCompiler()

  const path = resolve(ProtoDataPath, ver)

  const protocol = getJSON(resolve(path, 'protocol.json')).types
  compiler.addTypes(eval(McCompiler))
  compiler.addTypes(require('prismarine-nbt/compiler-zigzag'))
  compiler.addTypesToCompile(protocol)

  fs.writeFileSync(resolve(path, 'read.js'), 'module.exports = ' + compiler.readCompiler.generate().replace('() =>', 'native =>'))
  fs.writeFileSync(resolve(path, 'write.js'), 'module.exports = ' + compiler.writeCompiler.generate().replace('() =>', 'native =>'))
  fs.writeFileSync(resolve(path, 'size.js'), 'module.exports = ' + compiler.sizeOfCompiler.generate().replace('() =>', 'native =>'))

  compiler.compileProtoDefSync()
}

function copyExtra(ver: string): void {
  try {
    const files = getFiles(latest)
    const ignoreFiles = ["proto.yml","types.yaml"]

    for (const file of files) {
      const splitFilePath = file.split(/(\/|\\)/)
      const fileName = splitFilePath[splitFilePath.length - 1]
      if (!ignoreFiles.includes(fileName)) {
        fs.copyFileSync(file, resolve(ProtoDataPath, ver, fileName))
      }
    }

  } catch {}
}

function genData(): string {
  const version = copyData()
  createProtocol(version)
  copyExtra(version)

  return version
}

const protoLogger = new Logger('Protocol Compiler', 'red')
export function AttemptProtocolCompiler(): void {
  if (!fs.existsSync(resolve(ProtoDataPath, CUR_VERSION))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'protocol.json'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'read.js'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'write.js'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'size.js'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'steve.json'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'steveGeometry.json'))
  || !fs.existsSync(resolve(ProtoDataPath, CUR_VERSION, 'steveSkin.bin'))) {
    protoLogger.info("Proto data missing, starting data gen...")
    const version = genData()
    protoLogger.success("Generated", version, "protocol data")
  } else {
    protoLogger.info("Proto data detected, skipping compiler. Use \"recompile\" to recompile the proto def's!")
  }
}
