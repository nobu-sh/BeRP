import {
  AccountInfo,
  AuthenticationResult,
} from "@azure/msal-node"
import { BeRP } from "../"
import { Logger } from '../../console'
import { ConnectionHandler } from "./ConnectionHandler"
import * as C from '../../Constants'
import { RealmAPIWorld } from "src/types/berp"

export class ConnectionManager {
  private _berp: BeRP
  private _logger: Logger
  private _account: AccountInfo
  private _accountAuthRes: AuthenticationResult
  private _accountAuthRefresh: NodeJS.Timer
  private _connections = new Map<number, ConnectionHandler>()
  constructor(account: AccountInfo, berp: BeRP) {
    this._berp = berp
    this._account = account
    this._logger = new Logger(`Connection Manager (${account.username})`, "#ff9169")
    this._startAuthRefresh()
    this._logger.success("Initialized")
  }
  public getAccount(): AccountInfo { return this._account }
  public getLogger(): Logger { return this._logger }
  public getConnections(): Map<number, ConnectionHandler> { return this._connections }

  private _startAuthRefresh(): void {
    this._accountAuthRefresh = setInterval(async () => {
      await this._authRefresh()
    }, 1000 * 60 * 60 * 12) // every 12 hours
  }

  private async _authRefresh(): Promise<void> {
    try {
      const res = await this._berp.getAuthProvider().aquireTokenFromCache({
        scopes: C.Scopes,
        account: this._account,
      })

      this._accountAuthRes = res
    } catch (error) {
      this._logger.error(`Failed to refresh auth flow for "${this._account.username}". Terminating all connections and removing account from cache. Please reauth!\n`, error)
      this.kill()
      this._berp.getAuthProvider().getCache()
        .removeAccount(this._account)
    }
  }

  public kill(): void {
    if (this._accountAuthRefresh) {
      clearInterval(this._accountAuthRefresh)
    }
    this.closeAll()
  }

  public closeAll(): void {
    if (this._connections.size) {
      for (const [, connection] of this._connections) {
        connection.close()
      }
    }
  }
  public closeSingle(id: number): void {
    const connection = this._connections.get(id)
    if (connection) {
      connection.close()
    }
  }

  public async newConnection(host: string, port: number, realm: RealmAPIWorld): Promise<ConnectionHandler> {
    return new Promise(async (r, rj) => {
      try {
        if (!this._accountAuthRes) await this._authRefresh()
        const newConnection = new ConnectionHandler(host, port, realm, this, this._berp)
        const xsts = await this._berp.getAuthProvider()
          .ezXSTSForRealmRak(this._accountAuthRes)
        await newConnection.authMc(xsts)
        this._connections.set(realm.id, newConnection)

        newConnection.once('rak_ready', () => {
          r(newConnection)
        })

        newConnection.connect()
      } catch (error) {
        rj(error)
      }
    })
  }

}
