import { EventManager } from "../EventManager"
import { BeRP } from "src/berp"
import { ConnectionHandler } from "src/berp/network"
import { PluginApi } from "../../pluginApi"
import Jimp from "jimp"
export class ChangeSkin {
  private _events: EventManager
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  public eventName = "ChangeSkin"
  constructor(events: EventManager, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._events = events
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._connection.on('player_skin', async(packet) => {
      const skin = packet.skin.skin_data
      const arrByte = Uint8ClampedArray.from(skin.data)

      const buffer = new Uint8ClampedArray(skin.width * skin.height * 4)
      
      for(let y = 0; y < skin.height; y++) {
        for(let x = 0; x < skin.width; x++) {
          const pos = (y * skin.width + x) * 4
          buffer[pos] = arrByte[pos + 0]
          buffer[pos + 1] = arrByte[pos + 1]
          buffer[pos + 2] = arrByte[pos + 2]
          buffer[pos + 3] = arrByte[pos + 3]
        }
      }
      
      new Jimp({
        data: buffer,
        width: skin.width,
        height: skin.height, 
      },async(err, image) =>{
        return await this._events.emit('ChangeSkin', {
          raw:packet.skin,
          base64:await image.getBase64Async(Jimp.MIME_PNG),
          player:this._pluginApi.getPlayerManager().getPlayerByUUID(packet.uuid),
        })
      })
    })
  }
}
