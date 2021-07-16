import { overrideProcessConsole } from './utils'
import { resolve } from 'path'

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))


import AuthHandler from './raknet/auth'

const scopes = ["Xboxlive.signin", "Xboxlive.offline_access"]
const auth = new AuthHandler({
  clientId: "d4e8e17a-f8ae-47b8-a392-8b76fcdb10d2",
  authority: "https://login.microsoftonline.com/consumers",
  cacheDir: resolve(process.cwd(), 'msal-cache'),
})

auth.createApp(auth.createConfig())

// Attempt to get user from cache
auth.getCache().getAllAccounts()
  .then((res) => {
    // No cached users
    if (!res || res.length < 1) {
      console.log("Could Not Find Any Cached Accounts, Please Sign In!")

      // Create oauth device grant
      auth.createDeviceOauthGrant({
        scopes,
        deviceCodeCallback(device) {
          console.log(device.message)
        },
      })
        .then((user) => {
          if (!user) {
            throw new Error("There Was An Error Authenticating")
          } else {
            // Successful login
            console.log("Logged In As User", user.account.name)
          }
        })
        .catch((err) => { throw err })

    } else {
      // Found cached accounts
      console.log("Found Account(s)", res.map(a => a.name))
      
      // Implement way to choose what account
      // For time being it just selects first

      auth.aquireTokenFromCache({
        scopes,
        account: res[0], 
      })
        .then((user) => {
          if (!user) {
            throw new Error("There Was An Error Authenticating")
          } else {
            // Successful cache fetch
            console.log("Logged In As User", user.account.name)
          }
        })
        .catch((err) => { throw err })
    }
  })
  .catch((err) => { throw err })
