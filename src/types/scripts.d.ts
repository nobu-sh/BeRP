declare const berp: BeRPMethods
declare const logger: Logger

interface BeRPMethods {
  getLogger(): Logger
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
