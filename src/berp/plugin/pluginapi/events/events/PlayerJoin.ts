import { Player } from "../../player/Player"
import { EventManager } from "../EventManager"

export class PlayerJoin {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('add_player', (packet) => {
      if (this._events.getPluginApi().getPlayerManager()
        .getPlayerList()
        .has(packet.username)) return

      return this._events.emit('PlayerJoin', new Player({
        name: packet.username,
        uuid: packet.uuid,
        entityID: packet.entity_id_self,
        runtimeID: packet.runtime_entity_id,
        device: packet.device_os,
      }, this._events.getBerp(), this._events.getConnection(), this._events.getPluginApi()))
    })
  }
}
