import { BeRP } from '../../../'
import { EventEmitter } from 'events'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../PluginApi'
import { defaultEvents } from './events/index'

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
  public async onEnabled(): Promise<void> {
    return 
  }
  public async onDisabled(): Promise<void> {
    return
  }
  private _registerEvents(): void {
    for (const event of defaultEvents) {
      const newEvent = new event(this, this._berp, this._connection, this._pluginApi)
      this._events.set(newEvent.eventName, newEvent)
    }
  }
}
