import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { Entity } from './Entity'

export class EntityManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _entities = new Map<number, Entity>()
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
  public addEntity(entity: Entity): void {
    this._entities.set(entity.getRuntimeID(), entity)
    this._pluginApi.getEventManager().emit("EntityCreate", entity)
  }
  public removeEntity(entity: Entity): void {
    this._entities.delete(entity.getRuntimeID())
    this._pluginApi.getEventManager().emit("EntityDestroyed", entity)
  }
  public getEntityByRuntimeID(runtimID: number): Entity { return this._entities.get(runtimID) }
  public getEntities(): Map<number, Entity> { return this._entities }
}
