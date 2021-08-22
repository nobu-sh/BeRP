import {
  AccountInfo,
} from "@azure/msal-node"
import {
  packet_command_output,
  packet_start_game,
} from "./packets.i"

export interface PluginApi {
  new (berp: any, config: examplePluginConfig, path: string, connection: ConnectionHandler)
  getLogger(): Logger
  getConnection(): ConnectionHandler
  getCommandManager(): CommandManager
  getEventManager(): EventManager
  getPlayerManager(): PlayerManager
  getWorldManager(): WorldManager
}

interface examplePluginConfig {
  name: string
  displayName: string
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

interface ConnectionHandler {
  readonly KEEPALIVEINT: number
  readonly host: string
  readonly port: number
  readonly realm: RealmAPIWorld
  getGameInfo(): packet_start_game
  getLogger(): Logger
  getTick(): bigint
  getConnectionManager(): ConnectionManager
  close(): void
  sendCommandFeedback(option: boolean): void
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

interface ConnectionManager {
  getAccount(): AccountInfo
  getLogger(): Logger
  getConnections(): Map<number, ConnectionHandler>
  kill(): void
  killAll(): void
  closeSingle(id: number): void
  newConnection(host: string, port: number, realm: RealmAPIWorld): Promise<ConnectionHandler>
}

interface Logger {
  changeColor(newColor: LoggerColors): void
  useHex(newColor: string): void
  info(...content: unknown[]): void
  success(...content: unknown[]): void
  warn(...content: unknown[]): void
  error(...content: unknown[]): void
  debug(...content: unknown[]): void
}

type LoggerColors = (
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

interface CommandManager {
  executeCommand(command: string, callback?: (err: any, res: packet_command_output) => void): Promise<void>
}

interface EventManager {
  on<K extends keyof EventValues>(event: K, callback: (...args: EventValues[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof EventValues>,
    callback: (...args: unknown[]) => void,
  ): this
  once<K extends keyof EventValues>(event: K, callback: (...args: EventValues[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof EventValues>,
    callback: (...args: unknown[]) => void,
  ): this
  emit<K extends keyof EventValues>(event: K, ...args: EventValues[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof EventValues>,
    ...args: unknown[]
  ): boolean
}

interface EventValues {
  PlayerJoin: [Player]
  PlayerLeft: [Player]
  PlayerInitialized: [string]
  PlayerMessage: [PlayerMessage] 
  JsonReceived: [JsonData]
}

interface Player {
  getName(): string
  getUUID(): string 
  getEntityID(): bigint 
  getRuntimeID(): bigint
  getDevice(): number
  sendMessage(message: string): void
  executeCommand(command: string): void
  getTags(): Promise<string[]>
  hasTag(tag: string): Promise<boolean>
  getScore(objective: string): Promise<number>
}

interface PlayerMessage {
  sender: Player
  message: string
}

interface JsonData {
  event?: string
  sender?: string
  message?: string
  data?: any
}

interface PlayerManager {
  addPlayer(player: Player): void
  removePlayer(player: Player): void
  getPlayerByName(name: string): Player
  getPlayerByUUID(uuid: string): Player
  getPlayerByEntityID(entityID: bigint): Player
  getPlayerByRuntimeID(runtimeID: bigint): Player
  getPlayerList(): Map<string, Player>
}

interface WorldManager {
  sendMessage(message: string): void
}
