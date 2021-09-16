import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"

export class PlayerLeft {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public eventName = "PlayerLeft"
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('player_list', (packet) => {
      for (const record of packet.records.records) {
        if (packet.records.type != 'remove') continue
        const player = this._pluginApi.getPlayerManager().getPlayerByUUID(record.uuid)
        this._pluginApi.getPlayerManager()
          .removePlayer(player)

        return this._events.emit('PlayerLeft', player)
      }
    })
  }
}
