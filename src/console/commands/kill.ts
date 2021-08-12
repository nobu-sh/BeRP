import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"

export class Kill extends BaseCommand {
  private _berp: BeRP
  public name = "kill"
  public description = "Unsafe shutdown! Kills process without preforming an exit."
  public usage = ""
  public aliases = [
    "k",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    process.kill(process.pid)
  }
}
