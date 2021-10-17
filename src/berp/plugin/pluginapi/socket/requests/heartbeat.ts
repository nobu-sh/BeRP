import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class Heartbeat {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  private _totalBeats: number
  public requestName = "Heartbeat"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._totalBeats = 0
  }
  public onEnabled(): void {
    this._socket.on('Message', (packet) => {
      if (packet.event != "Heartbeat") return
      this._totalBeats++
    })
  }
  public onDisabled(): void {
    //
  }
  public getTotalBeats(): number { return this._totalBeats }
}
