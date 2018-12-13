var test = require('tape')
, bsplit = require('../')
;

test("can split",function(t){

  var b = new Buffer("this is a buffer i like to split")
  , delim = new Buffer('buffer')
  , result = bsplit(b,delim)
  ;

  t.equals(result.length,2,'should have found chunks');

  t.equals(result[0].toString(),"this is a ","first chunk should not include delim");

  t.equals(result[1].toString()," i like to split","should have all results");


  result = bsplit(b,delim,true);

  t.equals(result[0].toString(),"this is a buffer",'should include delim')

  result = bsplit(new Buffer('foo,'),new Buffer(','));

  t.equals(result.length,2,"should have all results");

  result = bsplit(new Buffer('foo'),new Buffer(','));

  t.equals(result.length,1,"should have all results");

  t.end();

})
