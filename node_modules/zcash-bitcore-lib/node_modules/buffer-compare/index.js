

module.exports = function(cmp,to){
  var c = 0;
  for(var i=0;i<cmp.length;++i){
    if(i == to.length) break;
    c = cmp[i] < to[i]?-1:cmp[i] > to[i]?1:0;    
    if(c != 0) break;
  }
  if(c == 0){
    if(to.length > cmp.length) c = -1;
    else if(cmp.length > to.length) c = 1;
  }
  return c;
}

