import { Logger } from "../console"
import { Commands } from "./commands"
import { BaseCommand } from "./commands/base/BaseCommand"
import { BeRP } from "../berp"
import chalk from "chalk"

class CommandHandler {
  private _berp: BeRP
  private _commands: BaseCommand[] = []
  private _logger = new Logger("CLI Command Handler", '#ff6969')
  constructor(berp: BeRP) {
    this._berp = berp
    this._buildCommands()

    this._berp.getConsole().on('input', this._handleConsole.bind(this))

    this._logger.success('BeRP Command Handler Initialized')
  }
  public getLogger(): Logger { return this._logger }

  private _handleConsole(i: string):void {
    const args = i.split(/ /g).filter(i => i.length > 0)
    if (!args[0]) return
    const commandName = args.shift().toLowerCase()
    const command = this._commands.find(c => c.name === (commandName) || c.aliases.includes(commandName))
    
    if (!command) return console.log(chalk.red(`Invalid commmand "${commandName}" use "help" to see all commands!`))
    
    try {
      command.execute(args)
    } catch (error) {
      this._logger.error(error)
    }
  }
  private _buildCommands(): void {
    for (const command of Commands) {
      this._commands.push(new command(this._berp))
    }
  }

  public registerCommand(command: BaseCommand): void {
    this._commands.push(command)
  }

  public getCommands(): Map<string, BaseCommand> {
    const map = new Map<string, BaseCommand>()
    for (const command of this._commands) {
      map.set(command.name, command)
    }

    return map
  }

  public error(err: string): void {
    console.error(chalk.red(err))
  }

} 

export { CommandHandler }
