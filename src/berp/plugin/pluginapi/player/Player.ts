import { ConnectionHandler } from 'src/berp/network'
import { BeRP } from 'src/berp'
import { PluginApi } from '../pluginApi'
import { PlayerOptions } from 'src/types/berp'
import { Skin } from 'src/types/packetTypes.i'

export class Player {
  private _name: string
  private _nickname: string
  private _realmID: number
  private _uuid: string
  private _xuid: string
  private _entityID: bigint
  private _device: number
  private _skinData: Skin
  private _berp: BeRP
  private _connection: ConnectionHandler
  private _pluginApi: PluginApi
  constructor(options: PlayerOptions, berp: BeRP, connection: ConnectionHandler, pluginApi: PluginApi) {
    this._name = options.name
    this._nickname = options.name
    this._realmID = connection.realm.id
    this._uuid = options.uuid
    this._xuid = options.xuid
    this._entityID = options.entityID
    this._device = options.device
    this._skinData = options.skinData
    this._berp = berp
    this._connection = connection
    this._pluginApi = pluginApi
    this._pluginApi.getPlayerManager().addPlayer(this)
  }
  public getName(): string { return this._name }
  public getNickname(): string { return this._nickname }
  public getRealmID(): number { return this._realmID }
  public getUUID(): string { return this._uuid }
  public getXuid(): string { return this._xuid }
  public getEntityID(): bigint { return this._entityID }
  public getDevice(): string { 
    switch(this._device) {
    case 1:
      return 'Android'
    case 3:
      return 'iOS'
    case 7:
      return 'Windows'
    case 11:
      return  'PlayStation'
    case 12:
      return 'Switch'
    case 13:
      return 'Xbox'
    default:
      return `Unknown ID: ${this._device}`
    }
  }
  public getSkinData(): Skin { return this._skinData }
  public getExecutionName(): string {
    if (this._name != this._nickname) return this._nickname

    return this._name
  }
  public getConnection(): ConnectionHandler { return this._connection }
  public setNickname(nickname: string): void {
    this._nickname = nickname
    this._pluginApi.getSocketManager().sendMessage({
      berp: {
        event: 'UpdateNickName',
        sender: this.getName(),
        message: nickname,
      },
    })
  }
  public sendMessage(message: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tellraw "${this.getExecutionName()}" {"rawtext":[{"text":"${message}"}]}`)
  }
  public sendTitle(message: string, slot: 'actionbar' | 'title' | 'subtitle'): void {
    this._pluginApi.getCommandManager().executeCommand(`titleraw "${this.getExecutionName()}" ${slot} {"rawtext":[{"text":"${message}"}]}`)
  }
  public executeCommand(command: string): void {
    this._pluginApi.getCommandManager().executeCommand(`execute "${this.getExecutionName()}" ~ ~ ~ ${command}`)
  }
  public async getTags(): Promise<string[]> {
    return new Promise((r) => {
      this._pluginApi.getCommandManager().executeCommand(`tag "${this.getExecutionName()}" list`, (err, res) => {
        if (err) return console.log(err)
        if (!res.output[0].paramaters[1]) return r([])
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
  public addTag(tag: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tag "${this.getExecutionName()}" add "${tag}"`)
  }
  public removeTag(tag: string): void {
    this._pluginApi.getCommandManager().executeCommand(`tag "${this.getExecutionName()}" remove "${tag}"`)
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
  public updateScore(operation: 'add' | 'remove' | 'set', objective: string, value: number): void {
    this._pluginApi.getCommandManager().executeCommand(`scoreboard players ${operation} "${this.getExecutionName()}" ${objective} ${value}`)
  }
  public kick(reason: string): void {
    this._pluginApi.getCommandManager().executeCommand(`kick "${this.getExecutionName()}" ${reason}`)
  }
  public async getItemCount(item: string): Promise<number> {
    return new Promise((r) => {
      this._pluginApi.getCommandManager().executeCommand(`clear "${this.getExecutionName()}" ${item} 0 0`, (err, res) => {
        if (err) return console.log(err)
        let count = res.output[0].paramaters[1]
        if (count == undefined) count = '0'

        return r(parseInt(count))
      })
    })
  }
}
