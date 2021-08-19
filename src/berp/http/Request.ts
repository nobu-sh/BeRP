import axios from 'axios'
import {
  RequestOptions,
  RequestParams,
} from '../../types/berp'

export class Request<R = any> {
  private _req: RequestParams
  private _options: RequestOptions
  constructor(request?: RequestParams, options?: RequestOptions) {
    this._req = request || undefined
    this._options = Object.assign({
      attempts: 5,
      attemptTimeout: 5000,
      requestTimeout: 25000,
    }, options || {})
  }
  public getRequest(): RequestParams { return this._req }
  public setRequest(req: RequestParams): void { this._req = req }
  public getRequestOptions(): RequestOptions { return this._options }
  public setRequestOptions(options: RequestOptions): void { this._options = options }

  /**
   * Method is called once Sequential Bucket successfully makes request
   * 
   * Client is expected to override this method with their own function
   * ___
   * `Example`
   * ```
   *  Request.onFufilled = (data: MyInterface): void => { My Logic }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onFufilled(data: R): void {
    /* User Inplemented Method */
  }
  /**
   * Method is called when Sequential Bucket completely fails to make request
   * 
   * Client is expected to override this method with their own function
   * ___
   * `Example`
   * ```
   *  Request.onFailed = (err: MyInterface): void => { My Logic }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onFailed(err: unknown): void {
    /* User Inplemented Method */
  }

  public async makeRequest(): Promise<R>
  public async makeRequest(cb: (err: any, res: R) => void): Promise<void>
  public async makeRequest(cb?: (err: any, res: R) => void): Promise<R | void> {
    if (!this._req || !this._req.url || !this._req.method) throw Error("Request method & url required to make a request!")
    try {
      const { data }: { data: R } = await axios({
        method: this._req.method,
        url: this._req.url,
        headers: this._req.headers || undefined,
        data: this._req.body || undefined,
        timeout: this._options.requestTimeout,
        timeoutErrorMessage: `Request failed to resolve after ${this._options.requestTimeout}ms. Failing request!`,
      })
      if (cb) {
        return cb(undefined, data)
      } else {
        return new Promise((r) => {
          r(data)
        })
      }
    } catch (error) {
      if (cb) {
        return cb(error, undefined)
      } else {
        return new Promise((r,j) => {
          j(error)
        })
      }
    }
  }
}
