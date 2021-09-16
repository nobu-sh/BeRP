import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"

export class PlayerDied {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public eventName = "PlayerDied"
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('text', (packet) => {
      if (!packet.message.startsWith('death') || packet.paramaters[0] == this._connection.getXboxProfile().extraData.displayName) return

      return this._events.emit('PlayerDied', {
        player: this._pluginApi.getPlayerManager().getPlayerByName(packet.paramaters[0]),
        killer: this._pluginApi.getPlayerManager().getPlayerByName(packet.paramaters[1]) || packet.paramaters[1],
        cause: packet.message.replace('death.', '').replace(/.generic/g, ''),
      })
    })
  }
}
