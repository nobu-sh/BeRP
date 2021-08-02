import { ConnectionManager } from './connectionManager'
import { resolve } from 'path'
import AuthHandler from '../auth'
import * as Constants from '../Constants'


export class NetworkManager {
  private connections = new Map<string, ConnectionManager>()
  private authProvider = new AuthHandler({
    clientId: Constants.AzureClientID,
    authority: Constants.AuthEndpoints.MSALAuthority,
    cacheDir: resolve(process.cwd(), 'msal-cache'),
  })
  constructor() {

    this.authProvider.createApp(this.authProvider.createConfig())
  }
  public getConnections(): Map<string, ConnectionManager> { return this.connections }
  public getAuthProvider(): AuthHandler { return this.authProvider }

  public async createConnection(host: string, port: number): Promise<ConnectionManager> {
    // TODO: Declare what plugins will be used on this connection
    return new Promise((r, rj) => {
      this.authProvider.selectUser()
        .then(async (res) => {
          const xsts = await this.authProvider.ezXSTSForRealmRak(res)
          // console.log(await this.authProvider.ezXSTSForRealmAPI(res))
          const newConnection = new ConnectionManager(host, port)
          await newConnection.authMc(xsts)
          this.connections.set(host, newConnection)
          
          newConnection.once("remove_from_connections", () => {
            this.connections.delete(host)
          })
          newConnection.once('rak_ready', () => {
            r(newConnection)
          })


          newConnection.connect()
        })
        .catch((err) => rj(err))
    })
  }
  public closeConnection(host: string): void {
    const connection = this.connections.get(host)
    if (connection) {
      connection.close()
    }
  }
}
