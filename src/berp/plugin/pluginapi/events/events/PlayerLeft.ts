import { EventManager } from "../EventManager"

export class PlayerLeft {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.message !== '§e%multiplayer.player.left.realms') return

      return this._events.emit('PlayerLeft', this._events.getPluginApi().getPlayerManager()
        .getPlayerByName(packet.paramaters[0]))
    })
  }
}
