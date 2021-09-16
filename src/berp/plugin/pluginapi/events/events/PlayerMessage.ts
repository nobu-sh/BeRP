import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"

export class PlayerMessage {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public eventName = "PlayerMessage"
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getSocketManager().on('Message', (packet) => {
      if (packet.event !== 'PlayerMessage' || packet.sender == this._connection.getXboxProfile().extraData.displayName) return
      let sender
      if (packet.sender != undefined) {
        sender = this._pluginApi.getPlayerManager().getPlayerByName(packet.sender)
      } else {
        sender = this._pluginApi.getPlayerManager().getPlayerByNameTag(packet.player.nameTag)
      }

      if (!packet.message.startsWith(this._pluginApi.getCommandManager().getPrefix())) return this._events.emit('PlayerMessage', {
        sender: sender,
        message: packet.message,
      })

      if (sender.getRealmID() != this._connection.realm.id) return

      return this._events.emit('ChatCommand', {
        sender: sender,
        command: packet.message,
      })
    })
    this._connection.on('text', (packet) => {
      if (packet.type !== 'chat' || packet.source_name == this._connection.getXboxProfile().extraData.displayName) return
      const sender = this._pluginApi.getPlayerManager().getPlayerByName(packet.source_name)

      if (!packet.message.startsWith(this._pluginApi.getCommandManager().getPrefix())) return this._events.emit('PlayerMessage', {
        sender: sender,
        message: packet.message,
      })

      if (sender.getRealmID() != this._connection.realm.id) return

      return this._events.emit('ChatCommand', {
        sender: sender,
        command: packet.message,
      })
    })
  }
}
