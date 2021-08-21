import { EventManager } from "../EventManager"

export class PlayerLeft {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.message !== '§e%multiplayer.player.left.realms') return
      const player = this._events.getPluginApi().getPlayerManager()
        .getPlayerByName(packet.paramaters[0])
      this._events.getPluginApi().getPlayerManager()
        .removePlayer(player)

      return this._events.emit('PlayerLeft', player)
    })
  }
}
