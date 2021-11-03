import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"

export class Disconnect extends BaseCommand {
  private _berp: BeRP
  public name = "disconnect"
  public description = "Disconnect from a realm."
  public usage = ""
  public aliases = [
    "dc",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    const accounts = this._berp.getNetworkManager().getAccounts()
    if (!accounts.size) return this._berp.getCommandHandler().error("There are no active connections!")

    const accountsWithActualConnections = Array.from(accounts.entries())
      .filter(([,v]) => v.getConnections().size > 0)

    if (!accountsWithActualConnections.length) return this._berp.getCommandHandler().error("There are no active connections!")

    this._berp.getConsole()
      .sendSelectPrompt("Select an account to manage its connections", accountsWithActualConnections.map(([,v]) => `${v.getAccount().name} (${v.getAccount().username})`))
      .then(r => {
        if (r) {
          try {
            const username = /\(.*\)/.exec(r)[0].replace(/(\(|\))/g, "")
            const account = accounts.get(username)
            if (!account) {
              return this._berp.getNetworkManager().getLogger()
                .error(`Failed to select account "${username}"`)
            }
            const connections = Array.from(account.getConnections().entries())
            this._berp.getConsole()
              .sendSelectPrompt("Select which realm you would like to disconnect from", connections.map(([k,v]) => `${v.realm.name.replace(/§\S/g, "")} (${k})`))
              .then(async (r) => {
                if (r) {
                  try {
                    const id = /\(.*\)/.exec(r)[0].replace(/(\(|\))/g, "")
                    const realm = account.getConnections().get(parseInt(id))
                    if (!realm) {
                      return this._berp.getNetworkManager().getLogger()
                        .error(`Failed to select realm "${r}"`)
                    }
                    await this._berp.getPluginManager().killPlugins(realm)
                    realm.close()
                  } catch (error) {
                    return this._berp.getNetworkManager().getLogger()
                      .error(`Failed to select account for realm disconnection...\n`, error)
                  }
                } else {
                  this._berp.getCommandHandler().error("Disconnection process canceled!")
                }
              })
          } catch (error) {
            return this._berp.getNetworkManager().getLogger()
              .error(`Failed to select account for realm disconnection...\n`, error)
          }
        } else {
          this._berp.getCommandHandler().error("Disconnection process canceled!")
        }
      })
  }
}
