import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from "chalk"

export class Account extends BaseCommand {
  private _berp: BeRP
  public name = "account"
  public description = "Microsoft account manager."
  public usage = "<add|remove|list>"
  public aliases = [
    "acc",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public async execute(args: string[]): Promise<void> {
    if (!args[0] || !["add","list","remove"].includes(args[0].toLowerCase())) {
      return this._berp.getCommandHandler().error(`Invalid argument at "${this.name} >>${args[0] || " "}<<".`)
    }
    switch(args[0].toLowerCase()) {
    case "list":
      const accounts = await this._berp
        .getAuthProvider()
        .getCache()
        .getAllAccounts()
        
      if (accounts.length) {
        console.log(`${chalk.blueBright('Active BeRP Session - accounts - list:')}\n${accounts.map(i => `${chalk.gray(`  -  ${i.name} (${i.username})`)}`).join('\n')}`)
      } else {
        console.log(`${chalk.blueBright('Active BeRP Session - accounts - list:')}\n  ${chalk.red("No current account sessions. Try adding an account with \"account add\"")}`)
      }
      break
    case "add":
      this._berp.getConsole().startSelectPrompt(chalk.blueBright("Please Select A Login Method"), ["Device OAuth Grant", "Username & Password"])
        .then((res) => {
          if (res) {
            switch(res.toLowerCase()) {
            case "device oauth grant":
            
              break
            case "username & password":
              this._berp.getConsole().sendAuth()
                .then(res => {
                  console.log(res)
                })
              break
            }
          }
        })
        .catch((err)=>{ console.log(err) })
      break
    case "remove":
      break
    }
  }
}
