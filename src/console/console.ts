import {
  Form,
  Select,
} from 'enquirer'
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
  private _createNewInput(): void {
    this._console = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "",
    })
    this._registerInputListener()
  }

  public destroy(): void {
    this._console.close()
    this._console = undefined
  }

  public startSelectPrompt(message: string, args: string[]): Promise<string> {
    return new Promise((r) => {
      this.destroy()
      new Select({
        name: "selectprompt",
        message: `${message} ${chalk.gray('( Nav: ↑ ↓, Select: ↩, Exit: esc )')}`,
        choices: args.map(i => chalk.grey(i)),
      })
        .run()
        .then(res => {
          r(stripFormat(res))
          this._createNewInput()
        })
        .catch(() => {
          r(undefined)
          this._createNewInput()
        })
    })
  }
  public sendAuth(): Promise<{ email: string, pass: string }> {
    return new Promise((r) => {
      this.destroy()
      console.log(chalk.yellow("Accounts with Two-Factor Authentication enabled will not work with this login method!"))
      new Form({
        message: chalk.blueBright("Please login with your xbox live credentials: ") + chalk.gray("( Nav: tab, Submit: ↩, Exit: esc )"),
        choices: [
          {
            name: "email",
            message: chalk.grey("Email"),
          },
          {
            name: "pass",
            message: chalk.grey("Password"),
          },
        ],
      })
        .run()
        .then((res: any) => {
          r(res)
          this._createNewInput()
        })
        .catch(() => {
          r(undefined)
          this._createNewInput()
        })
    })
  }
}

export { BerpConsole }
