import { BeRP } from "./berp"
import { resolve } from 'path'
import { overrideProcessConsole } from './utils'

overrideProcessConsole(resolve(process.cwd(), 'logs'))

new BeRP()
