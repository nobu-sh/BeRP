import {
  Method,
} from 'axios'
import { ConnectionHandler } from 'src/berp/network'
import { PluginApi } from 'src/berp/plugin/pluginapi/pluginApi'
import { Skin } from './packetTypes.i'

export type LoggerColors = (
  "black" |
  "blackBright" |
  "red" |
  "redBright" |
  "green" |
  "greenBright" |
  "yellow" |
  "yellowBright" |
  "blue" |
  "blueBright" |
  "magenta" |
  "magentaBright" |
  "cyan" |
  "cyanBright" |
  "white" |
  "whiteBright" |
  "gray" |
  "grey" 
)

export interface ConsoleCommand {
  name: string
  description: string
  usage: string
  aliases: string[]
  new(berp)
  execute(argv: string[]): void
}

export interface MCHeaders {
  "cache-control": string
  "Accept": string
  "Accept-Encoding": string
  "Accept-Language": string
  "content-type": string
  "charset": string
  "client-version": string
  "authorization": string
  "Connection": string
  "Host": string
  "User-Agent": string
}

export type DataProviderKnownFiles = (
  "protocol.json" |
  "steve.json" |
  "steveGeometry.json" |
  "steveSkin.bin"
)

export interface AuthHandlerOptions {
  clientId: string
  authority: string
  cacheDir: string
}
export interface AuthHandlerXSTSResponse {
  name: string
  // xuid: string
  hash: string
  token: string
  expires: string
}
export interface XboxProfileExtraData {
  XUID: string
  identity: string
  displayName: string
  titleId: number
}
export interface XboxProfile {
  nbf: number
  extraData: XboxProfileExtraData
  randomNonce: number
  iss: string
  exp: number
  iat: number
  identityPublicKey: string
}

export interface RequestParams {
  method: Method
  url: string
  headers?: Record<string, any>
  body?: Record<string, any>
}
export interface RequestOptions {
  attempts?: number
  attemptTimeout?: number
  requestTimeout?: number
}

export interface RealmAPIJoinInfo {
  address: string
  pendingUpdate: boolean
}

export interface RealmAPIWorldsRes {
  servers: RealmAPIWorld[]
}
export interface RealmAPIWorld {
  id: number
  remoteSubscriptionId: string
  owner: string
  ownerUUID: string
  name: string
  motd: string
  defaultPermission: string
  state: string
  daysLeft: number
  expired: boolean
  expiredTrial: boolean
  gracePeriod: boolean
  worldType: string
  players: unknown
  maxPlayers: number
  minigameName: string
  minigameId: unknown
  minigameImage: unknown
  activeSlot: number
  slots: unknown
  member: boolean
  clubId: number
  subscriptionRefreshStatus: unknown
}

export interface examplePlugin {
  new (pluginApi: any)
  onLoaded(): Promise<void>
  onEnabled(): Promise<void>
  onDisabled(): Promise<void>
}

export interface examplePluginConfig {
  name: string
  displayName: string
  color: string
  version: string
  description: string
  devMode: boolean
  main: string
  scripts: {
    build: string
    dev: string
    start: string
    [key: string]: string
  }
  author: string
  license: string
  dependencies: {
    [key: string]: string
  }
  devDependencies: {
    [key: string]: string
  }
  [key: string]: unknown
}

export interface PlayerOptions {
  name: string
  uuid: string
  xuid: string
  entityID: bigint
  device: number
  skinData: Skin
}

export interface EntityOptions {
  id: string
  nameTag: string
  runtimeId: number
}

export interface RawText {
  rawtext: Array<{text: string}>
}

export interface JsonRequest {
  berp: JsonData
}

export interface JsonData {
  event?: string
  sender?: any
  player?: any
  entities?: any
  entity?: any
  command?: any
  message?: string
  data?: any
  requestId: string
}

export interface Player {
  getName(): string
  getNickname(): string
  getRealmID(): number
  getUUID(): string 
  getXuid(): string
  getEntityID(): bigint 
  getDevice(): number
  getSkinData(): Skin
  getExecutionName(): string
  setNickname(nickname: string): void
  sendMessage(message: string): void
  executeCommand(command: string): void
  getTags(): Promise<string[]>
  hasTag(tag: string): Promise<boolean>
  getScore(objective: string): Promise<number>
  kick(reason: string): void
  getItemCount(item: string): Promise<number>
}

export interface CommandOptions {
  command: string
  aliases?: string[]
  description: string
  permissionTags?: string[]
}

export interface ConsoleCommandOptions {
  command: string
  aliases: string[]
  description: string
  usage: string
}

export interface CommandMapOptions {
  options: CommandOptions
  showInList: boolean
  execute(data: CommandResponse): void
}

export interface CommandResponse {
  sender: Player
  args: string[]
}

export interface ChatCommand {
  sender: Player
  command: string
}

export interface ActivePlugin {
  config: examplePluginConfig
  plugin: examplePlugin
  api: PluginApi
  connection: ConnectionHandler
  path: string
  ids: {
    api: number
    plugin: number
    instance: number
  }
}

export interface BlockPos {
  x: number
  y: number
  z: number
}
