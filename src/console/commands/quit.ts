import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"

export class Quit extends BaseCommand {
  private _berp: BeRP
  public name = "quit"
  public description = "Quit CLI and safely disable all plugin instances."
  public usage = ""
  public aliases = [
    "q",
    "exit",
    "stop",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public async execute(): Promise<void> {
    await this._berp.getPluginManager().killAllPlugins()
    this._berp.getConsole().stop()
    this._berp.getSequentialBucket().pauseFlush()
    this._berp.getSequentialBucket().emptyBucket()
    this._berp.getSequentialBucket().emptyFailedBucket()
    this._berp.getNetworkManager().kill()
    this._berp.getPluginManager().killTempPlugins()
  }
}
