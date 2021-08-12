import fs from 'fs'
import path from 'path'

export function getFiles (dir: string): string[] {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file))
    } else {
      results.push(file)
    }
  })

  return results
}
