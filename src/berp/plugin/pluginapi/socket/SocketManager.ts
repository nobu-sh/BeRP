import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import {
  JsonRequest,
  RawText,
} from 'src/types/berp'

export class SocketManager extends EventEmitter {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _requests = new Map<string, {execute: any}>()
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    super()
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._listener()
  }
  public onEnabled(): void {
    this._pluginApi.getCommandManager().executeCommand('tag @s add "berpUser"')
  }
  public onDisabled(): void {
    return
  }
  private _listener(): void {
    this._connection.on('text', (packet) => {
      if (packet.type !== 'json_whisper') return
      const parsedMessage: RawText = JSON.parse(packet.message)
      if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
      const data = JSON.parse(parsedMessage.rawtext[0].text)
      if (this._requests.has(`${data.berp.requestId}:${data.berp.event}`)) {
        this._requests.get(`${data.berp.requestId}:${data.berp.event}`).execute(data.berp)
        this._requests.delete(`${data.berp.requestId}:${data.berp.event}`)
      }

      return this.emit('Message', data.berp)
    })
  }
  public sendMessage(options: JsonRequest, callback: (data: JsonRequest) => void): void {
    this._requests.set(`${options.berp.requestId}:${options.berp.event}`, { execute: callback })
    this._connection.sendPacket('text', {
      message: JSON.stringify(options),
      needs_translation: false,
      platform_chat_id: '',
      source_name: this._connection.getXboxProfile().extraData.displayName,
      type: 'chat',
      xuid: this._connection.getXboxProfile().extraData.XUID,
    })
  }
}
