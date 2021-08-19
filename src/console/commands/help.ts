import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from "chalk"

export class Help extends BaseCommand {
  private _berp: BeRP
  public name = "help"
  public description = "Get a list of all available commands or info on a specfic command."
  public usage = "[command]"
  public aliases = [
    "h",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(args: string[]): void {
    const commands = this._berp.getCommandHandler().getCommands()

    if (!args[0]) {
      let log = `${chalk.blueBright("Active BeRP Session - Command List:")}\n`
      for (const command of commands.values()) {
        log += `${chalk.gray("  -")}   ${chalk.grey(`${command.name}`)}\n`
      }
      console.log(log)
    } else {
      const commandName = args[0].toLowerCase()
      const command = [...commands.values()].find(c => c.name === commandName || c.aliases.includes(commandName))

      if (!command) return this._berp.getCommandHandler().error(`Unknown commmand "${commandName}"!`)

      console.log(`${chalk.blueBright(`Active BeRP Session - Command - ${commandName}:`)}\n${chalk.gray("  name:")}           ${chalk.gray(command.name)}\n${chalk.gray("  usage:")}          ${command.usage ? `${chalk.gray(commandName)} ${chalk.gray(command.usage)}` : ""}\n${chalk.gray("  description:")}    ${chalk.gray(command.description)}\n${chalk.gray("  aliases:")}        ${chalk.gray(command.aliases?.join(chalk.gray(", ")))}\n`)
    }
  }
}
