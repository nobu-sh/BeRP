import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from 'chalk'
export class Connections extends BaseCommand {
  private _berp: BeRP
  public name = "connections"
  public description = "Get a list of all current realm connection."
  public usage = ""
  public aliases = [
    "cs",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    const accounts = this._berp.getNetworkManager().getAccounts()
    let log = `${chalk.blueBright("Active BeRP Session - Connections:")}\n`
    if (!accounts.size) return console.log(log += chalk.red("  No active connections. Use \"connect\" to connect a realm!"))

    const lastAct = Array.from(accounts.keys())[accounts.size - 1]
    log += chalk.gray(`  │\n`)  
    for (const [username, conn] of accounts) {
      if (username === lastAct) {
        log += chalk.gray(`  └──${username}\n`)
      } else {
        log += chalk.gray(`  ├──${username}\n`)
      }
      if (conn.getConnections().size) {
        const lastCon = Array.from(conn.getConnections().keys())[conn.getConnections().size - 1]
        for (const [id, con] of conn.getConnections()) {
          if (username !== lastAct) {
            log += chalk.gray(`  │`)
          } else {
            log += chalk.gray(`   `)
          }
          if (lastCon === id) {
            log += chalk.gray(`  └──${con.realm.name.replace(/§\S/g, "")} (${id})\n`)
          } else {
            log += chalk.gray(`  ├──${con.realm.name.replace(/§\S/g, "")} (${id})\n`)
          }
        }
      }
      if (username !== lastAct) log += chalk.gray(`  │\n`)
    }

    console.log(log)
  }
}
// ─│├ └
