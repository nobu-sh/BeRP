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
      if (spawn.y == 32767) spawn.y = 10
      this._pluginApi.getCommandManager().executeCommand('tag @s add "berpUser"')
      this._pluginApi.getCommandManager().executeCommand(`tp @s ${spawn.x} ${spawn.y} ${spawn.z}`)
      this._pluginApi.getCommandManager().executeCommand('effect @s invisibility 20 255 true')
    }, 2500)
    this._init()
  }
  private _init(): void {
    setTimeout(() => {
      this._pluginApi.getCommandManager().executeCommand('list', (err, res) => {
        if (err) return console.log(err)
        const players = res.output[1].paramaters[0].split(', ')
        for (const player of players) {
          if (player == this._connection.getXboxProfile().extraData.displayName) continue
          this._pluginApi.getCommandManager().executeCommand(`kick "${player}" §bBeRP Initialized`)
        }
      })
    }, 2500)
  }
  public kill(): void {
    clearInterval(this._inv)
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw @a {"rawtext":["text":"${message}"]}`)
  }
}
