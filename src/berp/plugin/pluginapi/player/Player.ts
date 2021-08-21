import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'

export class Player {
  private _name: string
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(name: string, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._name = name
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getPlayerManager().addPlayer(this)
  }
  getName(): string { return this._name }
}
