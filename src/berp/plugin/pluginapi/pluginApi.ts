import { Logger } from '../../../console'
import {
  ActivePlugin,
  examplePlugin,
  examplePluginConfig,
  RealmAPIJoinInfo,
  RealmAPIWorld,
  RealmAPIWorldsRes,
} from 'src/types/berp'
import { BeRP } from '../../'
import { ConnectionHandler } from 'src/berp/network'
import { CommandManager } from './command/CommandManager'
import { PlayerManager } from './player/PlayerManager'
import { EntityManager } from './entity/EntityManager'
import { WorldManager } from './world/WorldManager'
import { RealmManager } from './realm/RealmManager'
import { SocketManager } from './socket/SocketManager'
import { EventManager } from './events/EventManager'
import fs from 'fs'
import path from 'path'
import { AccountInfo } from '@azure/msal-common'
import * as C from '../../../Constants'
import { createXBLToken } from '../../../berp/utils'

export class PluginApi {
  private _berp: BeRP
  private _logger: Logger
  private _config: examplePluginConfig
  private _connection: ConnectionHandler
  private _apiId: number
  private _pluginId: number
  private _instanceId: number
  private _commandManager: CommandManager
  private _playerManager: PlayerManager
  private _entityManager: EntityManager
  private _worldManager: WorldManager
  private _realmManager: RealmManager
  private _socketManager: SocketManager
  private _eventManager: EventManager
  private _temp: boolean
  private _hasConnected = false
  private _interval
  public path: string
  constructor (berp: BeRP, config: examplePluginConfig, path: string, connection: ConnectionHandler, apis: { apiId: number, pluginId: number, instanceId: number }, temp = false) {
    this._berp = berp
    this._logger = new Logger(`${config.displayName} ${connection.realm.id || "(Init)"}`, config.color)
    this._config = config
    this._connection = connection
    this._apiId = apis.apiId
    this._pluginId = apis.pluginId
    this._instanceId = apis.instanceId
    this._temp = temp
    this.path = path
    if (this._temp) return
    this._playerManager = new PlayerManager(this._berp, this._connection, this)
    this._entityManager = new EntityManager(this._berp, this._connection, this)
    this._socketManager = new SocketManager(this._berp, this._connection, this)
    this._eventManager = new EventManager(this._berp, this._connection, this)
    this._commandManager = new CommandManager(this._berp, this._connection, this)
    this._worldManager = new WorldManager(this._berp, this._connection, this)
    this._realmManager = new RealmManager(this._berp, this._connection, this)
  }
  public async onEnabled(): Promise<void> {
    if (this._temp) return
    await this._commandManager.onEnabled()
    await this._playerManager.onEnabled()
    await this._entityManager.onEnabled()
    await this._worldManager.onEnabled()
    await this._realmManager.onEnabled()
    await this._socketManager.onEnabled()
    await this._eventManager.onEnabled()

    return
  }
  public async onDisabled(): Promise<void> {
    clearInterval(this._interval)
    if (this._temp) return
    await this._commandManager.onDisabled()
    await this._playerManager.onDisabled()
    await this._entityManager.onDisabled()
    await this._worldManager.onDisabled()
    await this._realmManager.onDisabled()
    await this._socketManager.onDisabled()
    await this._eventManager.onDisabled()

    return
  }
  public getLogger(): Logger { return this._logger }
  public getConnection(): ConnectionHandler { return this._connection }
  public getConfig(): examplePluginConfig { return this._config }
  public getApiId(): number { return this._apiId }
  public getPluginId(): number { return this._pluginId }
  public getInstanceId(): number { return this._instanceId }
  public getCommandManager(): CommandManager { return this._commandManager }
  public getPlayerManager(): PlayerManager { return this._playerManager }
  public getEntityManager(): EntityManager { return this._entityManager }
  public getWorldManager(): WorldManager { return this._worldManager }
  public getRealmManager(): RealmManager { return this._realmManager }
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
  public getPluginByInstanceId(name: string, id: number): Promise<ActivePlugin> {
    return new Promise((res) => {
      for (const [, plugin] of this._berp.getPluginManager().getActivePlugins()) {
        if (plugin.config.name.toLocaleLowerCase() != name.toLocaleLowerCase() && plugin.ids.instance != id) continue
        
        return res(plugin)
      }
    })
  }
  public createInterface(options: {name: string, interface: string}): void {
    setTimeout(() => {
      for (const [, entry] of this.getPlugins()) {
        fs.writeFileSync(path.resolve(entry.path, 'src', '@interface', `${options.name}.i.ts`), options.interface)
      }
    }, 1000)
  }
  public async autoConnect(accountEmail: string, realmId: number, bypass = false): Promise<boolean> {
    return new Promise(async (resX) => {
      if (!this._temp && !bypass) {
        this._logger.error("AutoConnect is only allowed in the onLoaded() method!")
        
        return resX(false)
      }
      const foundAccounts = new Map<string, AccountInfo>()
      const accounts = await this._berp
        .getAuthProvider()
        .getCache()
        .getAllAccounts()
      for (const account of accounts) {
        foundAccounts.set(account.username, account)
      }
      if (!foundAccounts.has(accountEmail)) {
        this._logger.error(`No account found with the email "${accountEmail}"`)

        return resX(false)
      }
      const account = foundAccounts.get(accountEmail)
      const authRes = await this._berp.getAuthProvider().aquireTokenFromCache({
        scopes: C.Scopes,
        account,
      })
      const xsts = await this._berp.getAuthProvider().ezXSTSForRealmAPI(authRes)
  
      let net = this._berp.getNetworkManager().getAccounts()
        .get(account.username)
      if (!net) {
        net = this._berp.getNetworkManager().create(account)
      }
      const foundRealms = new Map<number, RealmAPIWorld>()
      const req = new this._berp.Request({
        method: "GET",
        url: C.Endpoints.RealmAPI.GET.Realms,
        headers: C.RealmAPIHeaders(createXBLToken(xsts)),
      }, {
        requestTimeout: 50000,
        attemptTimeout: 300,
        attempts: 20,
      })
      req.onFufilled = async (res: RealmAPIWorldsRes) => {
        if (!res.servers || !res.servers.length) return this._logger.error(`No realms could be found under the account "${account.username}"`)
        for await (const server of res.servers) {
          foundRealms.set(server.id, server)
        }
        if (!foundRealms.has(realmId)) return this._logger.error(`No realm with the Id "${realmId}" was found.`)
        const realm = foundRealms.get(realmId)
        const req = new this._berp.Request({
          method: "GET",
          url: C.Endpoints.RealmAPI.GET.RealmJoinInfo(realm.id),
          headers: C.RealmAPIHeaders(createXBLToken(xsts)),
        }, {
          requestTimeout: 50000,
          attemptTimeout: 300,
          attempts: 100,
        })
        req.onFufilled = (res: RealmAPIJoinInfo) => {
          const split = res.address.split(":")
          const ip = split[0]
          const port = parseInt(split[1])
          net.newConnection(ip, port, realm)
          this._hasConnected = true

          return resX(true)
        }
        req.onFailed = () => {
          this._logger.error(`Failed to get join info for realm "${realm.name}"`)

          return resX(false)
        }
        this._berp.getSequentialBucket().addRequest(req)
      }
      req.onFailed = () => {
        this._logger.error(`Failed to select account for realm connection...`)

        return resX(false)
      }
      this._berp.getSequentialBucket().addRequest(req)
    })
  }
  public autoReconnect(accountEmail: string, realmId: number): void {
    let tryConnection = true
    if (!this._temp) return this._logger.error("AutoReconnect is only allowed in the onLoaded() method!")
    this._interval = setInterval(async () => {
      if (!this._hasConnected || !tryConnection) return
      const accounts = this._berp.getNetworkManager().getAccounts()
      if (!accounts.has(accountEmail)) return
      const account = accounts.get(accountEmail)
      if (account.getConnections().has(realmId)) return
      this._logger.success(`AutoReconnect attempting to connect to realm Id "${realmId}" using the email "${accountEmail}"`)
      tryConnection = false
      await this.autoConnect(accountEmail, realmId)
      tryConnection = true
    }, 10000)
  }
}
