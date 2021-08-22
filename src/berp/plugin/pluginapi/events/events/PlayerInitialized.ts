import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"

export class PlayerInitialized {
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
      if (packet.message !== '§e%multiplayer.player.joined.realms') return
      const spawn = this._connection.getGameInfo().spawn_position
      this._pluginApi.getCommandManager()
        .executeCommand(`tp "${packet.paramaters[0]}" ${spawn.x} ${spawn.y} ${spawn.z}`)

      return this._events.emit('PlayerInitialized', packet.paramaters[0])
    })
  }
}
