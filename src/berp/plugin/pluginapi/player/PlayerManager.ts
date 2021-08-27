import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { Player } from './Player'

export class PlayerManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _players = {
    name: new Map<string, Player>(),
    uuid: new Map<string, Player>(),
    xuid: new Map<string, Player>(),
    entityID: new Map<bigint, Player>(),
  }
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public addPlayer(player: Player): void {
    this._players.name.set(player.getName(), player)
    this._players.uuid.set(player.getUUID(), player)
    this._players.xuid.set(player.getXuid(), player)
    this._players.entityID.set(player.getEntityID(), player)
  }
  public removePlayer(player: Player): void {
    this._players.name.delete(player.getName())
    this._players.uuid.delete(player.getUUID())
    this._players.xuid.delete(player.getXuid())
    this._players.entityID.delete(player.getEntityID())
  }
  public getPlayerByName(name: string): Player { return this._players.name.get(name) }
  public getPlayerByUUID(uuid: string): Player { return this._players.uuid.get(uuid) }
  public getPlayerByXuid(xuid: string): Player { return this._players.xuid.get(xuid) }
  public getPlayerByEntityID(entityID: bigint): Player { return this._players.entityID.get(entityID) }
  public getPlayerList(): Map<string, Player> { return this._players.name }
}
