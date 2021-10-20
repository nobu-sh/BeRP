import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class EnableRequest {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "EnableRequest"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on('Message', (packet) => {
      if (packet.event != "EnableSocket" || this._socket.enabled == true) return
      this._socket.enabled = true
      this._socket.emit("Enabled", packet)
      if (!packet.data) {
        this._pluginApi.getLogger().success("Socket connection established!")
      } else {
        this._pluginApi.getLogger().success(`Socket connection established using ${packet.data.api || "unkown"} v${packet.data.version || "unkown"} for Minecraft: Bedrock v${packet.data.mcbe || "unkown"} (${packet.data.protocol || "unkown"})!`)
        this._socket._api = packet.data.api || "unkown"
        this._socket._verison = packet.data.version || "unkown"
        this._socket._mcbe = packet.data.mcbe || "unkown"
        this._socket._protocol = packet.data.protocol || "unkown"
        this._pluginApi.getCommandManager().registerCommand({
          command: packet.data.api.toLocaleLowerCase(),
          description: "Returns information about the current socket manager.",
        }, (res) => {
          res.sender.sendMessage(`§7BeRP SocketManager is using §9${packet.data.api} v${packet.data.version}§7 for §aMinecraft: Bedrock Edition v${packet.data.mcbe} §7(§a${packet.data.protocol}§7).`)
        })
      }

      return this._socket.sendMessage({
        berp: {
          event: "EnableRequest",
          requestId: packet.requestId,
        },
      })
    })
  }
  public onDisabled(): void {
    //
  }
}
