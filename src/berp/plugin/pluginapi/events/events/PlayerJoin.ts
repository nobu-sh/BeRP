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
  public eventName = "PlayerJoin"
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('player_list', (packet) => {
      for (const player of packet.records.records) {
        if (this._pluginApi.getPlayerManager().getPlayerList()
          .has(player.username) || packet.records.type != 'add') continue
        
        return this._events.emit('PlayerJoin', new Player({
          name: player.username,
          uuid: player.uuid,
          xuid: player.xbox_user_id,
          entityID: player.entity_unique_id,
          device: player.build_platform,
          skinData: player.skin_data,
        }, this._berp, this._connection, this._pluginApi))
      }
    })
  }
}
