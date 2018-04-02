var Shorten = require('../lib');

console.log(Shorten.id(10000));
console.log(Shorten.id(10001));
console.log(Shorten.id(100000000));
console.log(Shorten.id(100000001));
console.log(Shorten.id(1000000000000));
console.log(Shorten.id(1000000000001));
console.log(Shorten.idEx(10000));
console.log(Shorten.idEx(10001));
console.log(Shorten.idEx(100000000));
console.log(Shorten.idEx(100000001));
console.log(Shorten.idEx(1000000000000));
console.log(Shorten.idEx(1000000000001));
