import { BeRP } from "./berp"
import { resolve } from 'path'
import { overrideProcessConsole } from './utils'

setInterval(() => { /**/ },30)

process.stdin.resume()
overrideProcessConsole(resolve(process.cwd(), 'logs'))

new BeRP()
