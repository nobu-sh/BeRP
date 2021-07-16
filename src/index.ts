import { overrideProcessConsole } from './utils'
import { resolve } from 'path'

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))

import auth from './raknet/auth'
console.log(auth)
