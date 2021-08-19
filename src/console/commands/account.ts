import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from "chalk"
import * as Constants from '../../Constants'
import readline from 'readline'
import { DeviceCodeRequest } from "@azure/msal-node"
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
      this._listAccounts()
      break
    case "add":
      this._addAccount()
      break
    case "remove":
      this._removeAccount()
      break
    }
  }
  private async _listAccounts(): Promise<void> {
    const accounts = await this._berp
      .getAuthProvider()
      .getCache()
      .getAllAccounts()
      
    if (accounts.length) {
      console.log(`${chalk.blueBright('Active BeRP Session - accounts - list:')}\n${accounts.map(i => `${chalk.gray(`  -  ${i.name} (${i.username})`)}`).join('\n')}`)
    } else {
      console.log(`${chalk.blueBright('Active BeRP Session - accounts - list:')}\n  ${chalk.red("No current account sessions. Try adding an account with \"account add\"")}`)
    }
  }
  private _addAccount(): void {
    this._berp.getConsole().stop()

    const deviceCodeRequest: DeviceCodeRequest = {
      scopes: Constants.Scopes,
      deviceCodeCallback: (device) => {
        console.log(chalk.blueBright(`BeRP Microsoft Account Link:\n${chalk.grey(`-  Navigate to ${chalk.cyan(device.verificationUri)}.`)}\n${chalk.grey(`-  Use the code ${chalk.cyan(device.userCode)} to link your account.`)}`))
      },
    }

    let tempConsole = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "",
    })
    const disposeTempConsole = (): void => {
      if (tempConsole) {
        tempConsole.removeAllListeners('line')
        tempConsole.close()
        tempConsole = undefined
        this._berp.getConsole().start()
      }
    }
    tempConsole.on('line', (l) => {
      if (l.toLowerCase() === 'cancel') {
        this._berp.getCommandHandler().error("Canceled BeRP Microsoft Account Link")
        disposeTempConsole()
        deviceCodeRequest.cancel = true
      }
    })

    this._berp.getLogger().info("Attempting oauth device grant please follow all instructions given below or type \"cancel\" to quit!")
    this._berp.getAuthProvider()
      .createDeviceOauthGrant(deviceCodeRequest)
      .then(res => {
        disposeTempConsole()
        this._berp.getAuthProvider()
          .getLogger()
          .success("Successfully added new account", `${res.account.name} (${res.account.username})`)
      })
      .catch(err => {
        if (!deviceCodeRequest.cancel) {
          disposeTempConsole()
          this._berp.getAuthProvider()
            .getLogger()
            .error("Failed to add new account...\n", err)
        }
      })
  }
  private async _removeAccount(): Promise<void> {
    const accounts = await this._berp.getAuthProvider()
      .getCache()
      .getAllAccounts()
    
    if (!accounts) return this._berp.getCommandHandler().error("There are no active accounts linked to BeRP!")

    this._berp.getConsole()
      .sendSelectPrompt("Select which account you would like to remove", accounts.map(a => `${a.name} (${a.username})`))
      .then((r) => {
        if (r) {
          const username = /\(.*\)/.exec(r)[0].replace(/(\(|\))/g, "")
          const account = accounts.find(a => a.username === username)
          if (!account) return this._berp.getAuthProvider()
            .getLogger()
            .error(`Failed to remove account "${username}"`)
          
          this._berp.getAuthProvider()
            .getCache()
            .removeAccount(account)
            .then(() => {
              this._berp.getAuthProvider()
                .getLogger()
                .success(`Successfully removed account "${username}"`)
            })
            .catch((e) => {
              this._berp.getAuthProvider()
                .getLogger()
                .error(`Failed to remove account "${username}"...\n`, e)
            })
        }
      })
  }
}
