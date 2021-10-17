import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class Message {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "Message"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("Message", (packet) => {
      this._socket.emit(packet.event, packet)
    })
  }
  public onDisabled(): void {
    //
  }
}
