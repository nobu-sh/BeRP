/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CUR_VERSION,
  ProtoDataPath,
} from '../../Constants'
import { resolve } from 'path'
import { DataProviderKnownFiles } from '../../types/berp'
import { getFiles } from '.'
import fs from 'fs'

export class DataProvider {
  public static getDataMap(): { getFile(file: DataProviderKnownFiles): Buffer | undefined } {
    const dataMap = new Map<string, string>()
    const path = resolve(ProtoDataPath, CUR_VERSION)
    try {
      const files = getFiles(path)
      for (const file of files) {
        const splitFilePath = file.split(/(\/|\\)/)
        const fileName = splitFilePath[splitFilePath.length - 1]
        dataMap.set(fileName, file)
      }
    } catch {}

    return {
      getFile(file: DataProviderKnownFiles): Buffer | undefined {
        const path = dataMap.get(file)
        if (path) {
          return fs.readFileSync(path)
        } else {
          return undefined
        }
      },
    }
  }
}
