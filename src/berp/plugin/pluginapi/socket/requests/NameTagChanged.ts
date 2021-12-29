import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class NameTagChanged {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "NameTagChanged"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("NameTagChanged", (packet) => {
      if (!this._pluginApi.getPlayerManager().getPlayerList()
        .has(packet.player) || packet.player === this._connection.getXboxProfile().extraData.displayName) return
      const player = this._pluginApi.getPlayerManager().getPlayerByName(packet.player)
      player.setNameTagBackDoor(packet.data.new)
    })
  }
  public onDisabled(): void {
    //
  }
}
