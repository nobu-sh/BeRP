import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import {
  BlockPos, EntityOptions, 
} from 'src/types/berp'

export class Entity {
  private _id: string
  private _nameTag: string
  private _runtimeId: number
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi

  constructor(options: EntityOptions, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._id = options.id
    this._nameTag = options.nameTag
    this._runtimeId = options.runtimeId
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getEntityManager().addEntity(this)
  }
  public getID(): string { return this._id }
  public getNameTag(): string { return this._nameTag }
  public getRuntimeID(): number { return this._runtimeId }
  public executeCommand(command: string): void {
    this._pluginApi.getSocketManager().sendMessage({
      berp: {
        event: "UpdateEntity",
        entity: this._runtimeId,
        data: {
          command: command,
        },
        requestId: this._pluginApi.getSocketManager().newUUID(),
      },
    })
  }
  public setNameTag(nameTag: string): void {
    this._nameTag = nameTag
    this._pluginApi.getSocketManager().sendMessage({
      berp: {
        event: "UpdateEntity",
        entity: this._runtimeId,
        data: {
          nameTag: nameTag,
        },
        requestId: this._pluginApi.getSocketManager().newUUID(),
      },
    })
  }
  public async getLocation(): Promise<BlockPos> {
    return new Promise((res) => {
      this._pluginApi.getSocketManager().sendMessage({
        berp: {
          event: "EntityRequest",
          entity: this._runtimeId,
          requestId: this._pluginApi.getSocketManager().newUUID(),
        },
      }, (packet) => {
        if (!packet.entity) return res({
          x: 0,
          y: 0,
          z: 0, 
        })

        return res(packet.entity.location)
      })
    })
  }
}
