import {
  CUR_VERSION,
  ProtoDataPath,
} from '../../Constants'
import { BaseCommand } from "./base/BaseCommand"
import { BeRP } from "../../berp"
import { AttemptProtocolCompiler } from '../../berp/utils'
import fs from 'fs'
import path from 'path'

export class Recompile extends BaseCommand {
  private _berp: BeRP
  public name = "recompile"
  public description = "Attempts to recompile protocol files. Please be aware using this while connected to realms may cause some temporary errors."
  public usage = ""
  public aliases = [
    "rc",
  ]
  constructor(berp: BeRP) {
    super()
    this._berp = berp
  }
  public execute(): void {
    this._berp.getCommandHandler()
      .getLogger()
      .warn("Attempting protodef recompile. Process could cause temporary errors in console.")
    fs.rmSync(path.resolve(ProtoDataPath, CUR_VERSION), {
      recursive: true,
    })
    AttemptProtocolCompiler()
  }
}
