import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"

export class External extends BaseCommand {
  private _berp: BeRP
  public name = "external"
  public description = "Connect to a external server using your microsoft account."
  public usage = "<ip> <port>"
  public aliases = [
    "x",
    "ex",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public async execute(args: string[]): Promise<void> {
    if (!args[0]) return this._berp.getCommandHandler().error(`Invalid argument at "${this.name} >>${args[0] || " "}<<".`)
    if (!args[1]) return this._berp.getCommandHandler().error(`Invalid argument at "${this.name}  ${args[0]} >>${args[1] || " "}<<".`)
    const ip = args[0]
    const port = parseInt(args[1])

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
  
            let net = this._berp.getNetworkManager().getAccounts()
              .get(account.username)
            if (!net) {
              net = this._berp.getNetworkManager().create(account)
            }
  
            net.newConnection(ip, port, {
              activeSlot: 1,
              id: port,
              clubId: port,
              name: ip,
              owner: "unkown",
              ownerUUID: "unkown",
            } as any)
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
