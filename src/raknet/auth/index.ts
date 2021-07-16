import {
  PublicClientApplication, Configuration, DeviceCodeRequest, AuthenticationResult, TokenCache, SilentFlowRequest,
} from '@azure/msal-node'
import cachePlugin from './cachePlugin'
import { resolve } from 'path'
import fs from 'fs'
import { AuthHandlerOptions } from 'src/berp'

class AuthHandler {
  private _options: AuthHandlerOptions
  private _msalApp: PublicClientApplication
  constructor(options: AuthHandlerOptions) {
    if (!options) throw new Error("Invalid AuthHandler Options")
    this._options = options
    
    fs.mkdirSync(options.cacheDir, { recursive: true })
  }
  public createConfig(): Configuration {
    return {
      auth: {
        clientId: this._options.clientId,
        authority: this._options.authority,
      },
      cache: {
        cachePlugin: cachePlugin(resolve(this._options.cacheDir, "cache.json")),
      },
    }
  }
  public createApp(config: Configuration): void {
    this._msalApp = new PublicClientApplication(config)
  }
  /**
   * Creates Auth Link For User To Auth With
   * @returns {Promise<AuthenticationResult>} Authenticated User Info 
   */
  public createDeviceOauthGrant(request: DeviceCodeRequest): Promise<AuthenticationResult> {
    return this._msalApp.acquireTokenByDeviceCode(request)
  }
  /**
   * Auths a user via username and password. As far as I know this is not multi-factor compatible
   * @param username Username For Account
   * @param password Password For Account
   * @param scopes Access Scopes
   * @returns {Promise<AuthenticationResult>} Authenticated User Info 
   */
  public authByUsernameAndPass(username: string, password: string, scopes: string[]): Promise<AuthenticationResult> {
    return this._msalApp.acquireTokenByUsernamePassword({
      username,
      password,
      scopes,
    })
  }
  /**
   * Gets User Cache
   */
  public getCache(): TokenCache {
    return this._msalApp.getTokenCache()
  }
  /**
   * Attempts to get token from cache
   * 
   * Handles refreshing automatically
   */
  public aquireTokenFromCache(request: SilentFlowRequest): Promise<AuthenticationResult> {
    return this._msalApp.acquireTokenSilent(request)
  }
}

export = AuthHandler
