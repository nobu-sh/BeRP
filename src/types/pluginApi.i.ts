import {
  AccountInfo,
} from "@azure/msal-node"
import {
  packet_command_output,
  packet_start_game,
  ClientBoundPackets,
  ServerBoundPackets,
} from "./packets.i"

export interface PluginApi {
  new (berp: any, config: examplePluginConfig, path: string, connection: ConnectionHandler)
  path: string
  getLogger(): Logger
  getConnection(): ConnectionHandler
  getConfig(): examplePluginConfig
  getApiId(): number
  getCommandManager(): CommandManager
  getEventManager(): EventManager
  getPlayerManager(): PlayerManager
  getWorldManager(): WorldManager
  getSocketManager(): SocketManager
}

interface examplePluginConfig {
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

interface ConnectionHandler extends RakManager {
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

interface RakManager {
  readonly host: string
  readonly port: number
  readonly id: number
  readonly version: string
  readonly X509: string
  readonly SALT: string
  readonly CURVE: string
  readonly ALGORITHM: string
  readonly PUBLIC_KEY_ONLINE: string
  on<K extends keyof ClientBoundPackets>(event: K, listener: (...args: ClientBoundPackets[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof ClientBoundPackets>,
    listener: (...args: any[]) => void, 
  ): this
  once<K extends keyof ClientBoundPackets>(event: K, listener: (...args: ClientBoundPackets[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof ClientBoundPackets>,
    listener: (...args: any[]) => void, 
  ): this
  emit<K extends keyof ClientBoundPackets>(event: K, ...args: ClientBoundPackets[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof ClientBoundPackets>,
    ...args: any[]
  ): boolean
  getRakLogger(): Logger
  getXboxProfile(): XboxProfile
  sendPacket<K extends keyof ServerBoundPackets>(name: K, params: ServerBoundPackets[K][0]): Promise<{ name: K, params: ServerBoundPackets[K][0] }>
}

interface XboxProfileExtraData {
  XUID: string
  identity: string
  displayName: string
  titleId: number
}
interface XboxProfile {
  nbf: number
  extraData: XboxProfileExtraData
  randomNonce: number
  iss: string
  exp: number
  iat: number
  identityPublicKey: string
}

interface RealmAPIWorld {
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
  registerCommand(options: CommandOptions, callback: (data: CommandResponse) => void): void
  getPrefix(): string
  setPrefix(prefix: string): void
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
  PlayerDied: [PlayerDied]
  ChatCommand: [ChatCommand]
}

interface Player {
  getName(): string
  getNickname(): string
  getUUID(): string 
  getEntityID(): bigint 
  getRuntimeID(): bigint
  getDevice(): number
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

interface PlayerMessage {
  sender: Player
  message: string
}

interface PlayerDied {
  player: Player
  killer?: Player | string
  cause: string
}

interface ChatCommand {
  sender: Player
  command: string
}

interface JsonRequest {
  berp: JsonData
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

interface SocketManager {
  on<K extends keyof SocketValues>(event: K, callback: (...args: SocketValues[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    callback: (...args: unknown[]) => void,
  ): this
  once<K extends keyof SocketValues>(event: K, callback: (...args: SocketValues[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    callback: (...args: unknown[]) => void,
  ): this
  emit<K extends keyof SocketValues>(event: K, ...args: SocketValues[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof SocketValues>,
    ...args: unknown[]
  ): boolean
  sendMessage(options: JsonRequest): void
}

interface SocketValues {
  Message: [JsonData]
}

interface CommandOptions {
  command: string
  aliases?: string[]
  description: string
  permissionTags?: string[]
}

interface CommandResponse {
  sender: Player
  args: string[]
}
