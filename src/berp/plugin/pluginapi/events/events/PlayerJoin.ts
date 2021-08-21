import { Player } from "../../player/Player"
import { EventManager } from "../EventManager"

export class PlayerJoined {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.message !== '§e%multiplayer.player.joined.realms') return

      return this._events.emit('PlayerJoined', new Player(packet.paramaters[0], this._events.getBerp(), this._events.getConnection(), this._events.getPluginApi()))
    })
  }
}
