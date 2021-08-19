/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events'
import {
  Client,
  PacketReliability,
  PacketPriority,
} from 'raknet-native'

interface RaknetEvents {
  connected: []
  pong: []
  closed: []
  raw: [Buffer, string, string]
}

export interface Raknet {
  on<K extends keyof RaknetEvents>(event: K, listener: (...args: RaknetEvents[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof RaknetEvents>,
    listener: (...args: any[]) => void, 
  ): this
  once<K extends keyof RaknetEvents>(event: K, listener: (...args: RaknetEvents[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof RaknetEvents>,
    listener: (...args: any[]) => void, 
  ): this
  emit<K extends keyof RaknetEvents>(event: K, ...args: RaknetEvents[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof RaknetEvents>,
    ...args: any[]
  ): boolean
  writeRaw(packet: Buffer, priority?: PacketPriority, reliability?: PacketReliability, orderingChannel?: number): void
}

export class Raknet extends EventEmitter {
  public readonly host: string
  public readonly port: number
  public readonly protocolVersion: number
  private connected = false
  private connection: Client
  constructor(host: string, port: number, protocol: number) {
    super()
    this.host = host
    this.port = port
    this.protocolVersion = protocol
    
    this._onConnect = this._onConnect.bind(this)
    this._onPong = this._onPong.bind(this)
    this._onEncapsulated = this._onEncapsulated.bind(this)
    this._onClose = this._onClose.bind(this)


    this.connection = new Client(host, port, { protocolVersion: protocol })
    this.connection.on('connect', this._onConnect)
    this.connection.on('pong', this._onPong)
    this.connection.on('encapsulated', this._onEncapsulated)
    this.connection.on('disconnect', this._onClose)
  }
  private _onConnect() {
    this.emit('connected')
  } 
  private _onPong() {
    this.emit('pong')
  }
  private _onEncapsulated(arg: { buffer: Buffer, address: string, guid: string }) {
    this.emit('raw', Buffer.from(arg.buffer), arg.address, arg.guid)
  }
  private _onClose() {
    this.emit('closed')
  }
  public killConnection(): void {
    this.removeAllListeners()
    if (this.connection) {
      this.connection.close()
    }
  }
  public writeRaw(packet: Buffer, priority?: PacketPriority, reliability?: PacketReliability, orderingChannel?: number): void {
    this.connection.send(packet, priority || PacketPriority.IMMEDIATE_PRIORITY, reliability || PacketReliability.RELIABLE_ORDERED, orderingChannel || 0)
  }
  public connect(): void {
    if (!this.connected) {
      this.connected = true
      this.connection.connect()
    }
  }
}
