import { BeRP } from 'src/berp'
import { ConsoleCommandOptions } from 'src/types/berp'
import { BaseCommand } from '../../../../console/commands/base/BaseCommand'

export class ConsoleCommand extends BaseCommand {
  private _berp: BeRP
  public name: string
  public description: string
  public usage: string
  public aliases: string[]
  public callback: CallableFunction
  constructor(options: ConsoleCommandOptions, callback: CallableFunction) {
    super()
    this.name = options.command
    this.description = options.description
    this.usage = options.usage,
    this.aliases = options.aliases
    this.callback = callback
  }
  public async execute(args: string[]): Promise<void> {
    this.callback(args)
  }
}
