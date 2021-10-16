import { Message } from './Message'
import { EnableRequest } from './enable'
import { Heartbeat } from './heartbeat'
import { GetRequests } from './GetRequests'

export const defaultRequests = [
  Message,
  EnableRequest,
  Heartbeat,
  GetRequests,
]
