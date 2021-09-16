import { PlayerJoin } from './PlayerJoin'
import { PlayerLeft } from './PlayerLeft'
import { PlayerInitialized } from './PlayerInitialized'
import { PlayerMessage } from './PlayerMessage'
import { PlayerDied } from './PlayerDied'

export const defaultEvents = [
  PlayerJoin,
  PlayerLeft,
  PlayerInitialized,
  PlayerMessage,
  PlayerDied,
]
