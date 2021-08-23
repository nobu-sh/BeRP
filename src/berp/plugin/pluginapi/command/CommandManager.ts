import { BeRP } from '../../../'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import { v4 as uuidv4 } from 'uuid'
import { packet_command_output } from 'src/types/packets.i'
import {
  CommandMapOptions,
  CommandOptions,
  CommandResponse,
} from 'src/types/berp'
import {
  CUR_VERSION_PROTOCOL,
  CUR_VERSION,
  BeRP_VERSION,
} from '../../../../Constants'

export class CommandManager {
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _requests = new Map<string, string>()
  private _commandCache = new Map<string, packet_command_output>()
  private _prefix = "-"
  private _commands = new Map<string, CommandMapOptions>()
  private _inv
  constructor(berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('command_output', (packet) => {
      if (!packet) return
      this._commandCache.set(packet.origin.uuid, packet)
    })
    this._inv = setInterval(() => {
      for (const [request, command] of this._requests) {
        this._connection.sendPacket('command_request', {
          command: command,
          interval: false,
          origin: {
            uuid: request,
            request_id: request,
            type: 'player',
          },
        })
        this._requests.delete(request)
      }
    })
    this._pluginApi.getEventManager().on('ChatCommand', (data) => {
      const parsedCommand = this._parseCommand(data.command)
      if (!this._commands.has(parsedCommand.command)) return data.sender.sendMessage("§cThis command doesn't exsist!")
      const commandData = this._commands.get(parsedCommand.command)
      if (!commandData.options.permissionTags) return commandData.execute({
        sender: data.sender,
        args: parsedCommand.args,
      })
      const tags: string[] = data.sender.getTags()
      const found = tags.some(r => commandData.options.permissionTags.indexOf(r) >= 0)
      if (!found) return data.sender.sendMessage('§cYou dont have permission to use this command!')

      return commandData.execute({
        sender: data.sender,
        args: parsedCommand.args,
      })
    })
    this._defaultCommands()
  }
  private _defaultCommands(): void {
    this.registerCommand({
      command: 'help',
      description: 'Displays a list of commands on the server.',
      aliases: ['h'],
    }, (data) => {
      data.sender.sendMessage('§bShowing all Available Commands:')
      this._commands.forEach((command) => {
        if (!command.showInList) return
        data.sender.sendMessage(` §7${this._prefix}${command.options.command}§r §o§8- ${command.options.description}§r`)
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
  private _parseCommand(content: string): { command: string, args: string[] } {
    const command = content.replace(this._prefix, '').split(' ')[0]
    const args = content.replace(`${this._prefix}${command} `, '').split(' ')

    return {
      command: command,
      args: args,
    }
  }
  private _findResponse(requestID: string): Promise<packet_command_output> {
    this._connection.sendCommandFeedback(true)

    return new Promise((res) => {
      const inv = setInterval(() => {
        const cache = this._commandCache.get(requestID)
        if (!cache) return
        this._commandCache.delete(requestID)
        clearInterval(inv)
        this._connection.sendCommandFeedback(false)

        return res(cache)
      })
    })
  }
  public async executeCommand(command: string, callback?: (err: any, res: packet_command_output) => void): Promise<void> {
    if (command.startsWith('say' || 'tellraw' || 'me' || 'msg' || 'titleraw')) callback = undefined
    try {
      const requestID = uuidv4()
      this._requests.set(requestID, command)
      if (callback) {
        const response = await this._findResponse(requestID)

        return callback(undefined, response)
      } else {
        return
      }
    } catch (error) {
      if (callback) {
        return callback(error, undefined)
      } else {
        console.log(error)
      }
    }
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
  public getPrefix(): string { return this._prefix }
  public setPrefix(prefix: string): void { this._prefix = prefix }
  public kill(): void {
    clearInterval(this._inv)
  }
}
