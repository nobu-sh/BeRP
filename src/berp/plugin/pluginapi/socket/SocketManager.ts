/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import {
  JsonData,
  JsonRequest,
  RawText,
} from 'src/types/berp'
import {
  SocketOutboundValues,
  SocketValues,
} from 'src/types/pluginApi.i'
import { defaultRequests } from './requests/index'
import { v4 as uuidv4 } from 'uuid'

export interface SocketManager {
  on<K extends keyof SocketValues>(event: K, callback: (...args: SocketValues[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    callback: (...args: unknown[]) => void,
  ): this
  once<K extends keyof SocketValues>(event: K, callback: (...args: SocketValues[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    callback: (...args: unknown[]) => void,
  ): this
  emit<K extends keyof SocketValues>(event: K, ...args: SocketValues[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    ...args: unknown[]
  ): boolean
  sendMessage(options: JsonRequest, callback?: (data: JsonData) => void): void
  getHeartbeats(): number
  newUUID(): string
}

export class SocketManager extends EventEmitter {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _requests = new Map<string, {execute: any}>()
  private _defaultRequests = new Map<string, any>()
  public _api: string
  public _verison: string
  public _mcbe: string
  public _protocol: number
  public enabled: boolean
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    super()
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this.enabled = false
  }
  public async onEnabled(): Promise<void> {
    this._listener()
    this._loadRequests() 
    setTimeout(() => this._pluginApi.getCommandManager().executeCommand('tag @s add "berpUser"'), 3500)
  }
  public async onDisabled(): Promise<void> {
    for (const [, request] of this._defaultRequests) {
      request.onDisabled()
    }
  }
  private _listener(): void {
    this._connection.on('text', (packet) => {
      try {
        if (packet.type !== 'json_whisper') return
        const parsedMessage: RawText = JSON.parse(packet.message)
        if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
        const message = []
        for (const raw of parsedMessage.rawtext) {
          message.push(raw.text)
        }
        const data = JSON.parse(message.join(''))
        if (this._requests.has(`${data.berp.requestId}:${data.berp.event}`)) {
          this._requests.get(`${data.berp.requestId}:${data.berp.event}`).execute(data.berp)
          this._requests.delete(`${data.berp.requestId}:${data.berp.event}`)
        }
        
        return this.emit('Message', data.berp)
      } catch (err) {
        console.log(packet.message)
        console.log(`caught: ${err}`)
      }
    })
  }
  private _loadRequests(): void {
    for (const request of defaultRequests) {
      const newRequest = new request(this, this._berp, this._connection, this._pluginApi)
      newRequest.onEnabled()
      this._defaultRequests.set(newRequest.requestName, newRequest)
    }
  }
  public sendMessage(options: JsonRequest, callback?: (data: JsonData) => void): void {
    if (callback) this._requests.set(`${options.berp.requestId}:${options.berp.event}`, { execute: callback })
    this._connection.sendPacket('text', {
      message: JSON.stringify(options),
      needs_translation: false,
      platform_chat_id: '',
      source_name: this._connection.getXboxProfile().extraData.displayName,
      type: 'chat',
      xuid: this._connection.getXboxProfile().extraData.XUID,
    })
  }
  // @ts-ignore
  public sendPacket<K extends keyof SocketOutboundValues>(name: K, params: SocketOutboundValues[K][0], callback?: (data: SocketValues[K][0]) => void): void {
    const requestId = this.newUUID()
    this.sendMessage({
      berp: {
        event: name,
        requestId: requestId,
        ...params,
      },
    }, (res) => {
      if (!callback) return

      return callback(res as any)
    })
  }
  public getHeartbeats(): number { return this._defaultRequests.get('Heartbeat').getTotalBeats() }
  public newUUID(): string { return uuidv4() }
}
