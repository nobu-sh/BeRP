import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { PlayerOptions } from 'src/types/berp'

export class Player {
  private _name: string
  private _uuid: string
  private _entityID: bigint
  private _runtimeID: bigint
  private _device: number
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(options: PlayerOptions, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._name = options.name
    this._uuid = options.uuid
    this._entityID = options.entityID
    this._runtimeID = options.runtimeID
    this._device = options.device
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getPlayerManager().addPlayer(this)
  }
  public getName(): string { return this._name }
  public getUUID(): string { return this._uuid }
  public getEntityID(): bigint { return this._entityID }
  public getRuntimeID(): bigint { return this._runtimeID }
  public getDevice(): number { return this._device }
}
