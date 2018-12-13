'use strict'

const EventEmitter = require('events').EventEmitter

const CONSTANTS = require('./constants')
const logger = require('./utils').logger

const unwantEvent = (c) => `unwant:${c}`
const blockEvent = (c) => `block:${c}`

/**
 * Internal module used to track events about incoming blocks,
 * wants and unwants.
 *
 * @param {PeerId} peerId
 * @private
 */
class Notifications extends EventEmitter {
  constructor (peerId) {
    super()

    this.setMaxListeners(CONSTANTS.maxListeners)

    this._log = logger(peerId, 'notif')

    this._unwantListeners = {}
    this._blockListeners = {}
  }

  /**
   * Signal the system that we received `block`.
   *
   * @param {Block} block
   * @return {void}
   */
  hasBlock (block) {
    const str = `block:${block.cid.buffer.toString()}`
    this._log(str)
    this.emit(str, block)
  }

  /**
   * Signal the system that we are waiting to receive the
   * block associated with the given `cid`.
   *
   * @param {CID} cid
   * @param {function(Block)} onBlock - called when the block is received
   * @param {function()} onUnwant - called when the block is unwanted
   * @returns {void}
   */
  wantBlock (cid, onBlock, onUnwant) {
    const cidStr = cid.buffer.toString()
    this._log(`wantBlock:${cidStr}`)

    this._unwantListeners[cidStr] = () => {
      this._log(`manual unwant: ${cidStr}`)
      this._cleanup(cidStr)
      onUnwant()
    }

    this._blockListeners[cidStr] = (block) => {
      this._cleanup(cidStr)
      onBlock(block)
    }

    this.once(
      unwantEvent(cidStr),
      this._unwantListeners[cidStr]
    )
    this.once(
      blockEvent(cidStr),
      this._blockListeners[cidStr]
    )
  }

  /**
   * Signal that the block is not wanted anymore.
   *
   * @param {CID} cid - the CID of the block that is not wanted anymore.
   * @returns {void}
   */
  unwantBlock (cid) {
    const str = `unwant:${cid.buffer.toString()}`
    this._log(str)
    this.emit(str)
  }

  /**
   * Internal method to clean up once a block was received or unwanted.
   *
   * @private
   * @param  {string} cidStr
   * @returns {void}
   */
  _cleanup (cidStr) {
    if (this._unwantListeners[cidStr]) {
      this.removeListener(
        unwantEvent(cidStr),
        this._unwantListeners[cidStr]
      )
      delete this._unwantListeners[cidStr]
    }

    if (this._blockListeners[cidStr]) {
      this.removeListener(
        blockEvent(cidStr),
        this._blockListeners[cidStr]
      )
      delete this._blockListeners[cidStr]
    }
  }
}

module.exports = Notifications
