import { overrideProcessConsole } from './utils'
import { resolve } from 'path'
import * as C from './Constants'
import { NetworkManager } from './raknet/Manager'

const host = "20.81.70.242"
const port = 30192

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))

import AuthHandler from './auth'
const auth = new AuthHandler({
  clientId: C.AzureClientID,
  authority: C.AuthEndpoints.MSALAuthority,
  cacheDir: resolve(process.cwd(), 'msal-cache'),
})

auth.createApp(auth.createConfig())

auth.selectUser()
  .then(async res => {
    const result = await auth.ezXSTSForRealmRak(res)
    const net = new NetworkManager(host, port, C.CUR_VERSION)
    await net.authMc(result)
    
    net.getRaknet().on('connected', () => {
      const login = net.getPacketHandler().createUnencryptedPacket('login', net.createLoginPayload())
      net.getRaknet().writeRaw(login)
    })
    
    net.connect()
  })
