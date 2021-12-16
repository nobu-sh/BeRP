import {
  RealmAPIJoinInfo,
  RealmAPIWorldsRes,
} from "../../types/berp"
import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import * as C from '../../Constants'
import { createXBLToken } from '../../berp/utils'

export class Connect extends BaseCommand {
  private _berp: BeRP
  public name = "connect"
  public description = "Connect account to realm."
  public usage = ""
  public aliases = [
    "c",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public async execute(): Promise<void> {
    const accounts = await this._berp
      .getAuthProvider()
      .getCache()
      .getAllAccounts()

    if (!accounts.length) return this._berp.getCommandHandler().error("There are no active accounts linked to BeRP! Please use \"account add\" to link a new account!")

    this._berp.getConsole()
      .sendSelectPrompt("Select which account you would like to use", accounts.map(a => `${a.name} (${a.username})`))
      .then(async (r) => {
        if (r) {
          try {
            const username = /\(.*\)/.exec(r)[0].replace(/(\(|\))/g, "")
            const account = accounts.find(a => a.username === username)
            if (!account) {
              return this._berp.getNetworkManager().getLogger()
                .error(`Failed to select account "${username}"`)
            }
  
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
  
            const curRealms = Array.from(net.getConnections().keys())

            const req = new this._berp.Request({
              method: "GET",
              url: C.Endpoints.RealmAPI.GET.Realms,
              headers: C.RealmAPIHeaders(createXBLToken(xsts)),
            }, {
              requestTimeout: 50000,
              attemptTimeout: 300,
              attempts: 20,
            })
            req.onFufilled = (res: RealmAPIWorldsRes) => {
              if (!res.servers || !res.servers.length) return net.getLogger().error(`No realms could be found under the account "${account.username}"`)
              this._berp.getConsole()
                .sendSelectPrompt("Select which realm you would like to connect to", res.servers.filter(i => !i.expired && !curRealms.includes(i.id)).map(a => `${a.name.replace(/§\S/g, "")} (${a.id})`))
                .then(async (r) => {
                  if (r) {
                    try {
                      const id = /\(.*\)/.exec(r)[0].replace(/(\(|\))/g, "")
                      const realm = res.servers.find(r => r.id === parseInt(id.replace(new RegExp(/\D/gm,'g'),'')))
                      if (!realm) {
                        return this._berp.getNetworkManager().getLogger()
                          .error(`Failed to select realm`)
                      }

                      // console.log(createXBLToken(xsts))

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
                      }
                      req.onFailed = () => {
                        return net.getLogger().error(`Failed to get join info for realm "${realm.name}"`)
                      }
                      this._berp.getSequentialBucket().addRequest(req)
                    } catch (error) {
                      this._berp.getNetworkManager().getLogger()
                        .error(`Failed to select account for realm connection...\n`, error)
                    }
                  } else {
                    this._berp.getCommandHandler().error("Connection process canceled!")
                  }
                })
            }
            req.onFailed = () => {
              return net.getLogger()
                .error(`Failed to select account for realm connection...`)
            }
            this._berp.getSequentialBucket().addRequest(req)
          } catch (error) {
            this._berp.getNetworkManager().getLogger()
              .error(`Failed to select account for realm connection...\n`, error)
          }
        } else {
          this._berp.getCommandHandler().error("Connection process canceled!")
        }
      })
  }
}
