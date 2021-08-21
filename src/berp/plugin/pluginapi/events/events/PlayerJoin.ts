import { EventManager } from "../EventManager"

export class PlayerJoined {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.message !== '§e%multiplayer.player.joined.realms') return

      return this._events.emit('PlayerJoined', packet.paramaters[0])
    })
  }
}
