import fs from 'fs'
import { TokenCacheContext } from '@azure/msal-node'

interface CachePlugin {
  beforeCacheAccess(cacheContext: TokenCacheContext): Promise<void>
  afterCacheAccess(cacheContext: TokenCacheContext): Promise<void>
}

export function CachePlugin(location: string): CachePlugin {
  const beforeCacheAccess = (cacheContext: TokenCacheContext): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(location)) {
        fs.readFile(location, "utf-8", (err, data) => {
          if (err) {
            reject()
          } else {
            cacheContext.tokenCache.deserialize(data)
            resolve()
          }
        })
      } else {
        fs.writeFile(location, cacheContext.tokenCache.serialize(), (err) => {
          if (err) {
            reject()
          }
          resolve() // Is needed lol
        })
      }
    })
  }

  const afterCacheAccess = (cacheContext: TokenCacheContext): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cacheContext.cacheHasChanged) {
        fs.writeFile(location, cacheContext.tokenCache.serialize(), (err) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  return {
    beforeCacheAccess,
    afterCacheAccess,
  }
}
