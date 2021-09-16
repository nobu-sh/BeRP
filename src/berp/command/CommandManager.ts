import {
  ChatCommand,
  CommandMapOptions,
  CommandOptions,
  CommandResponse,
  ConsoleCommandOptions,
} from 'src/types/berp'
import { BeRP } from '..'

export class CommandManager {
  private _berp: BeRP
  private _prefix = '-'
  private _commands = new Map<string, CommandMapOptions>()
  constructor(berp: BeRP) {
    this._berp = berp
  }
  private _parseCommand(content: string): { command: string, args: string[] } {
    const command = content.replace(this._prefix, '').split(' ')[0]
    const args = content.replace(`${this._prefix}${command} `, '').split(' ')
    if (args[0] == `${this._prefix}${command}`) args[0] = undefined

    return {
      command: command,
      args: args,
    }
  }
  public async executeCommand(data: ChatCommand): Promise<void> {
    const parsedCommand = this._parseCommand(data.command)
    if (!this._commands.has(parsedCommand.command)) return data.sender.sendMessage("§cThis command doesn't exsist!")
    const commandData = this._commands.get(parsedCommand.command)
    if (!commandData.options.permissionTags) return commandData.execute({
      sender: data.sender,
      args: parsedCommand.args,
    })
    const tags: string[] = await data.sender.getTags()
    const found = tags.some(r => commandData.options.permissionTags.indexOf(r) >= 0)
    if (!found) return data.sender.sendMessage('§cYou dont have permission to use this command!')

    return commandData.execute({
      sender: data.sender,
      args: parsedCommand.args,
    })
  }
  public registerCommand(options: CommandOptions, callback: (data: CommandResponse) => void): void {
    if (this._commands.has(options.command)) return
    this._commands.set(options.command, {
      options: options,
      showInList: true,
      execute: callback,
    })
    if (!options.aliases) return
    for (const aliases of options.aliases) {
      if (this._commands.has(aliases)) continue
      this._commands.set(aliases, {
        options: options,
        showInList: false,
        execute: callback,
      })
    }
  }
  public unregisterCommand(options: CommandOptions | ConsoleCommandOptions, type: "game" | "console"): void {
    switch (type) {
    case "game":
      if (!this._commands.has(options.command)) return
      this._commands.delete(options.command)
      if (!options.aliases) return
      for (const aliases of options.aliases) {
        this._commands.delete(aliases)
      }
      break
    case "console":
      this._berp.getCommandHandler().unregisterCommand(options as ConsoleCommandOptions)
      break
    default:
      this._berp.getLogger().error('Unknown unregister type!')
      break
    }
  }
  public getCommands(): Map<string, CommandMapOptions> { return this._commands }
  public getPrefix(): string { return this._prefix }
  public setPrefix(prefix: string): void { this._prefix = prefix }
}
