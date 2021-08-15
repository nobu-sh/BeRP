import {
  PublicClientApplication,
  Configuration,
  DeviceCodeRequest,
  AuthenticationResult,
  TokenCache,
  SilentFlowRequest,
} from '@azure/msal-node'
import {
  AuthHandlerOptions,
  AuthHandlerXSTSResponse, 
} from '../../types/berp'
import { CachePlugin } from './CachePlugin'
import { resolve } from 'path'
import {
  Logger,
} from '../../console'
import fs from 'fs'
import * as XBLAuth from '@xboxreplay/xboxlive-auth'
import * as Constants from '../../Constants'

class AuthHandler {
  private _options: AuthHandlerOptions
  private _msalApp: PublicClientApplication
  private _logger = new Logger("Auth Handler", 'green')
  constructor(options: AuthHandlerOptions) {
    if (!options) throw new Error("Invalid AuthHandler Options")
    this._options = options
    
    fs.mkdirSync(options.cacheDir, { recursive: true })
    this._logger.success("Auth Provider Prepared")
  }
  public getLogger(): Logger { return this._logger }

  public createConfig(): Configuration {
    return {
      auth: {
        clientId: this._options.clientId,
        authority: this._options.authority,
      },
      cache: {
        cachePlugin: CachePlugin(resolve(this._options.cacheDir, "cache.json")),
      },
    }
  }
  public createApp(config: Configuration): void {
    this._msalApp = new PublicClientApplication(config)
    this._logger.success("Auth Provider App Created")
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
  /**
   * Excahnge User Token for XSTS
   * @param token User Token
   * @param relyingParty URL Enpoint in which this token will be used
   */
  public exchangeUserTokenForXSTS(token: string, relyingParty: string): Promise<XBLAuth.AuthenticateResponse> {
    return XBLAuth.exchangeUserTokenForXSTSIdentity(token, {
      raw: false,
      XSTSRelyingParty: relyingParty, 
    }) as Promise<XBLAuth.AuthenticateResponse>
  }
  /**
   * Gets XSTS Credentials To Use Realm API
   */
  public async ezXSTSForRealmAPI(user: AuthenticationResult): Promise<AuthHandlerXSTSResponse> {
    const userToken = await this.exchangeRpsForUserToken(user.accessToken)
    const XSTSIdentity = await this.exchangeUserTokenForXSTS(userToken.Token, Constants.Endpoints.Authorities.RealmAPI)

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
    const XSTSIdentity = await this.exchangeUserTokenForXSTS(userToken.Token, Constants.Endpoints.Authorities.MineRak)

    return {
      name: user.account.name,
      hash: XSTSIdentity.userHash,
      token: XSTSIdentity.XSTSToken,
      expires: XSTSIdentity.expiresOn,
    }
  }
}
export { AuthHandler }
