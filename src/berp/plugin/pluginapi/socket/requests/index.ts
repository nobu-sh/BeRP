import { Message } from './Message'
import { EnableRequest } from './enable'
import { Heartbeat } from './heartbeat'
import { GetRequests } from './GetRequests'
import { EntityCreate } from './EntityCreate'
import { EntityDestroyed } from './EntityDestroyed'
import { PlayerMessage } from "./PlayerMessage"
import { GetPlayers } from './GetPlayers'
import { GetEntities } from './GetEntities'
import { NameTagChanged } from './NameTagChanged'

export const defaultRequests = [
  Message,
  EnableRequest,
  Heartbeat,
  GetRequests,
  EntityCreate,
  EntityDestroyed,
  PlayerMessage,
  GetPlayers,
  GetEntities,
  NameTagChanged,
]
