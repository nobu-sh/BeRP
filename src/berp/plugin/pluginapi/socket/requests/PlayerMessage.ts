import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class PlayerMessage {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "PlayerMessage"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("PlayerMessage", (packet) => {
      if (!packet.message.startsWith(this._pluginApi.getCommandManager().getPrefix())) return this._pluginApi.getEventManager().emit("PlayerMessage", {
        message: packet.message,
        sender: this._pluginApi.getPlayerManager().getPlayerByName(packet.player.name || packet.player.nameTag),
      })

      return this._pluginApi.getEventManager().emit("ChatCommand", {
        command: packet.message,
        sender: this._pluginApi.getPlayerManager().getPlayerByName(packet.player.name || packet.player.nameTag),
      })
    })
  }
  public onDisabled(): void {
    //
  }
}
