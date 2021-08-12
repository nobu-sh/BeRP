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
