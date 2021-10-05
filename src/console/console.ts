import { Select } from 'enquirer'
import { stripFormat } from '../utils'
import { EventEmitter } from 'events'
import { Logger } from './'
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
  private _isStopped = true
  private _listenerBinded: (data: Buffer) => void
  constructor() {
    super()
    this._listenerBinded = this._listener.bind(this)
    this.start()
  }
  public getLogger(): Logger { return this._logger }

  private _listener(data: Buffer): void {
    const clean = data.toString().replace(/(\n|\r)/g, "")
    this.emit('input', clean)
  }

  public start(): void {
    if (this._isStopped) {
      process.stdin.resume()
      process.stdin.on('data', this._listenerBinded)
      this._isStopped = false
    }
  }

  public stop(): void {
    if (!this._isStopped) {
      process.stdin.pause()
      process.stdin.removeListener('data', this._listenerBinded)
      this._isStopped = true
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
