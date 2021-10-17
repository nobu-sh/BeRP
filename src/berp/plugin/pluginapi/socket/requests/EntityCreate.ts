import { Entity } from "../../entity/Entity"
import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class EntityCreate {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "EntityCreate"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("EntityCreate", (packet) => {
      new Entity({
        id: packet.entity.id,
        nameTag: packet.entity.nameTag,
        runtimeId: packet.entity.runtimeId,
      }, this._berp, this._connection, this._pluginApi)
    })
  }
  public onDisabled(): void {
    //
  }
}
