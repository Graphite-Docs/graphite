/*
* @Author: zoujie.wzj
* @Date:   2016-01-23 18:17:55
* @Last Modified by:   Zoujie
* @Last Modified time: 2016-02-04 17:16:58
*/

'use strict'

const cp = require('child_process')

const UNIT_MB = 1024 * 1024

const utils = {
  /**
   * exec command with maxBuffer size
   */
  exec (cmd, callback) {
    cp.exec(cmd, {
      maxBuffer: 2 * UNIT_MB,
      windowsHide: true
    }, callback)
  },
  /**
   * spawn command
   */
  spawn (cmd, args, options) {
    return cp.spawn(cmd, args, options)
  },
  /**
   * Strip top lines of text
   *
   * @param  {String} text
   * @param  {Number} num
   * @return {String}
   */
  stripLine (text, num) {
    let idx = 0

    while (num-- > 0) {
      let nIdx = text.indexOf('\n', idx)
      if (nIdx >= 0) {
        idx = nIdx + 1
      }
    }

    return idx > 0 ? text.substring(idx) : text
  },

  /**
   * Split string and stop at max parts
   *
   * @param  {Number} line
   * @param  {Number} max
   * @return {Array}
   */
  split (line, max) {
    let cols = line.trim().split(/\s+/)

    if (cols.length > max) {
      cols[max - 1] = cols.slice(max - 1).join(' ')
    }

    return cols
  },

  /**
   * Extract columns from table text
   *
   * Example:
   *
   * ```
   * extractColumns(text, [0, 2], 3)
   * ```
   *
   * From:
   * ```
   * foo       bar        bar2
   * valx      valy       valz
   * ```
   *
   * To:
   * ```
   * [ ['foo', 'bar2'], ['valx', 'valz'] ]
   * ```
   *
   * @param  {String} text  raw table text
   * @param  {Array} idxes  the column index list to extract
   * @param  {Number} max   max column number of table
   * @return {Array}
   */
  extractColumns (text, idxes, max) {
    let lines = text.split(/(\r\n|\n|\r)/)
    let columns = []

    if (!max) {
      max = Math.max.apply(null, idxes) + 1
    }

    lines.forEach(line => {
      let cols = utils.split(line, max)
      let column = []

      idxes.forEach(idx => {
        column.push(cols[idx] || '')
      })

      columns.push(column)
    })

    return columns
  },

  /**
   * parse table text to array
   *
   * From:
   * ```
   * Header1   Header2    Header3
   * foo       bar        bar2
   * valx      valy       valz
   * ```
   *
   * To:
   * ```
   * [{ Header1: 'foo', Header2: 'bar', Header3: 'bar2' }, ...]
   * ```
   *
   * @param  {String} data raw table data
   * @return {Array}
   */
  parseTable (data) {
    let lines = data.split(/(\r\n|\n|\r)/).filter(line => {
      return line.trim().length > 0
    })

    let matches = lines.shift().trim().match(/(\w+\s*)/g)
    if (!matches) {
      return []
    }
    let ranges = []
    let headers = matches.map((col, i) => {
      let range = []

      if (i === 0) {
        range[0] = 0
        range[1] = col.length
      } else {
        range[0] = ranges[i - 1][1]
        range[1] = range[0] + col.length
      }

      ranges.push(range)

      return col.trim()
    })
    ranges[ranges.length - 1][1] = Infinity

    return lines.map(line => {
      let row = {}
      ranges.forEach((r, i) => {
        let key = headers[i]
        let value = line.substring(r[0], r[1]).trim()

        row[key] = value
      })

      return row
    })
  }
}

module.exports = utils
