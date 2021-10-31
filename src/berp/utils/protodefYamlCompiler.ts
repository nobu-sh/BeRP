/**
 * https://github.com/extremeheat/protodef-yaml
 * 
 * At the current time of Saturday, July 24th 2021, 1:45am CST.
 * The Repository extremeheat/protodef-yaml has no license therefore
 * this code can legally be copied here and the developers/contributors
 * of this project may not be held accountable for any damages caused.
 * 
 * We also want to stress we take no credit for this. Please support 
 * the official release!
 */ 

// Handles compiling proto yamls into valid json to then pass to protodef

/* eslint-disable */
import fs from 'fs'
import Path from 'path'
import yaml from 'js-yaml'

import { Logger } from '../../console'
const logger = new Logger('Protodef YAML Compiler','yellow')

const log = (...idk) => { }

function getIndentation(line) {
  // log(line)
  let ind = 0
  for (const c of line) {
    if (c === ' ') ind++
    else break
  }
  
  return ind
}

function pad(indentation, line) {
  let ret = ''
  for (let i = 0; i < indentation; i++) ret += ' '
  
  return ret + line
}

// make valid yaml
function toYAML(input, followImports = true, document = false) {
  const files: any = {}
  if (typeof input === 'string') {
    files.main = fs.readFileSync(input, 'utf8')
  } else {
    Object.assign(files, input)
  }

  const imported = []
	
  function checkIfJson(key, val) { //  ¯\(°_o)/¯
    if (key.includes('"') || val.includes('[[') || val.includes('[{') || val.includes('{') || val.includes('}')) return true
    if (!val.includes('[]') && val.includes('[')) return true
    if (!val.includes('[]') && val.includes(']')) return true
    for (const c of ['[', ']', '{', '}']) if (key.includes(c)) return true
    
    return false
  }

  function validateKey(line, key) { }
	
  let data = files.main
  data = data.replace(/\t/g, '    ')
  const lines = data.split('\n')

  let startedDocumenting = false

  function pars() {
    let modified = false
    for (let i = 0; i < lines.length; i++) {
      let [key, val] = lines[i].trim().split(':', 2)
      const thisLevel = getIndentation(lines[i])
      const nextLevel = getIndentation(lines[i + 1] || '')
      if (key.startsWith('#')) {
        if ((key.startsWith('# ') || key === '#') && startedDocumenting && document) { // Convert the YAML comments to entries
          key = '!comment,' + i
          val = lines[i].replace('#', '')
          const lastLine = lines[i - 1]
          const lastLevel = getIndentation(lines[i - 1] || '')
          if (lastLine.trim().startsWith('\'!comment') && lastLevel == thisLevel && false) { // Truncate multi-lines
            lines[i - 1] += '\n' + pad(thisLevel + 3, val)
            lines[i] = ''
          } else {
            lines[i] = pad(thisLevel, key + ': |\n')
            lines[i] += pad(thisLevel + 3, val)
          }
        } else {
          continue
        }
      }
      key = key.trim(); val = val ? val.trim() : ''
      if (key == '_') key = '__' + i
      if (!key) continue
      if (key.startsWith('!')) {
        if (key.startsWith('!StartDocs')) startedDocumenting = true
        if (key.startsWith('!EndDocs')) startedDocumenting = false
        if (key == '!import' && !imported.includes(val) && followImports) {
          if (modified) {
            throw Error('Incorrectly placed import, place it ontop of the file')
          }
          imported.push(val)
          let imp = files[val]
          if (!imp && typeof input === 'string') {
            // console.log('Path', input, Path.dirname(input))
            imp = fs.readFileSync(Path.dirname(input) + '/' + val, 'utf-8')
          } else if (!imp) {
            throw new Error('Import file not found: ' + val)
          }
          imp = imp.replace(/\t/g, '    ')
          lines.splice(i, 0, ...imp.split('\n'))
          
          return true
        }
        let nkey = key.replace('!', "'!")
        if (key == '!import' || key.includes('Docs')) nkey += ',' + i
        nkey += "'"
        lines[i] = lines[i].replace(key, nkey)
        continue
      }

      if (checkIfJson(key, val)) {
        // console.debug('Ignoring JSON', lines[i])
        continue
      }

      validateKey(lines[i], key)

      log('i', i, val)
      log(thisLevel, nextLevel, nextLevel > thisLevel, val.trim())
      const isParent = nextLevel > thisLevel
      if (isParent) {
        modified = true
        // console.info(lines[i])
        if (val.includes('[]')) {
          const [type, countType] = val.split('[]')
          if (type) throw Error('Array type cannot be both container and ' + type + ' at ' + val)
          lines[i] = pad(thisLevel, `"%array,${key},${type},${countType}":`)
        } else if (val.includes('=>')) {
          const type = val.replace('=>', '').trim()
          lines[i] = pad(thisLevel, `"%map,${key},${type}":`)
        } else if (val.includes('?')) {
          val = val.replace('?', '').trim()
          lines[i] = pad(thisLevel, `"%switch,${key},${val}":`)
        } else if (val && !val.startsWith('#')) {
          logger.error('at ', lines[i - 1])
          logger.error('AT ', lines[i])
          logger.error('at ', lines[i + 1])
          logger.error(val)
          throw Error(`Unexpected child block at line ${i}`)
        } else if (!key.startsWith('if')) {
          lines[i] = pad(thisLevel, `"%container,${key},${val}":`)
        }
      } else {
        if (val.includes('[]')) {
          const [type, countType] = val.split('[]')
          lines[i] = pad(thisLevel, `"%array,${key},${type},${countType}":`)
        } else if (!isNaN(key.replace(/'/g, ''))) {
          // Because JS sorts objects weird, we need to encapsulate numeric type
          // keys to ensure proper ordering with '%n,NUMBER'
          const num = key.replace(/'/g, '')
          lines[i] = pad(thisLevel, `'%n,${parseInt(num)}': ${val}`)
        }
      }
    }
  }
  while (pars()) { logger.info('Importing', imported[imported.length - 1], "...") }

  log(lines)
  // fs.writeFileSync(__dirname + '/inter.yaml', lines.join('\n'))

  return lines
}

function parseYAML(lines) {
  try {
    let ret
    yaml.loadAll(lines.join('\n'), d => ret = d)
    
    return ret
  } catch (e) {
    if (e instanceof yaml.YAMLException) {
      delete e.mark // remove logging spam
    }
    throw e
  }
}

function transform(json) {
  // console.log(json)
  const ctx = []

  function visitArray(obj, name, countType, count, ctx) {
    log('OBJ', obj)
    if (countType.startsWith('$')) {
      count = countType.slice(1)
      countType = undefined
    }
    if (typeof obj === 'string') {
      if (name) {
        ctx.push({
          name,
          type: ['array', {
            countType,
            count,
            type: obj, 
          }], 
        })
      } else {
        ctx.push('array', {
          countType,
          count,
          type: obj, 
        })
      }
    } else {
      const k = Object.keys(obj).filter(k => !k.startsWith('!'))
      const len = k.length
      const first = k[0]
      // Try to inline switch/array inside an array if only 1 item inside
      // log('F', first, name, Object.keys(obj), first.startsWith('%array'))
      if (len == 1 && (first.startsWith('%array') || first.startsWith('%switch'))) { // remove container nested array
        if (name) {
          const a = {
            countType,
            count,
            type: [], 
          }
          ctx.push({
            name,
            type: ['array', a], 
          })
          trans(obj, a.type)
          //   log('atn0-------',name,a.type)
          if (!a.type[0].name || a.type[0].name.startsWith('__')) a.type = a.type[0].type
          else a.type = ['container', [a.type[0]]]
        } else {
          const a = {
            countType,
            count,
            type: [], 
          }
          ctx.push('array', a)
          trans(obj, a.type)
          //   log('atn1',a.type)
          if (!a.type[0].name || a.type[0].name.startsWith('__')) a.type = a.type[0].type
          else a.type = ['container', [a.type[0]]]
        }
      } else {
        if (name) {
          const a = {
            countType,
            count,
            type: ['container', []], 
          }
          ctx.push({
            name,
            type: ['array', a], 
          })
          trans(obj, a.type[1])
        } else {
          const a = {
            countType,
            count,
            type: ['container', []], 
          }
          ctx.push('array', a)
          trans(obj, a.type[1])
        }
      }
    }
  }

  function trans(obj, ctx) {
    ctx = ctx || []
    for (const key in obj) {
      let val = obj[key]
      if (key.startsWith('!')) continue

      if (typeof val === 'object') {
        if (key.startsWith('%')) {
          const args = key.split(',')
          if (key.startsWith('%map')) {
            const mappings = {}
            for (const i in val) {
              if (i.startsWith('!')) continue
              const _i = i.startsWith('%') ? i.split(',')[1] : i
              mappings[_i] = val[i] // Ignore comments + encapsulated numbers
            }
            const [, name, mappingType] = args
            ctx.push({
              name,
              type: [
                'mapper',
                {
                  type: mappingType,
                  mappings,
                },
              ],
            })
          } else if (key.startsWith('%switch')) {
            let [, name, cmp] = args
            const as = {}
            let def = []
            for (const _key in val) {
              const _val = val[_key]
              const _keyName = _key.startsWith('%') ? _key.split(',')[1] : _key
              if (_key.startsWith('%array')) {
                const [, name, type, countType] = _key.split(',')
                const tokens = name.replace('if ', '').split(' or ')

                for (var token of tokens) {
                  token = token.trim()
                  as[token] = typeof _val === 'string' ? _val : []
                  // if (typeof _val == 'object') trans(_val, as[token])
                  visitArray(_val || type, null, countType, undefined, as[token])
                  if (token == 'default') {
                    def = as[token]
                    delete as[token]
                  }
                }
              } else if (_keyName.startsWith('if')) {
                const tokens = _keyName.replace('if ', '').split(' or ')
                for (var token of tokens) {
                  token = token.trim()
                  as[token] = typeof _val === 'string' ? _val : ['container', []]
                  if (typeof _val === 'object') {
                    if (_key.startsWith('%switch')) {
                      trans({ [_key]: _val }, as[token][1])
                      as[token] = as[token][1][0].type
                    } else {
                      trans(_val, as[token][1])
                    }
                  } else {
                    if (_val.startsWith('[')) {
                      as[token] = JSON.parse(_val)
                    }
                  }
                }
              } else if (_keyName.startsWith('default')) {
                def = []
                if (typeof _val === 'object') {
                  def = ['container', []]
                  if (_key.startsWith('%switch')) {
                    trans({ [_key]: _val }, def[1])
                    def = def[1][0].type
                  } else {
                    trans(_val, def[1])
                  }
                } else {
                  def = _val
                  if (_val.startsWith('[')) {
                    def = JSON.parse(_val)
                  }
                }
              }
            }
            let anon
            if (name.startsWith('__')) { name = undefined; anon = true }

            ctx.push({
              name,
              anon,
              type: [
                'switch',
                {
                  compareTo: cmp.replace('?', ''),
                  fields: as,
                  default: def.length ? def : 'void',
                },
              ],
            })
          } else if (key.startsWith('%array')) {
            const [, name, type, countType] = args

            log(val, typeof val, obj)
            if (type && val && typeof val === 'object') throw Error('Array has a type and body: ' + name)

            visitArray(val || type, name, countType, undefined, ctx)
          } else if (key.startsWith('%container')) {
            const [, cname] = args

            const name = cname.startsWith('__') ? undefined : cname
            let anon
            if (!name) anon = true
            ctx.push({
              name,
              anon,
              type: ['container', []], 
            })
            trans(val, ctx[ctx.length - 1].type[1])
          }
        } else {
          // log(ctx)
          // Probably JSON, leave as is
        }
      } else if (typeof val === 'string') {
        if (key.startsWith('!')) continue
        if (val.startsWith('[')) {
          val = JSON.parse(val)
        }
        ctx.push({
          name: key,
          type: val, 
        })
      }
      log(key, typeof val)
    }
  }

  trans(json, ctx)

  // add in json
  for (const key in json) {
    const val = json[key]
    if (typeof val === 'object' && !key.startsWith('%')) {
      log('pushing ext', {
        name: key,
        type: val, 
      })
      ctx.push({
        name: key,
        type: val, 
      })
    }
  }

  // log('ctx', JSON.stringify(ctx, null, 2))
  // fs.writeFileSync(outFile || 'compiled_proto.json', JSON.stringify(ctx, null, 2))
  return ctx
}

function getName(_key) {
  if (_key.startsWith('%')) {
    return _key.split(',')[1]
  }
  
  return _key
}

function formFinal(inp, out?) {
  const ret = {}
  for (const entry of inp) {
    ret[entry.name] = entry.type
  }
  // fs.writeFileSync('./compiled_proto.json', JSON.stringify(ret, null, 2))

  return ret
}

function getIntermediate(input, includeComments?, followImports = false): Record<any,any> {
  return parseYAML(toYAML(input, followImports, includeComments))
}

function compile(input, output): Record<any,any> {
  const ret = formFinal(transform(parseYAML(toYAML(input))))

  if (typeof output === 'string') fs.writeFileSync(output, JSON.stringify(ret, null, 2))
  
  return ret
}

export {
  compile as ProtoDefYAMLCompile,
  getIntermediate as ProtoDefYAMLParse,
}
