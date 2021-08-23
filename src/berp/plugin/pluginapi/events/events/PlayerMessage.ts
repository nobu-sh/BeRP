import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"

export class PlayerMessage {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getSocketManager().on('Message', (packet) => {
      if (packet.event !== 'PlayerMessage') return

      return this._events.emit('PlayerMessage', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.sender),
        message: packet.message,
      })
    })
    this._connection.on('text', (packet) => {
      if (packet.type !== 'chat') return

      return this._events.emit('PlayerMessage', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.source_name),
        message: packet.message,
      })
    })
  }
}
