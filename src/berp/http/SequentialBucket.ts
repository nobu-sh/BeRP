import { Request } from './Request'
import { Logger } from '../../console'

export class SequentialBucket {
  private _runtimeId = 0n
  private _bucket = new Map<bigint, Request>()
  private _failedBucket = new Map<bigint, Request>()
  private _logger: Logger
  private _reqInt: number
  private _requestPool: NodeJS.Timer
  private _flushPaused = true
  private _debug: boolean
  constructor(interval?: number, logger?: Logger, debug = false) {
    this._reqInt = interval || 10
    this._logger = logger || new Logger(`Sequential Bucket ${Date.now().toString()
      .substring(7)}`, "#8769ff")
    this._debug = debug
    this.resumeFlush()

    this._logger.success("Bucket Initialized")
  }
  public getLogger(): Logger { return this._logger }
  public getRuntimeId(): bigint { return this._runtimeId }
  public getBucket(): Map<bigint, Request> { return this._bucket }
  public getFailedBucket(): Map<bigint, Request> { return this._failedBucket }

  public resumeFlush(): void {
    if (this._flushPaused) {
      this._requestPool = setInterval(() => {
        if (this._bucket.size > 0) {
          const [id, req] = Array.from(this._bucket.entries())[0]
          if (id) {
            this._bucket.delete(id)
            this._attemptRequest(id, req)
          }
        }
      }, this._reqInt)
      this._flushPaused = false
    } 
  }
  public pauseFlush(): void {
    if (!this._flushPaused) {
      clearInterval(this._requestPool)
      this._flushPaused = true
    } 
  }

  public addRequest(r: Request): bigint {
    this._runtimeId++
    this._bucket.set(this._runtimeId, r)

    return this._runtimeId
  }
  public removeRequest(runtimeId: bigint): Request {
    const r = this._bucket.get(runtimeId)
    this._bucket.delete(runtimeId)

    return r
  }
  public emptyBucket(): void {
    const requests = this._bucket.size
    this._logger.warn(`Emptied bucket.`, requests, "request(s) disposed.")
    this._bucket = new Map()
  }
  public emptyFailedBucket(): void {
    const requests = this._bucket.size
    this._logger.warn(`Emptied failed bucket.`, requests, "request(s) disposed.")
    this._failedBucket = new Map()
  }

  private _attemptRequest(id: bigint, r: Request, attempt?: number): void {
    try {
      r.makeRequest()
        .then((res) => {
          try {
            r.onFufilled(res)
          } catch (error) {
            if (this._debug) {
              this._logger.error("Attempted to call request \"onFulfilled\" method, but recieved error", error)
              this._failedBucket.set(id, r)
            }
          }
        })
        .catch((error) => {
          if (r.getRequestOptions().attempts - 1 > (attempt ? attempt : 0)) {
            if (this._debug) this._logger.warn("Error occured when attempting to make request. Attempting request again in", r.getRequestOptions().attemptTimeout + "ms")
            setTimeout(() => {
              this._attemptRequest(id, r, attempt ? attempt += 1 : 1)
            }, r.getRequestOptions().attemptTimeout || 2000)
          } else {
            if (this._debug) this._logger.error("Failed to make request after", r.getRequestOptions().attempts, "attempts... Disposing request.")
            this._failedBucket.set(id, r)
            try {
              r.onFailed(error)
            } catch (error) {
              if (this._debug) {
                this._logger.error("Attempted to call request \"onFailed\" method, but recieved error", error)
              }
            }
          }
        })
    } catch (error) {
      this._logger.error("Failed to make request during flush... Disposing request\n", error)
      this._failedBucket.set(id, r)
      try {
        r.onFailed(error)
      } catch (error) {
        if (this._debug) {
          this._logger.error("Attempted to call request \"onFailed\" method, but recieved error", error)
        }
      }
    }
  }
}
