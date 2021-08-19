/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeRP } from "../../berp"
import { Quit } from "./quit"
import { Help } from './help'
import { Kill } from './kill'
import { Recompile } from './recompile'
import { Account } from './account'
import { Connect } from './connect'
import { Connections } from './connections'
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
  Connect,
  Connections,
]

export { Commands }
