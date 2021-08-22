import { JsonData } from "src/types/berp"
import { EventManager } from "../EventManager"

export class PlayerMessage {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.on('JsonReceived', (packet: JsonData) => {
      if (packet.event !== 'PlayerMessage') return

      return this._events.emit('PlayerMessage', {
        sender: this._events.getPluginApi().getPlayerManager()
          .getPlayerByName(packet.sender),
        message: packet.message,
      })
    })
    this._events.getConnection().on('text', (packet) => {
      if (packet.type !== 'chat') return

      return this._events.emit('PlayerMessage', {
        sender: this._events.getPluginApi().getPlayerManager()
          .getPlayerByName(packet.source_name),
        message: packet.message,
      })
    })
  }
}
