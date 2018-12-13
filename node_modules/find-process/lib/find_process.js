/*
* @Author: zoujie.wzj
* @Date:   2016-01-23 18:25:37
* @Last Modified by: Ayon Lee
* @Last Modified on: 2018-10-19
*/

'use strict'

const path = require('path')
const endsWith = require('lodash/endsWith')
const utils = require('./utils')

function matchName (text, name) {
  if (!name) {
    return true
  }

  return text.match(name)
}

const finders = {
  darwin (cond) {
    return new Promise((resolve, reject) => {
      let cmd
      if ('pid' in cond) {
        cmd = `ps -p ${cond.pid} -ww -o pid,ppid,uid,gid,args`
      } else {
        cmd = `ps ax -ww -o pid,ppid,uid,gid,args`
      }

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if ('pid' in cond) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([])
          } else {
            reject(err)
          }
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          let data = utils.stripLine(stdout.toString(), 1)
          let columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5).filter(column => {
            if (column[0] && cond.pid) {
              return column[0] === String(cond.pid)
            } else if (column[4] && cond.name) {
              return matchName(column[4], cond.name)
            } else {
              return !!column[0]
            }
          })

          let list = columns.map(column => {
            let cmd = String(column[4]).split(' ', 1)[0]

            return {
              pid: parseInt(column[0], 10),
              ppid: parseInt(column[1], 10),
              uid: parseInt(column[2], 10),
              gid: parseInt(column[3], 10),
              name: path.basename(cmd),
              cmd: column[4]
            }
          })

          if (cond.strict && cond.name) {
            list = list.filter(item => item.name === cond.name)
          }

          resolve(list)
        }
      })
    })
  },
  linux: 'darwin',
  sunos: 'darwin',
  freebsd: 'darwin',
  win32 (cond) {
    return new Promise((resolve, reject) => {
      const cmd = 'WMIC path win32_process get Name,Processid,ParentProcessId,Commandline'
      const lines = []

      const proc = utils.spawn('cmd', ['/c', cmd], { detached: false, windowsHide: true })
      proc.stdout.on('data', data => {
        lines.push(data.toString())
      })
      proc.on('close', code => {
        if (code !== 0) {
          return reject('Command \'' + cmd + '\' terminated with code: ' + code)
        }
        let list = utils.parseTable(lines.join('\n'))
          .filter(row => {
            if (cond.pid) {
              return row.ProcessId === String(cond.pid)
            } else if (cond.name) {
              if (cond.strict) {
                return row.Name === cond.name ||
                  (endsWith(row.Name, '.exe') && row.Name.slice(0, -4) === cond.name)
              } else {
                return matchName(row.CommandLine, cond.name)
              }
            } else {
              return true
            }
          })
          .map(row => ({
            pid: parseInt(row.ProcessId, 10),
            ppid: parseInt(row.ParentProcessId, 10),
            // uid: void 0,
            // gid: void 0,
            name: row.Name,
            cmd: row.CommandLine
          }))
        resolve(list)
      })
    })
  },
  android (cond) {
    return new Promise((resolve, reject) => {
      let cmd = 'ps'

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if ('pid' in cond) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([])
          } else {
            reject(err)
          }
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          let data = utils.stripLine(stdout.toString(), 1)
          let columns = utils.extractColumns(data, [0, 3], 4).filter(column => {
            if (column[0] && cond.pid) {
              return column[0] === String(cond.pid)
            } else if (column[1] && cond.name) {
              return matchName(column[1], cond.name)
            } else {
              return !!column[0]
            }
          })

          let list = columns.map(column => {
            let cmd = String(column[1]).split(' ', 1)[0]

            return {
              pid: parseInt(column[0], 10),
              // ppid: void 0,
              // uid: void 0,
              // gid: void 0,
              name: path.basename(cmd),
              cmd: column[1]
            }
          })

          if (cond.strict && cond.name) {
            list = list.filter(item => item.name === cond.name)
          }

          resolve(list)
        }
      })
    })
  }
}

function findProcess (cond) {
  let platform = process.platform

  return new Promise((resolve, reject) => {
    if (!(platform in finders)) {
      return reject(new Error(`platform ${platform} is unsupported`))
    }

    let find = finders[platform]
    if (typeof find === 'string') {
      find = finders[find]
    }

    find(cond).then(resolve, reject)
  })
}

module.exports = findProcess
