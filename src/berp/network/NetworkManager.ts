import { ConnectionManager } from './ConnectionHandler'
import { AuthHandlerXSTSResponse } from '../../types/berp'
import { BeRP } from '../'
import { Logger } from '../../console'
export class NetworkManager {
  private _berp: BeRP
  private _logger = new Logger('Network Manager', "#ff9169")
  private _connections = new Map<string, ConnectionManager>()
  constructor(berp: BeRP) {
    this._berp = berp
    this._logger.success("Network Manager Initialized")
  }
  public getConnections(): Map<string, ConnectionManager> { return this._connections }
  public getLogger(): Logger { return this._logger }
  
  public async createConnection(host: string, port: number, xsts: AuthHandlerXSTSResponse): Promise<ConnectionManager> {
    // TODO: Declare what plugins will be used on this connection
    return new Promise(async (r, rj) => {
      const newConnection = new ConnectionManager(host, port)
      await newConnection.authMc(xsts)
      this._connections.set(host, newConnection)

      newConnection.once("remove_from_connections", () => {
        this._connections.delete(host)
        rj("Connection error before ready")
      })
      newConnection.once('rak_ready', () => {
        r(newConnection)
      })

      newConnection.connect()
    })
  }
  public closeConnection(host: string): void {
    const connection = this._connections.get(host)
    if (connection) {
      connection.close()
    }
  }
}
