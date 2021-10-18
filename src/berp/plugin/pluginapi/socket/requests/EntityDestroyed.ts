import { SocketManager } from "../SocketManager"
import { BeRP } from '../../../../'
import { PluginApi } from '../../pluginApi'
import { ConnectionHandler } from "src/berp/network"

export class EntityDestroyed {
  private _socket: SocketManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public requestName = "EntityDestroyed"
  constructor(socket: SocketManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._socket = socket
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
  }
  public onEnabled(): void {
    this._socket.on("EntityDestroyed", (packet) => {
      if (!this._pluginApi.getEntityManager().getEntities()
        .has(packet.entity.runtimeId)) return
      const entity = this._pluginApi.getEntityManager().getEntityByRuntimeID(packet.entity.runtimeId)
      this._pluginApi.getEntityManager().removeEntity(entity)
    })
  }
  public onDisabled(): void {
    //
  }
}
