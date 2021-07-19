/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  resolve,
} from 'path'
import { DataProviderKnownFiles } from 'src/berp'
import { getFiles } from '.'
import { Versions } from '../Constants'
import fs from 'fs'

export class DataProvider {
  private protocolVersion: number
  public fileMap: { [file: string]: any[][] } = {}
  constructor(pv: number) {
    this.protocolVersion = pv
  }
  public loadVersionsToFileMap(): void {
    for (const version in Versions) {
      let files: string[] = []
      try {
        files = getFiles(resolve(process.cwd(), 'data', version))
      } catch {}
      for (const file of files) {
        const sfile = file.split(/(\/|\\)/)
        const rfile = sfile[sfile.length - 1]
        this.fileMap[rfile] = this.fileMap[rfile] ?? []
        this.fileMap[rfile].push([Versions[version], file])
        this.fileMap[rfile].sort().reverse()
      }
    }
  }
  public getVersionMap(): { getData(file: DataProviderKnownFiles): Buffer | undefined } {
    this.fileMap = {}
    this.loadVersionsToFileMap()
    
    return {
      getData: (file: DataProviderKnownFiles): Buffer | undefined => {
        if (!this.fileMap[file]) {
          return undefined
        }
        for (const [pver, path] of this.fileMap[file]) {
          if (pver <= this.protocolVersion) {
            try {
              return fs.readFileSync(path)
            } catch {
              return undefined
            }
          }
        }

        return undefined
      },
    }
  }
}
