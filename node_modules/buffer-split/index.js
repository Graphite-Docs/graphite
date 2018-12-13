var bufferIndexOf = require('buffer-indexof');

module.exports = function(buf,splitBuf,includeDelim){
  
  var search = -1
  , lines = []
  , move = includeDelim?splitBuf.length:0
  ;

  while((search = bufferIndexOf(buf,splitBuf)) > -1){
    lines.push(buf.slice(0,search+move));
    buf = buf.slice(search+splitBuf.length,buf.length);
  }

  lines.push(buf);
        
  return lines;
}




