import { Logger } from '../../../console'
import {
  examplePluginConfig,
} from 'src/types/berp'
import { BeRP } from '../../'
import { ConnectionHandler } from 'src/berp/network'
import { CommandManager } from './command/CommandManager'
import { PlayerManager } from './player/PlayerManager'
import { WorldManager } from './world/WorldManager'
import { SocketManager } from './socket/SocketManager'
import { EventManager } from './events/EventManager'

export class PluginApi {
  private _berp: BeRP
  private _logger: Logger
  private _config: examplePluginConfig
  private _connection: ConnectionHandler
  private _apiId: number
  private _commandManager: CommandManager
  private _playerManager: PlayerManager
  private _worldManager: WorldManager
  private _socketManager: SocketManager
  private _eventManager: EventManager
  public path: string
  constructor (berp: BeRP, config: examplePluginConfig, path: string, connection: ConnectionHandler, apiId: number) {
    this._berp = berp
    this._logger = new Logger(`${config.displayName} ${connection.realm.id}`, config.color)
    this._config = config
    this._connection = connection
    this._apiId = apiId
    this._playerManager = new PlayerManager(this._berp, this._connection, this)
    this._socketManager = new SocketManager(this._berp, this._connection, this)
    this._eventManager = new EventManager(this._berp, this._connection, this)
    this._commandManager = new CommandManager(this._berp, this._connection, this)
    this._worldManager = new WorldManager(this._berp, this._connection, this)
    this.path = path
  }
  public onEnabled(): void {
    this._commandManager.onEnabled()
    this._playerManager.onEnabled()
    this._worldManager.onEnabled()
    this._socketManager.onEnabled()
    this._eventManager.onEnabled()
  }
  public onDisabled(): void {
    this._commandManager.onDisabled()
    this._playerManager.onDisabled()
    this._worldManager.onDisabled()
    this._socketManager.onDisabled()
    this._eventManager.onDisabled()
  }
  public getLogger(): Logger { return this._logger }
  public getConnection(): ConnectionHandler { return this._connection }
  public getConfig(): examplePluginConfig { return this._config }
  public getApiId(): number { return this._apiId }
  public getCommandManager(): CommandManager { return this._commandManager }
  public getPlayerManager(): PlayerManager { return this._playerManager }
  public getWorldManager(): WorldManager { return this._worldManager }
  public getSocketManager(): SocketManager { return this._socketManager }
  public getEventManager(): EventManager { return this._eventManager }
}
