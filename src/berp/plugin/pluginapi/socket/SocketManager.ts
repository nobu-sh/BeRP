import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import {
  JsonRequest,
  RawText,
} from 'src/types/berp'
import {
  EnableRequest,
  Heartbeat,
} from './requests/index'

export class SocketManager extends EventEmitter {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _requests = new Map<string, {execute: any}>()
  private _defaultRequests = new Map<string, any>()
  public enabled: boolean
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    super()
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this.enabled = false
  }
  public onEnabled(): void {
    this._listener()
    this._loadRequests() 
    setTimeout(() => this._pluginApi.getCommandManager().executeCommand('tag @s add "berpUser"'), 3500)
  }
  public onDisabled(): void {
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
  private async _loadRequests(): Promise<void> {
    return new Promise(async (res) => {
      const Enable = new EnableRequest(this)
      this._defaultRequests.set('EnableRequest', Enable)
      await Enable.onEnabled()
      const Heart = new Heartbeat(this)
      this._defaultRequests.set('Heartbeat', Heart)
      await Heart.onEnabled()
      res()
    })
  }
  public sendMessage(options: JsonRequest, callback?: (data: JsonRequest) => void): void {
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
  public getHeartbeats(): number { return this._defaultRequests.get('Heartbeat').getTotalBeats() }
}
