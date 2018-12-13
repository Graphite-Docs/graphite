/*
* @Author: zoujie.wzj
* @Date:   2016-01-23 18:18:28
* @Last Modified by: Ayon Lee
* @Last Modified on: 2018-10-19
*/

'use strict'

const findPid = require('./find_pid')
const findProcess = require('./find_process')

const findBy = {
  port (port) {
    return findPid(port)
      .then(pid => {
        return findBy.pid(pid)
      }, () => {
        // return empty array when pid not found
        return []
      })
  },
  pid (pid) {
    return findProcess({pid: pid})
  },
  name (name, strict) {
    return findProcess({name: name, strict: strict || false})
  }
}

/**
 * find process by condition
 *
 * return Promise: [{
 *   pid: <process id>,
 *   ppid: <process parent id>,
 *   uid: <user id (*nix)>,
 *   gid: <user group id (*nix)>,
 *   name: <command name>,
 *   cmd: <process run args>
 * }, ...]
 *
 * If no process found, resolve process with empty array (only reject when error occured)
 *
 * @param  {String} by condition: port/pid/name ...
 * @param {Mixed} condition value
 * @return {Promise}
 */
function find (by, value, strict) {
  return new Promise((resolve, reject) => {
    if (!(by in findBy)) {
      reject(new Error(`do not support find by "${by}"`))
    } else {
      findBy[by](value, strict).then(resolve, reject)
    }
  })
}

module.exports = find
