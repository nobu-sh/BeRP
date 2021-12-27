/* eslint-disable @typescript-eslint/no-var-requires */
import { Logger } from '../../console'
import path from 'path'
import {
  ActivePlugin,
  examplePlugin,
  examplePluginConfig,
} from 'src/types/berp'
import childProcess from "child_process"
import { PluginApi } from './pluginapi/pluginApi' 
import { BeRP } from '../'
import fs from 'fs'
import { ConnectionHandler } from '../network'
import { EventEmitter } from 'events'
import axios from 'axios'

export class PluginManager extends EventEmitter{
  private _berp: BeRP
  private _knownPlugins = new Map<string, {config: examplePluginConfig, pluginId: number}>()
  private _activePlugins = new Map<string, ActivePlugin>()
  private _pluginInstances = new Map<string, number>()
  private _tempPlugins = new Map<string, ActivePlugin>()
  private _pluginsPath = path.resolve(process.cwd(), './plugins')
  private _logger: Logger
  private _latestInterfaces = {
    pluginApi: 'https://raw.githubusercontent.com/NobUwU/BeRP/main/src/types/pluginApi.i.ts',
    packets: 'https://raw.githubusercontent.com/NobUwU/BeRP/main/src/types/packets.i.ts',
    packetTypes: 'https://raw.githubusercontent.com/NobUwU/BeRP/main/src/types/packetTypes.i.ts',
  }
  private _apiId = 0
  private _pluginId = 0
  constructor(berp: BeRP) {
    super()
    this._berp = berp
    this._logger = new Logger('Plugin Manager', '#6d17b3')
    this._loadAll()
  }
  private async _loadAll(): Promise<void> {
    return new Promise(async (res) => {
      if (!fs.existsSync(this._pluginsPath)) {
        this._logger.warn("Plugins folder does not exist. Creating plugins folder:", `"${this._pluginsPath}"`)
        fs.mkdirSync(this._pluginsPath, { recursive: true })
        
        return res()
      }
      const pluginDirs: string[] = []
      for (const item of fs.readdirSync(this._pluginsPath)) {
        if (!fs.statSync(path.resolve(this._pluginsPath, item)).isDirectory()) continue
        pluginDirs.push(item)
      }

      if (pluginDirs.length < 1) {
        this._logger.info('No Plugins found!')

        return res()
      }
      for await (const plugin of pluginDirs) {
        await this.register(path.resolve(this._pluginsPath, plugin))
      }

      for (const [, temp] of this._tempPlugins) {
        try {
          temp.plugin.onLoaded()
          temp.api.onEnabled()
        } catch (err) {}
      }

      return res()
    })
  }
  private async register(pluginPath: string): Promise<void> {
    return new Promise(async (res) => {
      try {
        const confPath = path.resolve(pluginPath, "package.json")
        if (!fs.existsSync(confPath)) {
          this._logger.error(`package.json does not exsist in "${pluginPath}". Skipping plugin!`)

          return res()
        }
        const config: examplePluginConfig = await import(confPath)
        if (!this._verifyConfig(pluginPath, config)) return res()

        const pluginApiInterface = await axios.get(this._latestInterfaces.pluginApi)
        const packetsInterface = await axios.get(this._latestInterfaces.packets)
        const packetTypesInterface = await axios.get(this._latestInterfaces.packetTypes)
        if (!fs.existsSync(path.resolve(pluginPath, 'src', '@interface'))) fs.mkdirSync(path.resolve(pluginPath, 'src', '@interface'))
        fs.writeFileSync(path.resolve(pluginPath, 'src', '@interface', 'pluginApi.i.ts'), pluginApiInterface.data)
        fs.writeFileSync(path.resolve(pluginPath, 'src', '@interface', 'packets.i.ts'), packetsInterface.data)
        fs.writeFileSync(path.resolve(pluginPath, 'src', '@interface', 'packetTypes.i.ts'), packetTypesInterface.data)

        let neededUpdate = false
        let succeededUpdate = false
        let buildSuccess = true
        let alreadyBuilt = false

        if (!fs.existsSync(path.resolve(pluginPath, "node_modules")) && (config.dependencies || config.devDependencies)) {
          neededUpdate = true
          succeededUpdate = await this._update(pluginPath, config)
        }
        if (neededUpdate && !succeededUpdate) {
          this._logger.error(`Skipping plugin "${config.displayName || pluginPath}". Failed to install dependencies.`)
          
          return res()
        }
        if (!fs.existsSync(path.resolve(pluginPath, "dist"))) {
          buildSuccess = await this._build(pluginPath, config)
          alreadyBuilt = true
        }
        if (config.devMode !== false && !alreadyBuilt) {
          this._logger.warn(`Plugin "${config.displayName || pluginPath}" is in dev mode. Set devMode to false in package.json to disable`)
          buildSuccess = await this._build(pluginPath, config)
        }
        if (!buildSuccess) {
          this._logger.error(`Skipping plugin "${config.displayName || pluginPath}". Failed to build.`)

          return res()
        }
        try {
          this._logger.info(`Successfully loaded plugin "${config.displayName || pluginPath}"`)
          this._pluginId++ 
          this._knownPlugins.set(pluginPath, {
            config: config,
            pluginId: this._pluginId,
          })
          const entryPoint = path.resolve(pluginPath, config.main)
          const api = new PluginApi(this._berp, config, pluginPath, {
            realm: {
              id: 0,
            },
          } as any, {
            apiId: 0,
            pluginId: 0,
            instanceId: 0,
          }, true)
          const pluginClass = require(entryPoint)
          const plugin: examplePlugin = new pluginClass(api)
          this._tempPlugins.set(`${config.name}:${config.author}`, {
            config: config,
            plugin: plugin, 
            api: api,
            connection: {} as any,
            path: pluginPath,
            ids: {
              api: 0,
              plugin: 0,
              instance: 0,
            },
          })

          try {
          } catch (error) {
            this._logger.error(`Plugin "${config.displayName || path}". Uncaught Exception(s):\n`, error)
          }
        } catch (error) {
          this._logger.error(`Plugin "${config.displayName || path}". Uncaught Exception(s):\n`, error)
        }
      } catch (error) {

      }

      return res()
    })
  }
  public async reload(): Promise<void> {
    await this.killAllPlugins()
    this._knownPlugins = new Map<string, {config: examplePluginConfig, pluginId: number}>()
    this._activePlugins = new Map<string, ActivePlugin>()
    this._pluginInstances = new Map<string, number>()
    this._tempPlugins = new Map<string, ActivePlugin>()
    await this._loadAll()
    for (const [, ac] of this._berp.getNetworkManager().getAccounts()) {
      for (const [, c] of ac.getConnections()) {
        this.registerPlugins(c)
      }
    }
  }
  private async _update(path: string, config: examplePluginConfig): Promise<boolean> {
    return new Promise((res) => {
      this._logger.info(`Installing dependencies for "${config.displayName || path}"`)
      childProcess.exec('npm i typescript', {
        cwd: path,
      }, (err, out, s) => {
        if (err) {
          this._logger.error(`Failed to install dependencies for "${config.displayName || path}". Recieved Error(s):\n`, out, s)
          res(false)
        }
      })
      childProcess.exec('npm i', {
        cwd: path,
      }, (err, out, s) => {
        if (err) {
          this._logger.error(`Failed to install dependencies for "${config.displayName || path}". Recieved Error(s):\n`, out, s)
          res(false)
        } else {
          this._logger.info(`Finished installing dependencies for "${config.displayName || path}"`)
          res(true)
        }
      })
    })
  }
  private async _build(path: string, config: examplePluginConfig): Promise<boolean> {
    return new Promise((res) => {
      this._logger.info(`Attempting to build "${config.displayName || path}"`)
      childProcess.exec('npm run build', {
        cwd: path,
      }, (err, out) => {
        if (err) {
          this._logger.error(`Failed to build "${config.displayName || path}". Recieved Error(s):\n`, out)
          res(false)
        } else {
          this._logger.info(`Successfully built "${config.displayName || path}"`)
          res(true)
        }
      })
    })
  }
  private _verifyConfig(path: string, config: examplePluginConfig): boolean {
    if (config.displayName == undefined) this._logger.warn(`@${config.author}, your plugin is missing "displayName" in your package.json. Your plugin will be refered as "${path}"`)
    if (!config.version) this._logger.warn(`plugin "${config.displayName || path}" missing version prop in package.json`)
    if (config.devMode === undefined) this._logger.info(`plugin "${config.displayName || path}" missing devMode prop in package.json. Auto defaults to true!`)
    if (!config.main) {
      this._logger.error(`plugin "${config.displayName || path}" missing main prop in package.json. Cannot start plugin without valid path to main file!`)
      
      return false
    }
    if (!config.scripts) {
      this._logger.error(`plugin "${config.displayName || path}" missing scripts in package.json. Cannot start plugin without needed scripts!`)

      return false
    }
    if (!config.scripts.build) {
      this._logger.error(`plugin "${config.displayName || path}" missing scripts.build in package.json. Cannot start plugin without needed scripts!`)

      return false
    }
    if (!config.dependencies && !config.devDependencies) {
      this._logger.info(`WOW @${config.author || config.displayName || path}, your plugin has absolutely no depedencies! However, you should probably add "@types/node" as a devdependency.`)
    }

    if (!config.devDependencies) {
      this._logger.warn(`plugin "${config.displayName || path}" does not have @types/node. This is known to cause issues for some people. Please add "@types/node" as a devdependency to your project`)
    }

    if (config.devDependencies) {
      const devDependencies = Object.keys(config.devDependencies)
      if (!devDependencies.includes("@types/node")) {
        this._logger.warn(`plugin "${config.displayName || path}" does not have @types/node. This is known to cause issues for some people. Please add "@types/node" as a devdependency to your project`)
      }
    }

    if (config.devDependencies && !config.dependencies) {
      const devDependencies = Object.keys(config.devDependencies)
      const filterTypes = devDependencies.filter(d => d !== "@types/node")
      if (filterTypes.length < 1) {
        this._logger.info(`Great job @${config.author || config.displayName || path}! your plugin has absolutely no depedencies!`)
      }
    }

    if (config.dependencies) {
      const dependencies = Object.keys(config.dependencies)
      const dependencyFilter = dependencies.filter(i => i !== "ts-node" && i !== "typescript")
      let onlyTypes = true
      if (config.devDependencies) {
        const devDependencies = Object.keys(config.devDependencies)
        const filterTypes = devDependencies.filter(d => d !== "@types/node")
        if (filterTypes .length > 1) {
          onlyTypes = false
        }
      }
      if (dependencyFilter.length < 1 && onlyTypes) {
        this._logger.info(`Congrats @${config.author || config.displayName || path}, your plugin does not use any dependencies other than the needed ones!`)
      }
    } 

    return true
  }
  public async registerPlugins(connection: ConnectionHandler): Promise<ActivePlugin[]> {
    this._apiId++
    const plugins: ActivePlugin[] = []

    return new Promise(async (res) => {
      for await (const [plpath, options] of this._knownPlugins) {
        const entryPoint = path.resolve(plpath, options.config.main)
        const plugin: examplePlugin = require(entryPoint)
        const inst = this._pluginInstances.get(options.config.name) ?? 0
        this._pluginInstances.set(options.config.name, inst + 1)
        const pluginAPI = new PluginApi(this._berp, options.config, plpath, connection, {
          apiId: this._apiId,
          pluginId: options.pluginId,
          instanceId: inst + 1,
        })
        const newPlugin: examplePlugin = new plugin(pluginAPI)
        this._activePlugins.set(`${connection.id}:${this._apiId}:${options.config.name}:${options.pluginId}`, {
          config: options.config,
          plugin: newPlugin, 
          api: pluginAPI,
          connection: connection,
          path: plpath,
          ids: {
            api: this._apiId,
            plugin: options.pluginId,
            instance: inst + 1,
          },
        })
        await pluginAPI.onEnabled()
        try {
          newPlugin.onEnabled()
        } catch (err) {}
        plugins.push({
          config: options.config,
          plugin: newPlugin,
          api: pluginAPI,
          connection: connection,
          path: plpath,
          ids: {
            api: this._apiId,
            plugin: options.pluginId,
            instance: 0,
          },
        })
      }

      return res(plugins)
    })
  }
  public async killPlugins(connection: ConnectionHandler): Promise<void> {
    for (const [, pluginOptions] of this._activePlugins) {
      if (pluginOptions.connection !== connection) continue
      try {
        await pluginOptions.plugin.onDisabled()
      } catch (err) {}
      await pluginOptions.api.onDisabled()
      this._activePlugins.delete(`${pluginOptions.connection.id}:${pluginOptions.ids.api}:${pluginOptions.config.name}:${pluginOptions.ids.plugin}`)
    }
  }
  public killTempPlugins(): void {
    for (const [, temp] of this._tempPlugins) {
      temp.api.onDisabled()
    }
  }
  public async killAllPlugins(): Promise<void> {
    for (const [, plugin] of this._activePlugins) {
      try {
        await plugin.plugin.onDisabled()
      } catch (err) {}
      await plugin.api.onDisabled()
      this._activePlugins.delete(`${plugin.connection.id}:${plugin.ids.api}:${plugin.config.name}:${plugin.ids.plugin}`)
    }
  }
  public getPlugins(): Map<string, {config: examplePluginConfig, pluginId: number}> { return this._knownPlugins }
  public getActivePlugins(): Map<string, ActivePlugin> { return this._activePlugins }
}
