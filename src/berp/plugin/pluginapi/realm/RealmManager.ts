import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { RealmAPIWorld } from 'src/types/berp'
import { AccountInfo } from '@azure/msal-node'
import { createXBLToken } from '../../../../berp/utils'
import * as C from '../../../../Constants'
import { Player } from '../player/Player'

export class RealmManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _realm: RealmAPIWorld
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._realm = this._connection.realm
  }
  public async onEnabled(): Promise<void> {
    return
  }
  public async onDisabled(): Promise<void> {
    return
  }
  public async renameRealm(name: string): Promise<void> {
    if (this._pluginApi.getConnection().realm.ownerUUID !== this._pluginApi.getConnection().getXboxProfile().extraData.XUID) return this._pluginApi.getLogger().error("The method updateRealmName() can only be used if the account being used is the realm owner.")
    const foundAccounts = new Map<string, AccountInfo>()
    const accounts = await this._berp
      .getAuthProvider()
      .getCache()
      .getAllAccounts()
    for (const account of accounts) {
      foundAccounts.set(account.username, account)
    }
    const account = foundAccounts.get(this._pluginApi.getConnection().getConnectionManager()
      .getAccount().username)
    const authRes = await this._berp.getAuthProvider().aquireTokenFromCache({
      scopes: C.Scopes,
      account,
    })
    const xsts = await this._berp.getAuthProvider().ezXSTSForRealmAPI(authRes)
    const req = new this._berp.Request({
      method: "POST",
      url: C.Endpoints.RealmAPI.POST.RealmConfiguration(this._connection.realm.id),
      headers: C.RealmAPIHeaders(createXBLToken(xsts)),
      body: {
        description: {
          description: "Powered By BeRP.",
          name: name,
        },
        options: {
          texturePacksRequired: true,
        },
      },
    }, {
      requestTimeout: 50000,
      attemptTimeout: 300,
      attempts: 20,
    })
    req.onFufilled = () => {
      return
    }
    req.onFailed = (err) => {
      this._pluginApi.getLogger().error("Failed to rename the realm...", err)
    }
    this._berp.getSequentialBucket().addRequest(req)
  }
  public async closeRealm(): Promise<boolean | unknown> {
    if (this._pluginApi.getConnection().realm.ownerUUID !== this._pluginApi.getConnection().getXboxProfile().extraData.XUID) return this._pluginApi.getLogger().error("The method closeRealm() can only be used if the account being used is the realm owner.")
    
    return new Promise(async (r) => {
      const foundAccounts = new Map<string, AccountInfo>()
      const accounts = await this._berp
        .getAuthProvider()
        .getCache()
        .getAllAccounts()
      for (const account of accounts) {
        foundAccounts.set(account.username, account)
      }
      const account = foundAccounts.get(this._pluginApi.getConnection().getConnectionManager()
        .getAccount().username)
      const authRes = await this._berp.getAuthProvider().aquireTokenFromCache({
        scopes: C.Scopes,
        account,
      })
      const xsts = await this._berp.getAuthProvider().ezXSTSForRealmAPI(authRes)
      const req = new this._berp.Request({
        method: "PUT",
        url: C.Endpoints.RealmAPI.PUT.RealmClose(this._realm.id),
        headers: C.RealmAPIHeaders(createXBLToken(xsts)),
      }, {
        requestTimeout: 50000,
        attemptTimeout: 300,
        attempts: 20,
      })
      req.onFufilled = () => {
        this._pluginApi.getLogger().success("Successfully closed the realm.")

        return r(true)
      }
      req.onFailed = (err) => {
        this._pluginApi.getLogger().error("Failed to close realm...", err)

        return r(false)
      }
      this._berp.getSequentialBucket().addRequest(req)
    })
  }
  public async openRealm(): Promise<boolean | unknown> {
    if (this._pluginApi.getConnection().realm.ownerUUID !== this._pluginApi.getConnection().getXboxProfile().extraData.XUID) return this._pluginApi.getLogger().error("The method openRealm() can only be used if the account being used is the realm owner.")
    
    return new Promise(async (r) => {
      const foundAccounts = new Map<string, AccountInfo>()
      const accounts = await this._berp
        .getAuthProvider()
        .getCache()
        .getAllAccounts()
      for (const account of accounts) {
        foundAccounts.set(account.username, account)
      }
      const account = foundAccounts.get(this._pluginApi.getConnection().getConnectionManager()
        .getAccount().username)
      const authRes = await this._berp.getAuthProvider().aquireTokenFromCache({
        scopes: C.Scopes,
        account,
      })
      const xsts = await this._berp.getAuthProvider().ezXSTSForRealmAPI(authRes)
      const req = new this._berp.Request({
        method: "PUT",
        url: C.Endpoints.RealmAPI.PUT.RealmOpen(this._realm.id),
        headers: C.RealmAPIHeaders(createXBLToken(xsts)),
      }, {
        requestTimeout: 50000,
        attemptTimeout: 300,
        attempts: 20,
      })
      req.onFufilled = () => {
        this._pluginApi.getLogger().success("Successfully opened the realm.")

        return r(true)
      }
      req.onFailed = (err) => {
        this._pluginApi.getLogger().error("Failed to open realm...", err)

        return r(false)
      }
      this._berp.getSequentialBucket().addRequest(req)
    })
  }
  public async restartRealm(): Promise<boolean | unknown> {
    if (this._pluginApi.getConnection().realm.ownerUUID !== this._pluginApi.getConnection().getXboxProfile().extraData.XUID) return this._pluginApi.getLogger().error("The method restartRealm() can only be used if the account being used is the realm owner.")
    this._pluginApi.getLogger().info("Attempting to restart realm...")

    return new Promise(async (r) => {
      const close = await this.closeRealm()
      if (!close) return r(false)
      const open = await this.openRealm()
      if (!open) return r(false)
      const connect = await this._pluginApi.autoConnect(this._pluginApi.getConnection().getConnectionManager()
        .getAccount().username, this._realm.id, true)
      if (!connect) return r(false)

      return r(true)
    })
  }
  public async updatePlayerPermission(player: Player, permissionLevel: "VISITOR" | "MEMBER" | "OPERATOR"): Promise<boolean | unknown> {
    if (this._pluginApi.getConnection().realm.ownerUUID !== this._pluginApi.getConnection().getXboxProfile().extraData.XUID) return this._pluginApi.getLogger().error("The method updatePlayer() can only be used if the account being used is the realm owner.")
    
    return new Promise(async (r) => {
      const foundAccounts = new Map<string, AccountInfo>()
      const accounts = await this._berp
        .getAuthProvider()
        .getCache()
        .getAllAccounts()
      for (const account of accounts) {
        foundAccounts.set(account.username, account)
      }
      const account = foundAccounts.get(this._pluginApi.getConnection().getConnectionManager()
        .getAccount().username)
      const authRes = await this._berp.getAuthProvider().aquireTokenFromCache({
        scopes: C.Scopes,
        account,
      })
      const xsts = await this._berp.getAuthProvider().ezXSTSForRealmAPI(authRes)
      const req = new this._berp.Request({
        method: "PUT",
        url: C.Endpoints.RealmAPI.PUT.RealmUserPermission(this._realm.id),
        headers: C.RealmAPIHeaders(createXBLToken(xsts)),
        body: {
          permission: permissionLevel,
          xuid: player.getXuid(),
        },
      }, {
        requestTimeout: 50000,
        attemptTimeout: 300,
        attempts: 20,
      })
      req.onFufilled = () => {
        return r(true)
      }
      req.onFailed = (err) => {
        this._pluginApi.getLogger().error("Failed to open realm...", err)

        return r(false)
      }
      this._berp.getSequentialBucket().addRequest(req)
    })
  }
  public getId(): number { return this._realm.id }
  public getName(): string { return this._realm.name }
  public getDayTillExpired(): number { return this._realm.daysLeft }
}
