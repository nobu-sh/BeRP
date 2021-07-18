import { AuthHandlerXSTSResponse } from "src/berp"

export function createXBLToken(xstsResponse: AuthHandlerXSTSResponse): string {
  return `XBL3.0 x=${xstsResponse.hash};${xstsResponse.token}`
}
