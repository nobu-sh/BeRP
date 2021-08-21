import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import {
  PlayerJoin,
  PlayerLeft,
  PlayerInitialized,
  PlayerMessage,
} from './events/index'
import { PluginApi } from '../pluginApi'

export class EventManager extends EventEmitter {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _events = new Map<string, any>()
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    super()
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._registerEvents()
  }
  private _registerEvents(): void {
    const PlayerJoinEvent = new PlayerJoin(this)
    this._events.set('PlayerJoined', PlayerJoinEvent)
    const PlayerLeftEvent = new PlayerLeft(this)
    this._events.set('PlayerLeft', PlayerLeftEvent)
    const PlayerInitializedEvent = new PlayerInitialized(this)
    this._events.set('PlayerInitialized', PlayerInitializedEvent)
    const PlayerMessageEvent = new PlayerMessage(this)
    this._events.set('PlayerMessage', PlayerMessageEvent)
  }
  public getBerp(): BeRP { return this._berp }
  public getConnection(): ConnectionHandler { return this._connection }
  public getPluginApi(): PluginApi { return this._pluginApi }
}
