var assert = require('assert')
var fs = require('fs')
var pj = require('../index')

var p = fs.readFileSync(__dirname + '/pubrsa.pem', 'utf8')
var x = pj.pem2jwk(p)
//var f = RSAPublicKey.decode(fromPEM(p), 'der')

//console.log(x)
var xp = pj.jwk2pem(x)
assert.equal(p, xp)


//*/
var p2 = fs.readFileSync(__dirname + '/pub.pem', 'utf8')
var y = pj.pem2jwk(p2)
//console.log(y)
var yp = pj.jwk2pem(y)
//console.log(yp)

var p3 = fs.readFileSync(__dirname + '/priv.pem', 'utf8')
//var f = RSAPrivateKey.decode(fromPEM(p3), 'der')
//console.log(f)
var z = pj.pem2jwk(p3)
var zp = pj.jwk2pem(z)
//console.log(zp)
assert.equal(p3, zp)
