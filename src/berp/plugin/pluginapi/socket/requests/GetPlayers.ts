import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../..'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class GetPlayers {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "GetPlayers"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("Enabled", () => {
      this._socket.sendPacket("GetPlayers", undefined, (res) => {
        for (const entry of res.data) {
          if (!this._pluginApi.getPlayerManager().getPlayerList()
            .has(entry.name)) continue
          if (entry.name == this._connection.getXboxProfile().extraData.displayName) continue
          const player = this._pluginApi.getPlayerManager().getPlayerByName(entry.name)
          if (player.getNameTag() == entry.nameTag) continue
          player.setNameTagBackDoor(entry.nameTag)
        }
      })
    })
  }
  public onDisabled(): void {
    //
  }
}
