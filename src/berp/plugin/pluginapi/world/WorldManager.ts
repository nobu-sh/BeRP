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
  public onEnabled(): void {
    return 
  }
  public onDisabled(): void {
    return
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw @a {"rawtext":[{"text":"${message}"}]}`)
  }
}
