import {
  BerpConsole,
  CommandHandler,
  Logger,
} from '../console'
import {
  SequentialBucket,
  Request,
} from './http'
import { logLogo } from '../utils'
import { AttemptProtocolCompiler } from './utils'
import { NetworkManager } from './network'
import { AuthHandler } from './auth'
import { PluginManager } from './plugin/PluginManager'
import { resolve } from 'path'
import * as Constants from '../Constants'
import { CommandManager } from './command/CommandManager'
export class BeRP {
  private _console: BerpConsole
  private _commandHandler: CommandHandler
  private _networkManager: NetworkManager
  private _authProvider: AuthHandler
  private _sequentialBucket: SequentialBucket
  private _commandManager: CommandManager
  private _pluginManager: PluginManager
  private _logger = new Logger('BeRP', '#6990ff')
  constructor() {
    logLogo()

    this._logger.info("Preparing Modules...")
    AttemptProtocolCompiler()

    this._networkManager = new NetworkManager(this)
    this._sequentialBucket = new SequentialBucket(5, new Logger("Sequential Bucket", "#8769ff"))
    this._authProvider = new AuthHandler({
      clientId: Constants.AzureClientID,
      authority: Constants.Endpoints.Authorities.MSAL,
      cacheDir: resolve(process.cwd(), 'msal-cache'),
    })
    this._authProvider.createApp(this._authProvider.createConfig())
    this._commandManager = new CommandManager(this)
    this._pluginManager = new PluginManager(this)
    this._console = new BerpConsole()
    this._commandHandler = new CommandHandler(this)
  }
  public getConsole(): BerpConsole { return this._console }
  public getLogger(): Logger { return this._logger }
  public getCommandHandler(): CommandHandler { return this._commandHandler }
  public getNetworkManager(): NetworkManager { return this._networkManager }
  public getAuthProvider(): AuthHandler { return this._authProvider }
  public getSequentialBucket(): SequentialBucket { return this._sequentialBucket }
  public getCommandManager(): CommandManager { return this._commandManager }
  public getPluginManager(): PluginManager { return this._pluginManager }
  public Request = Request
}
