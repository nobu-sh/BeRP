import { Logger } from "../console"
import { Commands } from "./commands"
import { BaseCommand } from "./commands/base/BaseCommand"
import { BeRP } from "../berp"
import chalk from "chalk"
import { ConsoleCommandOptions } from "src/types/berp"

class CommandHandler {
  private _berp: BeRP
  private _commands = new Map<string, {options: BaseCommand, showInList: boolean}>()
  private _logger = new Logger("CLI Command Handler", '#ff6969')
  constructor(berp: BeRP) {
    this._berp = berp
    this._buildCommands()

    this._berp.getConsole().on('input', this._handleConsole.bind(this))

    this._logger.success('Type "help" for a list of commands.')
  }
  public getLogger(): Logger { return this._logger }

  private _handleConsole(i: string):void {
    const args = i.split(/ /g).filter(i => i.length > 0)
    if (!args[0]) return
    const commandName = args.shift().toLowerCase()
    const command = this._commands.get(commandName)
    
    if (!command) return console.log(chalk.red(`Invalid commmand "${commandName}" use "help" to see all commands!`))
    
    try {
      command.options.execute(args)
    } catch (error) {
      this._logger.error(error)
    }
  }
  private _buildCommands(): void {
    for (const command of Commands) {
      const newCommand = new command(this._berp)
      this._commands.set(newCommand.name, {
        options: newCommand,
        showInList: true,
      })
      for (const aliases of newCommand.aliases) {
        this._commands.set(aliases, {
          options: newCommand,
          showInList: false,
        })
      }
    }
  }

  public registerCommand(command: BaseCommand): void {
    this._commands.set(command.name, {
      options: command,
      showInList: true,
    })
    for (const aliases of command.aliases) {
      this._commands.set(aliases, {
        options: command,
        showInList: false,
      })
    }
  }

  public unregisterCommand(command: ConsoleCommandOptions): void {
    if (!this._commands.has(command.command)) return
    this._commands.delete(command.command)
  }

  public getCommands(): Map<string, {options: BaseCommand, showInList: boolean}> { return this._commands }

  public error(err: string): void {
    console.error(chalk.red(err))
  }

} 

export { CommandHandler }
