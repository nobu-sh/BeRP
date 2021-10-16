import { SocketManager } from "../SocketManager"

export class GetRequests {
  private _socket: SocketManager
  public requestName = "GetRequests"
  public requests = new Map<string, {request: string, params: string}>()
  constructor(socket: SocketManager) {
    this._socket = socket
  }
  public onEnabled(): void {
    this._socket.on("Enabled", () => {
      this._socket.sendMessage({
        berp: {
          event: "GetRequests",
          requestId: this._socket.newUUID(),
        },
      }, (res) => {
        for (const request of res.data) {
          this.requests.set(request.request, request)
        }
      })
    })

    this._socket.on('Message', (packet) => {
      if (packet.event != "EnableSocket" || this._socket.enabled == true) return
      this._socket.enabled = true
      this._socket.emit("Enabled", packet)

      return this._socket.sendMessage({
        berp: {
          event: "GetRequests",
          requestId: packet.requestId,
        },
      })
    })
  }
  public onDisabled(): void {
    //
  }
  public getRequests(): Map<string, {request: string, params: string}> { return this.requests }
}
