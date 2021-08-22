import { EventManager } from "../EventManager"

export class PlayerInitialized {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.message !== '§e%multiplayer.player.joined.realms') return
      const spawn = this._events.getConnection().getGameInfo().spawn_position
      this._events.getPluginApi().getCommandManager()
        .executeCommand(`tp "${packet.paramaters[0]}" ${spawn.x} ${spawn.y} ${spawn.z}`)

      return this._events.emit('PlayerInitialized', packet.paramaters[0])
    })
  }
}
