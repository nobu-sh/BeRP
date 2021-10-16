import { Logger } from '../../../console'
import {
  examplePlugin,
  examplePluginConfig,
} from 'src/types/berp'
import { BeRP } from '../../'
import { ConnectionHandler } from 'src/berp/network'
import { CommandManager } from './command/CommandManager'
import { PlayerManager } from './player/PlayerManager'
import { WorldManager } from './world/WorldManager'
import { SocketManager } from './socket/SocketManager'
import { EventManager } from './events/EventManager'
import fs from 'fs'
import path from 'path'

export class PluginApi {
  private _berp: BeRP
  private _logger: Logger
  private _config: examplePluginConfig
  private _connection: ConnectionHandler
  private _apiId: number
  private _pluginId: number
  private _commandManager: CommandManager
  private _playerManager: PlayerManager
  private _worldManager: WorldManager
  private _socketManager: SocketManager
  private _eventManager: EventManager
  private _temp: boolean
  public path: string
  constructor (berp: BeRP, config: examplePluginConfig, path: string, connection: ConnectionHandler, apis: { apiId: number, pluginId: number }, temp = false) {
    this._berp = berp
    this._logger = new Logger(`${config.displayName} ${connection.realm.id || 1320}`, config.color)
    this._config = config
    this._connection = connection
    this._apiId = apis.apiId
    this._pluginId = apis.pluginId
    this._temp = temp
    this.path = path
    if (this._temp) return
    this._playerManager = new PlayerManager(this._berp, this._connection, this)
    this._socketManager = new SocketManager(this._berp, this._connection, this)
    this._eventManager = new EventManager(this._berp, this._connection, this)
    this._commandManager = new CommandManager(this._berp, this._connection, this)
    this._worldManager = new WorldManager(this._berp, this._connection, this)
  }
  public async onEnabled(): Promise<void> {
    if (this._temp) return
    await this._commandManager.onEnabled()
    await this._playerManager.onEnabled()
    await this._worldManager.onEnabled()
    await this._socketManager.onEnabled()
    await this._eventManager.onEnabled()

    return
  }
  public async onDisabled(): Promise<void> {
    if (this._temp) return
    await this._commandManager.onDisabled()
    await this._playerManager.onDisabled()
    await this._worldManager.onDisabled()
    await this._socketManager.onDisabled()
    await this._eventManager.onDisabled()

    return
  }
  public getLogger(): Logger { return this._logger }
  public getConnection(): ConnectionHandler { return this._connection }
  public getConfig(): examplePluginConfig { return this._config }
  public getApiId(): number { return this._apiId }
  public getPluginId(): number { return this._pluginId }
  public getCommandManager(): CommandManager { return this._commandManager }
  public getPlayerManager(): PlayerManager { return this._playerManager }
  public getWorldManager(): WorldManager { return this._worldManager }
  public getSocketManager(): SocketManager { return this._socketManager }
  public getEventManager(): EventManager { return this._eventManager }
  public getPlugins(): Map<string, {config: examplePluginConfig, plugin: examplePlugin, api: PluginApi, connection: ConnectionHandler, path: string}> {
    const plugins = new Map<string, {config: examplePluginConfig, plugin: examplePlugin, api: PluginApi, connection: ConnectionHandler, path: string}>()
    for (const [, entry] of this._berp.getPluginManager().getActivePlugins()) {
      if (this._connection !== entry.connection) continue
      plugins.set(entry.config.name, entry)
    }

    return plugins
  }
  public createInterface(options: {name: string, interface: string}): void {
    setTimeout(() => {
      for (const [, entry] of this.getPlugins()) {
        fs.writeFileSync(path.resolve(entry.path, 'src', '@interface', `${options.name}.i.ts`), options.interface)
      }
    }, 1000)
  }
}
