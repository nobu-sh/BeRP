// export interface BeRPOptions {

// }
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

export interface LoginPayload {
  protocol_version: number
  tokens: {
    identity: string
    client: string
  }
}
export interface XboxProfile {
  nbf: number
  extraData: {
    XUID: string
    identity: string
    displayName: string
    titleId: number
  }
  randomNonce: number
  iss: string
  exp: number
  iat: number
  identityPublicKey: string
}
export type Versions = (
  '1.17.10' |
  '1.17.0' |
  '1.16.220' |
  '1.16.210' |
  '1.16.201' 
)

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

export interface MCHeaders {
  "cache-control": string
  Accept: string
  "Accept-Encoding": string
  "Accept-Language": string
  "content-type": string
  charset: string
  "client-version": string
  authorization: string
  Connection: string
  Host: string
  "User-Agent": string
}

export type DataProviderKnownFiles = (
  "protocol.json" |
  "steve.json" |
  "steveGeometry.json" |
  "steveSkin.bin"
)
