import {
  RawText,
} from "src/types/berp"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { EventManager } from "../EventManager"
import { PluginApi } from "../../pluginApi"

export class JsonReceived {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('text', (packet) => {
      if (packet.type !== 'json_whisper') return
      const parsedMessage: RawText = JSON.parse(packet.message)
      if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
      const data = JSON.parse(parsedMessage.rawtext[0].text)

      return this._events.emit('JsonReceived', data.berp)
    })
  }
}
