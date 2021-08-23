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
      console.log('fired')
      if (packet.event !== 'PlayerMessage' || packet.sender == this._connection.getXboxProfile().extraData.displayName) return

      if (packet.message.startsWith(this._pluginApi.getCommandManager().getPrefix())) return this._events.emit('ChatCommand', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.sender),
        command: packet.message,
      })

      return this._events.emit('PlayerMessage', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.sender),
        message: packet.message,
      })
    })
    this._connection.on('text', (packet) => {
      if (packet.type !== 'chat' || packet.source_name == this._connection.getXboxProfile().extraData.displayName) return

      if (packet.message.startsWith(this._pluginApi.getCommandManager().getPrefix())) return this._events.emit('ChatCommand', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.source_name),
        command: packet.message,
      })

      return this._events.emit('PlayerMessage', {
        sender: this._pluginApi.getPlayerManager()
          .getPlayerByName(packet.source_name),
        message: packet.message,
      })
    })
  }
}
