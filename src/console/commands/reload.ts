import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from "chalk"

export class Reload extends BaseCommand {
  private _berp: BeRP
  public name = "reload"
  public description = "Reload all plugins."
  public usage = ""
  public aliases = [
    "r",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    this._berp.getLogger().info("Attemping to reload all plugins...")
    this._berp.getPluginManager().reload()
  }
}
