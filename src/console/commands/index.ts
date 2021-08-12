/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeRP } from "../../berp"
import { Quit } from "./quit"
import { Help } from './help'
import { Kill } from './kill'
import { Recompile } from './Recompile'
import { Account } from './account'

class ex {
  public name: string
  public description: string
  public usage: string
  public aliases: string[]
  constructor(berp: BeRP) { /**/ }
  public execute(argv: string[]): void { /* */ }
}

const Commands: typeof ex[] = [
  Quit,
  Help,
  Kill,
  Recompile,
  Account,
]

export { Commands }
