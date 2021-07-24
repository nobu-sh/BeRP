import {
  PublicClientApplication,
  Configuration,
  DeviceCodeRequest,
  AuthenticationResult,
  TokenCache,
  SilentFlowRequest,
} from '@azure/msal-node'
import cachePlugin from './cachePlugin'
import { resolve } from 'path'
import fs from 'fs'
import {
  AuthHandlerOptions,
  AuthHandlerXSTSResponse, 
} from 'src/berp'
import * as XBLAuth from '@xboxreplay/xboxlive-auth'
import * as Constants from '../Constants'
import {
  Logger,
  createSelector,
} from '../console'

class AuthHandler {
  private _options: AuthHandlerOptions
  private _msalApp: PublicClientApplication
  private _logger = new Logger("Auth Handler", 'green')
  constructor(options: AuthHandlerOptions) {
    if (!options) throw new Error("Invalid AuthHandler Options")
    this._options = options
    
    fs.mkdirSync(options.cacheDir, { recursive: true })
  }
  public getLogger(): Logger { return this._logger }

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
  /**
   * Exchange RPS for XBL User Token
   * @param rps MSAL Access Token
   * @param authTitle Defaults true, dont make false
   */
  public exchangeRpsForUserToken(rps: string, authTitle?: boolean): Promise<XBLAuth.ExchangeRpsTicketResponse> {
    authTitle = authTitle || true

    return XBLAuth.exchangeRpsTicketForUserToken((authTitle ? 'd=' : 't=') + rps)
  }
  public exchangeUserTokenForXSTS(token: string, relyingParty: string): Promise<XBLAuth.AuthenticateResponse> {
    return XBLAuth.exchangeUserTokenForXSTSIdentity(token, {
      raw: false,
      XSTSRelyingParty: relyingParty, 
    }) as Promise<XBLAuth.AuthenticateResponse>
  }
  public async selectUser(): Promise<AuthenticationResult> {
    const cachedAccounts = await this.getCache().getAllAccounts()
    if (!cachedAccounts || !cachedAccounts.length) {
      this.getLogger().warn("No Microsoft accounts were found in cache. Please Login!")
      const user = await this.createDeviceOauthGrant({
        scopes: Constants.Scopes,
        deviceCodeCallback: (device) => {
          this.getLogger().info(device.message)
        },
      })

      return user
    } else {
      const returnFirstCachedAccount = async (): Promise<AuthenticationResult> => {
        this.getLogger().info(`Found account "${cachedAccounts[0].name}"`)

        return await this.aquireTokenFromCache({
          scopes: Constants.Scopes,
          account: cachedAccounts[0],
        })
      }
      if (cachedAccounts.length > 1) {
        const result = await createSelector(cachedAccounts.map(a => a.name))
        if (!result) {
          this.getLogger().error(`Failed to select account, defaulting to first cached account`)

          return returnFirstCachedAccount()
        } else {
          const account = cachedAccounts.find(a => a.name === result)
          if (!account) {
            this.getLogger().error(`Failed to select account, defaulting to first cached account`)

            return returnFirstCachedAccount()
          } else {
            return await this.aquireTokenFromCache({
              scopes: Constants.Scopes,
              account,
            })
          }
        }
      } else {
        return returnFirstCachedAccount()
      }
    }
  }
  /**
   * Gets XSTS Credentials To Use Realm API
   */
  public async ezXSTSForRealmAPI(user: AuthenticationResult): Promise<AuthHandlerXSTSResponse> {
    const userToken = await this.exchangeRpsForUserToken(user.accessToken)
    const XSTSIdentity = await this.exchangeUserTokenForXSTS(userToken.Token, Constants.AuthEndpoints.RealmAPI)

    return {
      name: user.account.name,
      hash: XSTSIdentity.userHash,
      token: XSTSIdentity.XSTSToken,
      expires: XSTSIdentity.expiresOn,
    }
  }
  /**
   * Gets XSTS Credentials To Use Raknet
   */
  public async ezXSTSForRealmRak(user: AuthenticationResult): Promise<AuthHandlerXSTSResponse> {
    const userToken = await this.exchangeRpsForUserToken(user.accessToken)
    const XSTSIdentity = await this.exchangeUserTokenForXSTS(userToken.Token, Constants.AuthEndpoints.Raknet)

    return {
      name: user.account.name,
      hash: XSTSIdentity.userHash,
      token: XSTSIdentity.XSTSToken,
      expires: XSTSIdentity.expiresOn,
    }
  }
}

export = AuthHandler
