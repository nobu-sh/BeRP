import { BeRP } from '../../../'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import { v4 as uuidv4 } from 'uuid'
import { packet_command_output } from 'src/types/packets.i'
import {
  CommandOptions,
  CommandResponse,
  ConsoleCommandOptions,
} from 'src/types/berp'
import {
  CUR_VERSION_PROTOCOL,
  CUR_VERSION,
  BeRP_VERSION,
} from '../../../../Constants'
import { ConsoleCommand } from './ConsoleCommand'

export class CommandManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _requests = new Map<string, {execute: CallableFunction}>()
  private _commands = new Map<string, {type: "game" | "console", command: CommandOptions | ConsoleCommandOptions}>()
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public async onEnabled(): Promise<void> {
    this._connection.on('command_output', (packet) => {
      if (!packet) return
      if (!this._requests.has(packet.origin.uuid)) return
      this._requests.get(packet.origin.uuid).execute(packet)
    })
    this._pluginApi.getEventManager().on('ChatCommand', async (data) => {
      if (this._pluginApi.getPluginId() != 1) return
      this._berp.getCommandManager().executeCommand(data)
      this._connection.sendCommandFeedback(false)
    })
    this._defaultCommands()

    return
  }
  public async onDisabled(): Promise<void> {
    for (const [, command] of this._commands) {
      if (command.command.command == "help" || command.command.command == "about") continue
      this._berp.getCommandManager().unregisterCommand(command.command, command.type)
    }
  }
  private _defaultCommands(): void {
    this.registerCommand({
      command: 'help',
      description: `Displays a list of available commands.`,
      aliases: ['h'],
    }, (data) => {
      data.sender.sendMessage(`§bShowing all Available Commands:`)
      this._berp.getCommandManager().getCommands()
        .forEach((command) => {
          if (!command.showInList) return
          data.sender.sendMessage(` §7${this._berp.getCommandManager().getPrefix()}${command.options.command}§r §o§8- ${command.options.description}§r`)
        })
    })
    this.registerCommand({
      'command': 'about',
      'description': 'Shows info about the server.',
      'aliases': ['ab'],
    }, (data) => {
      data.sender.sendMessage(`§7This server is running §9BeRP v${BeRP_VERSION}§7 for §aMinecraft: Bedrock Edition v${CUR_VERSION} §7(§a${CUR_VERSION_PROTOCOL}§7).`)
    })
  }
  public executeCommand(command: string, callback?: (res: packet_command_output) => void): void {
    if (command.startsWith('say' || 'tellraw' || 'me' || 'msg' || 'titleraw')) callback = undefined
    const requestId = uuidv4()
    if (callback) {
      this._connection.sendCommandFeedback(true)
      this._requests.set(requestId, { execute: callback })
    }
    this._connection.sendPacket('command_request', {
      command: command,
      interval: false,
      origin: {
        uuid: requestId,
        request_id: requestId,
        type: 'player',
      },
    })
  }
  public registerCommand(options: CommandOptions, callback: (data: CommandResponse) => void): void {
    this._commands.set(`${options.command}:game`, {
      type: 'game',
      command: options,
    })
    this._berp.getCommandManager().registerCommand(options, (data) => {
      callback(data)
    }) 
  }
  public registerConsoleCommand(options: ConsoleCommandOptions, callback: (args: string[]) => void): void {
    this._commands.set(`${options.command}:console`, {
      type: 'console',
      command: options,
    })
    const command = new ConsoleCommand(options, callback)
    this._berp.getCommandHandler().registerCommand(command)
  }
  public getPrefix(): string { return this._berp.getCommandManager().getPrefix() }
  public setPrefix(prefix: string): void { this._berp.getCommandManager().setPrefix(prefix) }
}
