import {
  RawText,
  JsonData,
} from "src/types/berp"
import { EventManager } from "../EventManager"

export class JsonRecieved {
  private _events: EventManager
  constructor(events: EventManager) {
    this._events = events
    this._events.getConnection().on('text', (packet) => {
      if (packet.type !== 'json_whisper') return
      const parsedMessage: RawText = JSON.parse(packet.message)
      if (!parsedMessage.rawtext[0].text.startsWith('{"berp":')) return
      const data: JsonData = JSON.parse(parsedMessage.rawtext[0].text)

      return this._events.emit('JsonRecieved', data)
    })
  }
}
