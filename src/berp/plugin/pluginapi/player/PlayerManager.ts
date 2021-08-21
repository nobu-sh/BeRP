import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { Player } from './Player'

export class PlayerManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _players = new Map<string, Player>()
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public addPlayer(player: Player): void {
    if (this._players.has(player.getName())) this.removePlayer(player)
    this._players.set(player.getName(), player)
  }
  public removePlayer(player: Player): void {
    this._players.delete(player.getName())
  }
  public getPlayerByName(name: string): Player {
    return this._players.get(name)
  }
  public getPlayerList(): Map<string, Player> { return this._players }
}
