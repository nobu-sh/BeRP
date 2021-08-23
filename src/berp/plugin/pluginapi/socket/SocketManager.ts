import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import { RawText } from 'src/types/berp'

export class SocketManager extends EventEmitter {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    super()
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('text', (packet) => {
      if (packet.type !== 'json_whisper') return
      const parsedMessage: RawText = JSON.parse(packet.message)
      if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
      const data = JSON.parse(parsedMessage.rawtext[0].text)

      return this.emit('MessageReceived', data.berp)
    })
  }
}
