import { BeRP } from '../../../'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from '../pluginApi'
import { v4 as uuidv4 } from 'uuid'
import { packet_command_output } from 'src/types/packets.i'
import {
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
  private _inv
  private _disabled = false
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
    this._pluginApi.getEventManager().on('ChatCommand', async (data) => {
      if (this._pluginApi.getApiId() != 1) return
      this._berp.getCommandManager().executeCommand(data)
    })
    this._defaultCommands()
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
    if (this._disabled) return
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
    this._berp.getCommandManager().registerCommand(options, (data) => {
      callback(data)
    }) 
  }
  public getPrefix(): string { return this._berp.getCommandManager().getPrefix() }
  public setPrefix(prefix: string): void { this._berp.getCommandManager().setPrefix(prefix) }
  public kill(): void {
    this._disabled = true
    clearInterval(this._inv)
  }
}
