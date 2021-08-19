import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"

export class Connections extends BaseCommand {
  private _berp: BeRP
  public name = "connections"
  public description = "Get a list of all current realm connection."
  public usage = ""
  public aliases = [
    "cs",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    console.log(Array.from(this._berp.getNetworkManager().getAccounts()
      .entries()))
  }
}
