import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'

export class WorldManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _inv
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._inv = setInterval(() => {
      const spawn = this._connection.getGameInfo().spawn_position
      this._pluginApi.getCommandManager().executeCommand(`tp @s ${spawn.x} ${spawn.y} ${spawn.z}`)
    }, 2500)
  }
  public kill(): void {
    clearInterval(this._inv)
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw @a {"rawtext":["text":"${message}"]}`)
  }
}
