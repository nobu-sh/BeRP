import { AuthHandlerXSTSResponse } from "../../types/berp"

export function createXBLToken(xstsResponse: AuthHandlerXSTSResponse): string {
  return `XBL3.0 x=${xstsResponse.hash};${xstsResponse.token}`
}
