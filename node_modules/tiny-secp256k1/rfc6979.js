const createHmac = require('create-hmac')

const ONE1 = Buffer.alloc(1, 1)
const ZERO1 = Buffer.alloc(1, 0)

// https://tools.ietf.org/html/rfc6979#section-3.2
function deterministicGenerateK (hash, x, checkSig, isPrivate) {
  // Step A, ignored as hash already provided
  // Step B
  // Step C
  let k = Buffer.alloc(32, 0)
  let v = Buffer.alloc(32, 1)

  // Step D
  k = createHmac('sha256', k)
    .update(v)
    .update(ZERO1)
    .update(x)
    .update(hash)
    .digest()

  // Step E
  v = createHmac('sha256', k).update(v).digest()

  // Step F
  k = createHmac('sha256', k)
    .update(v)
    .update(ONE1)
    .update(x)
    .update(hash)
    .digest()

  // Step G
  v = createHmac('sha256', k).update(v).digest()

  // Step H1/H2a, ignored as tlen === qlen (256 bit)
  // Step H2b
  v = createHmac('sha256', k).update(v).digest()

  let T = v

  // Step H3, repeat until T is within the interval [1, n - 1] and is suitable for ECDSA
  while (!isPrivate(T) || !checkSig(T)) {
    k = createHmac('sha256', k)
      .update(v)
      .update(ZERO1)
      .digest()

    v = createHmac('sha256', k).update(v).digest()

    // Step H1/H2a, again, ignored as tlen === qlen (256 bit)
    // Step H2b again
    v = createHmac('sha256', k).update(v).digest()
    T = v
  }

  return T
}

module.exports = deterministicGenerateK
