import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { EntityOptions } from 'src/types/berp'

export class Entity {
  private _id: string
  private _nameTag: string
  private _runtimeId: number
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi

  constructor(options: EntityOptions, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._id = options.id
    this._nameTag = options.nameTag
    this._runtimeId = options.runtimeId
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getEntityManager().addEntity(this)
  }
  public getID(): string { return this._id }
  public getNameTag(): string { return this._nameTag }
  public getRuntimeID(): number { return this._runtimeId }
}
