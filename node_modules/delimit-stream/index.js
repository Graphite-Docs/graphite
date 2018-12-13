var stream = require('stream')
var inherits = require('util').inherits



inherits(SplitStream, stream.Transform)

module.exports = SplitStream

function SplitStream(deliminator, options){
  if (!(this instanceof SplitStream)) return new SplitStream(deliminator, options)
  SplitStream.super_.call(this, options)
  this.delim = deliminator.split('').map(char2code)
  this.delimIndex = 0
  this.buffered = []
  this.maybeDelim = ''
  return this
}

SplitStream.prototype._transform = function(chunk, encoding, done){
  chunk = Buffer.isBuffer(chunk) ? chunk : Buffer(chunk)
  var prevContentStarti = 0
  //console.log('\n=====================\n')
  for (var chunkIndex=0; chunkIndex < chunk.length; chunkIndex++) {
    var chunkIndexAhead = chunkIndex
    //if (chunkIndex!==0) console.log('------------------')
    while (this.delimIndex < this.delim.length) {
      var char = chunk[chunkIndexAhead]
      var seekChar = this.delim[this.delimIndex]
      //console.log(char, seekChar,'deliminator index:', this.delimIndex,  'chunk index:', chunkIndex, 'future chunk index:', chunkIndexAhead, 'content index:', prevContentStarti)

      // not part of deliminator, abort
      if (seekChar !== char) {
        //console.log('not part of deliminator')
        this.abortMaybeDelim()
        // if at chunk end we buffer everything trailing previous delim
        if (chunkIndex === chunk.length - 1) {
          this.buffered.push(chunk.slice(prevContentStarti, chunk.length))
        }
        // reset deliminator index
        // so that we can check for another deliminator on this/other chunks
        this.delimIndex = 0
        break
      }

      // end of deliminator, complete!
      if (this.delimIndex === this.delim.length - 1) {
        //console.log('end of deliminator')
        // buffer values up to before deliminator started
        this.buffered.push(chunk.slice(prevContentStarti, chunkIndex))
        this.sendBuffered()
        // advance chunk index to skip deliminator we just found
        chunkIndex = chunkIndexAhead
        // reset deliminator index
        // so that we can check for another deliminator on this/other chunks
        this.delimIndex = 0
        // increment content index
        prevContentStarti = chunkIndexAhead+1
        this.maybeDelim = ''
        break
      }

      // end of chunk but cannot decide if is delim or not
      // carryover work to next chunk
      if (chunkIndexAhead === chunk.length - 1) {
        //console.log('end of chunk')
        // buffer content so far *not* including the maybeDelim
        this.buffered.push(chunk.slice(prevContentStarti, chunkIndex))
        // store maybe deliminator chars, if we discover they are not a
        // deliminator on next chunk then these will have to be appended to
        // this.buffered
        for (var i=chunkIndex; i < chunk.length; i++) {
          this.maybeDelim += code2char(chunk[i])
        }
        // increment deliminator index
        // so that next chunk starts looking for the next deliminator char
        this.delimIndex++
        chunkIndex = chunkIndexAhead
        break
      }

      // next
      chunkIndexAhead++
      this.delimIndex++
    }
  }
  done()
}

SplitStream.prototype._flush = function(callback){
  this.abortMaybeDelim()
  this.sendBuffered()
  callback()
}

SplitStream.prototype.abortMaybeDelim = function(){
  if (this.maybeDelim.length) {
    this.buffered.push(Buffer(this.maybeDelim))
    this.maybeDelim = ''
  }
}

SplitStream.prototype.sendBuffered = function(){
  var concated = Buffer.concat(this.buffered)
  //console.log('sending', concated)
  if (concated.length) this.push(concated)
  this.buffered.length = 0
  return this
}




function code2char(code){
  return String.fromCharCode(code)
}

function char2code(char){
  return char.charCodeAt(0)
}