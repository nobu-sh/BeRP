import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"
import { Entity } from "../../entity/Entity"

export class GetEntities {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "GetEntities"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("Enabled", () => {
      this._socket.sendPacket("GetEntities", undefined, (res) => {
        for (const entity of res.data) {
          if (this._pluginApi.getEntityManager().getEntities()
            .has(entity.runtimeId)) continue
          new Entity({
            id: entity.id,
            nameTag: entity.nameTag,
            runtimeId: entity.runtimeId,
          }, this._berp, this._connection, this._pluginApi)
        }
      })
    })
  }
  public onDisabled(): void {
    //
  }
}
