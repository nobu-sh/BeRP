import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { PlayerOptions } from 'src/types/berp'

export class Player {
  private _name: string
  private _nickname: string
  private _uuid: string
  private _entityID: bigint
  private _runtimeID: bigint
  private _device: number
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(options: PlayerOptions, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._name = options.name
    this._nickname = options.name
    this._uuid = options.uuid
    this._entityID = options.entityID
    this._runtimeID = options.runtimeID
    this._device = options.device
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getPlayerManager().addPlayer(this)
  }
  public getName(): string { return this._name }
  public getNickname(): string { return this._nickname }
  public getUUID(): string { return this._uuid }
  public getEntityID(): bigint { return this._entityID }
  public getRuntimeID(): bigint { return this._runtimeID }
  public getDevice(): number { return this._device }
  public getExecutionName(): string {
    if (this._name != this._nickname) return this._nickname

    return this._name
  }
  public setNickname(nickname: string): void {
    this._nickname = nickname
    // TODO: Sends event to gametest
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw "${this.getExecutionName()}" {"rawtext":[{"text":"${message}"}]}`)
  }
  public executeCommand(command: string): void {
    this._pluginApi.getCommandManager().executeCommand(`execute "${this.getExecutionName()}" ~ ~ ~ ${command}`)
  }
  public async getTags(): Promise<string[]> {
    return new Promise((r) => {
      this._pluginApi.getCommandManager().executeCommand(`tag "${this.getExecutionName()}" list`, (err, res) => {
        if (err) return console.log(err)
        if (!res.output[0].paramaters[1]) return
        const filter = [res.output[0].paramaters[0], res.output[0].paramaters[1]]
        const tags = res.output[0].paramaters.filter(x => !filter.includes(x)).toString()
          .replace(/§\S/g, "")
          .split(', ')

        return r(tags)
      })
    })
  }
  public async hasTag(tag: string): Promise<boolean> {
    if (!(await this.getTags()).includes(tag)) return false

    return true
  }
  public async getScore(objective: string): Promise<number> {
    return new Promise((r) => {
      this._pluginApi.getCommandManager().executeCommand(`scoreboard players test "${this.getExecutionName()}" ${objective} * *`, (err, res) => {
        if (err) return console.log(err)
        if (res.output[0].paramaters[0] == this._name) return r(0)

        return r(parseInt(res.output[0].paramaters[0]))
      })
    })
  }
}
