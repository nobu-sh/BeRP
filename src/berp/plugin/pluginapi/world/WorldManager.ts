import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'

export class WorldManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public async onEnabled(): Promise<void> {
    return 
  }
  public async onDisabled(): Promise<void> {
    return
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw @a {"rawtext":[{"text":"${message}"}]}`)
  }
  public kickAll(reason: string): void {
    for (const [, player] of this._pluginApi.getPlayerManager().getPlayerList()) {
      player.kick(reason)
    }
  }
}
