import { SocketManager } from "../SocketManager"

export class Heartbeat {
  private _socket: SocketManager
  private _totalBeats: number
  public requestName = "Heartbeat"
  constructor(socket: SocketManager) {
    this._socket = socket
    this._totalBeats = 0
  }
  public onEnabled(): void {
    this._socket.on('Message', (packet) => {
      if (packet.event != "Heartbeat") return
      this._totalBeats++
    })
  }
  public onDisabled(): void {
    //
  }
  public getTotalBeats(): number { return this._totalBeats }
}
