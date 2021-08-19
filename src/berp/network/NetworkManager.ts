import { Logger } from "../../console"
import { BeRP } from ".."
import { ConnectionManager } from "./ConnectionManager"
import { AccountInfo } from "@azure/msal-node"

export class NetworkManager {
  private _berp: BeRP
  private _accounts = new Map<string, ConnectionManager>()
  private _logger = new Logger("Network Manager")
  constructor(berp: BeRP) {
    this._berp = berp

    this._logger.success("Initialized")
  }
  public getAccounts(): Map<string, ConnectionManager> { return this._accounts }
  public getLogger(): Logger { return this._logger }

  public create(accountInfo: AccountInfo): ConnectionManager {
    if (!this._accounts.get(accountInfo.username)) {
      const con = new ConnectionManager(accountInfo, this._berp)
      this._accounts.set(accountInfo.username,con)

      return con
    }
  }
  public delete(username: string): void {
    const account = this._accounts.get(username)
    if (account) {
      account.kill()
      this._accounts.delete(username)
    }
  }

  public kill(): void {
    for (const [u, cm] of this._accounts) {
      cm.kill()
      this._accounts.delete(u)
    }
  }

}
