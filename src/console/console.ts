import { Select } from 'enquirer'
import { stripFormat } from '../utils'
import { EventEmitter } from 'events'
import { Logger } from './'
import readline from 'readline'
import chalk from 'chalk'

interface BerpConsoleEvents {
  "input": [string]
}
interface BerpConsole extends EventEmitter {
  on<K extends keyof BerpConsoleEvents>(event: K, listener: (...args: BerpConsoleEvents[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof BerpConsoleEvents>,
    listener: (...args: any[]) => void, 
  ): this
  once<K extends keyof BerpConsoleEvents>(event: K, listener: (...args: BerpConsoleEvents[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof BerpConsoleEvents>,
    listener: (...args: any[]) => void, 
  ): this
  emit<K extends keyof BerpConsoleEvents>(event: K, ...args: BerpConsoleEvents[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof BerpConsoleEvents>,
    ...args: any[]
  ): boolean
}

class BerpConsole extends EventEmitter {
  private _logger = new Logger("Console", 'gray')
  private _console = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "",
  })
  constructor() {
    super()
    this._registerInputListener()
    this._logger.success("BeRP Enhanced Console Initialized")
  }
  public getLogger(): Logger { return this._logger }

  private _registerInputListener(): void {
    this._console.on('line', (s) => {
      this.emit("input", s)
    })
  }
  /**
   * Start new readline console instance
   */
  public start(): void {
    if (!this._console) {
      this._console = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "",
      })
      this._registerInputListener()
    }
  }

  /**
   * Stop current readline console instance
   */
  public stop(): void {
    if (this._console) {
      this._console.close()
      this._console = undefined
    }
  }

  public sendSelectPrompt(message: string, args: string[]): Promise<string> {
    return new Promise((r) => {
      this.stop()
      new Select({
        name: "selectprompt",
        message: `${message} ${chalk.gray('( Nav: ↑ ↓, Select: ↩, Exit: esc )')}`,
        choices: args.map(i => chalk.grey(i)),
      })
        .run()
        .then(res => {
          r(stripFormat(res))
          this.start()
        })
        .catch(() => {
          r(undefined)
          this.start()
        })
    })
  }
}

export { BerpConsole }
