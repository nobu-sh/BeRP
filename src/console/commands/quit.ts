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
  public execute(): void {
    process.exit(0)
  }
}
