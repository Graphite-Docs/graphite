var test = require("tape")

var compare = require('../')

test("can compare",function(t){
  var b = new Buffer("abcd")
  , b2 = new Buffer("abcde")
  , b3 = new Buffer("abcdef")
  ;

  t.equals(compare(b,b2),-1,'b < b2') 
  t.equals(compare(b3,b),1,'b3 > b')
  t.equals(compare(b,b),0,'b == b')
  t.equals(compare(Buffer(''),Buffer('')),0,' empty b == empty b')
  t.equals(compare(Buffer('s'),Buffer('')),1,' b > empty b')
  t.equals(compare(Buffer(''),Buffer('a')),-1,' empty b < b')
  t.end();
})


test("sorts correctly with null bytes at end",function(t){
  
  t.equals(compare(new Buffer("hi\x00"),new Buffer("hi")),1,"should match 1 if last is a null byte and compare to is one shorter")
  t.end();
})
