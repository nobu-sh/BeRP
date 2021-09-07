import { BeRP } from ".."
import path from 'path'
import fs from 'fs'
import { Logger } from '../../console'
import { ScriptApi } from './scriptapi/ScriptApi'

export class ScriptManager {
  private _berp: BeRP
  private _scriptsPath = path.resolve(process.cwd(), './scripts')
  private _logger = new Logger('Script Manager', '#186978')
  private _knowScripts = new Map<string, {path: string}>()
  constructor(berp: BeRP) {
    this._berp = berp
    this.loadAll()
  }
  private async folderCheck(): Promise<void> {
    return new Promise((res) => {
      if (!fs.existsSync(this._scriptsPath)) {
        this._logger.warn("Scripts folder does not exist. Creating scripts folder:", `"${this._scriptsPath}"`)
        fs.mkdirSync(this._scriptsPath, { recursive: true })
        fs.mkdirSync(path.resolve(this._scriptsPath, '@interface'), { recursive: true })
        const typeing = fs.readFileSync(path.resolve(process.cwd(), 'src', 'types', 'scripts.d.ts'), 'utf-8')
        fs.writeFileSync(path.resolve(this._scriptsPath, '@interface', 'scripts.d.ts'), typeing)
      }

      return res()
    })
  }
  private async getFiles(): Promise<void> {
    return new Promise(async (res) => {
      for await (const item of fs.readdirSync(this._scriptsPath)) {
        if (fs.statSync(path.resolve(this._scriptsPath, item)).isDirectory() || item !== ('index.js')) continue
        this._knowScripts.set(item, { path: path.resolve(this._scriptsPath, item) })
      }

      return res()
    })
  }
  private async loadAll(): Promise<void> {
    await this.folderCheck()
    await this.getFiles()
    for (const [, options] of this._knowScripts) {
      const script = new ScriptApi(this._berp, options.path, this._logger)
      script.runScript()
    }
  }
}
