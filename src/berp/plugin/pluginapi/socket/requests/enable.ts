import { SocketManager } from "../SocketManager"

export class EnableRequest {
  private _socket: SocketManager
  public requestName = "EnableRequest"
  constructor(socket: SocketManager) {
    this._socket = socket
  }
  public onEnabled(): void {
    this._socket.on('Message', (packet) => {
      if (packet.event != "EnableSocket" || this._socket.enabled == true) return
      this._socket.enabled = true
      this._socket.emit("Enabled", packet)

      return this._socket.sendMessage({
        berp: {
          event: "EnableRequest",
          requestId: packet.requestId,
        },
      })
    })
  }
  public onDisabled(): void {
    //
  }
}
