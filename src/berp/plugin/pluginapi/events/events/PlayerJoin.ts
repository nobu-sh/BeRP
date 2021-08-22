import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { Player } from "../../player/Player"
import { EventManager } from "../EventManager"
import { PluginApi } from "../../pluginApi"

export class PlayerJoin {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('add_player', (packet) => {
      if (this._pluginApi.getPlayerManager()
        .getPlayerList()
        .has(packet.username)) return

      return this._events.emit('PlayerJoin', new Player({
        name: packet.username,
        uuid: packet.uuid,
        entityID: packet.entity_id_self,
        runtimeID: packet.runtime_entity_id,
        device: packet.device_os,
      }, this._berp, this._connection, this._pluginApi))
    })
  }
}
