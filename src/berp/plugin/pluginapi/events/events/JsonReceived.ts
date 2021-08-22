import {
  RawText,
} from "src/types/berp"
import { EventManager } from "../EventManager"

export class JsonReceived {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.type !== 'json_whisper') return
      const parsedMessage: RawText = JSON.parse(packet.message)
      if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
      const data = JSON.parse(parsedMessage.rawtext[0].text)

      return this._events.emit('JsonReceived', data.berp)
    })
  }
}
