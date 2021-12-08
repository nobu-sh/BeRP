import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import chalk from "chalk"

export class Plugins extends BaseCommand {
  private _berp: BeRP
  public name = "plugins"
  public description = "Get a list of all loaded plugins and their connections."
  public usage = ""
  public aliases = [
    "pl",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    const plugins = []

    for (const [, pl] of this._berp.getPluginManager().getPlugins()) {
      plugins.push(`${pl.config.displayName || pl.config.name} v${pl.config.version} -- ${pl.config.description}`)
    }

    console.log(chalk.blueBright(`Found ${plugins.length} loaded plugin(s)!`))
    console.log(chalk.gray(plugins.join("\n")))
  }
}
