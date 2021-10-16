import { SocketManager } from "../SocketManager"

export class Message {
  private _socket: SocketManager
  public requestName = "Message"
  constructor(socket: SocketManager) {
    this._socket = socket
  }
  public onEnabled(): void {
    this._socket.on('Message', (packet) => {
      this._socket.emit(packet.event, packet)
    })
  }
  public onDisabled(): void {
    //
  }
}
