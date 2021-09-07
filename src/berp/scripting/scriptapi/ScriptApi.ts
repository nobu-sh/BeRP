import {
  Context,
  createContext,
  runInContext,
} from 'vm'
import { BeRP } from "src/berp"
import fs from 'fs'
import path from 'path'
import { Logger } from 'src/console'

export class ScriptApi {
  private _berp: BeRP
  private _path: string
  private _logger: Logger
  private _context: Context

  constructor(berp: BeRP, path: string, logger: Logger) {
    this._berp = berp
    this._path = path
    this._logger = logger
    this._context = createContext({
      console: console,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      require: this.include.bind(this),
      logger: this._logger,
      berp: this._berp,
    })
  }
  public runScript(): void {
    runInContext(fs.readFileSync(this._path, 'utf-8'), this._context)
  }
  private include(file: string): void {
    const script = new ScriptApi(this._berp, path.resolve(this._path, "../", file), this._logger)
    script.runScript()
  }
}
