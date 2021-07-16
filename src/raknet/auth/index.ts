import {
  PublicClientApplication, Configuration, 
} from '@azure/msal-node'
import cachePlugin from './cachePlugin'
import { resolve } from 'path'
import fs from 'fs'

const msalCacheDir = resolve(process.cwd(), 'msal-cache')

fs.mkdirSync(msalCacheDir, { recursive: true })

const clientConfig: Configuration = {
  auth: {
    clientId: "d4e8e17a-f8ae-47b8-a392-8b76fcdb10d2",
    authority: "https://login.microsoftonline.com/consumers",
  },
  cache: {
    cachePlugin: cachePlugin(resolve(msalCacheDir, 'cache.json')),
  },
}

const msalApp = new PublicClientApplication(clientConfig)


msalApp.acquireTokenByDeviceCode({
  scopes: ["Xboxlive.signin", "Xboxlive.offline_access"],
  timeout: 200000,
  
  deviceCodeCallback(response) {
    console.log("DEVICE CODE CALLBACK")
    console.log(response)
  },
}).then((res) => {
  console.log(res.accessToken)
})
  .catch((err) => {
    throw err
  })

export = "please work"
