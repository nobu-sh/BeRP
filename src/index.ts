import {
  overrideProcessConsole,
  createXBLToken,
} from './utils'
import { resolve } from 'path'
import * as C from './Constants'
import Axios from 'axios'

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))

import AuthHandler from './auth'
const auth = new AuthHandler({
  clientId: C.AzureClientID,
  authority: C.AuthEndpoints.MSALAuthority,
  cacheDir: resolve(process.cwd(), 'msal-cache'),
})

auth.createApp(auth.createConfig())

import crypto from 'crypto'
const SALT = '🧂'
const curve = 'secp384r1'

const ecdhKeyPair = crypto.generateKeyPairSync('ec', { namedCurve: curve })
const publicKeyDER = ecdhKeyPair.publicKey.export({
  format: 'der',
  type: 'spki',
})
const privateKeyPEM = ecdhKeyPair.privateKey.export({
  format: 'pem',
  type: 'sec1',
})
const clientX509 = publicKeyDER.toString('base64')

auth.selectUser()
  .then(async res => {
    const result = await auth.ezXSTSForRealmRak(res)
    Axios({
      method: 'post',
      url: C.AuthEndpoints.MinecraftAuth,
      headers: C.MinecraftAuthHeaders(createXBLToken(result)),
      data: {
        identityPublicKey: clientX509,
      },
    })
      .then(({ data }) => {
        console.log(data.chain)
      })
  })
