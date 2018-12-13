let BIP32 = require('../')
let tape = require('tape')
let fixtures = require('./fixtures/index.json')
let LITECOIN = {
  wif: 0xb0,
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe
  }
}

// TODO: amend the JSON
let validAll = []
fixtures.valid.forEach((f) => {
  f.master.network = f.network
  f.master.children = f.children
  f.master.comment = f.comment
  f.children.forEach((fc) => {
    fc.network = f.network
    validAll.push(fc)
  })
  delete f.children
  validAll.push(f.master)
})

function verify (t, hd, prv, f, network) {
  t.equal(hd.chainCode.toString('hex'), f.chainCode)
  t.equal(hd.depth, f.depth >>> 0)
  t.equal(hd.index, f.index >>> 0)
  t.equal(hd.fingerprint.toString('hex'), f.fingerprint)
  t.equal(hd.identifier.toString('hex'), f.identifier)
  t.equal(hd.publicKey.toString('hex'), f.pubKey)
  if (prv) t.equal(hd.toBase58(), f.base58Priv)
  if (prv) t.equal(hd.privateKey.toString('hex'), f.privKey)
  if (prv) t.equal(hd.toWIF(), f.wif)
  if (!prv) t.throws(() => hd.toWIF(), /Missing private key/)
  if (!prv) t.equal(hd.privateKey, null)
  t.equal(hd.neutered().toBase58(), f.base58)
  t.equal(hd.isNeutered(), !prv)

  if (!f.children) return
  if (!prv && f.children.some(x => x.hardened)) return

  // test deriving path from master
  f.children.forEach((cf) => {
    let chd = hd.derivePath(cf.path)
    verify(t, chd, prv, cf, network)

    let chdNoM = hd.derivePath(cf.path.slice(2)) // no m/
    verify(t, chdNoM, prv, cf, network)
  })

  // test deriving path from successive children
  let shd = hd
  f.children.forEach((cf) => {
    if (cf.m === undefined) return
    if (cf.hardened) {
      shd = shd.deriveHardened(cf.m)
    } else {
      // verify any publicly derived children
      if (cf.base58) verify(t, shd.neutered().derive(cf.m), false, cf, network)

      shd = shd.derive(cf.m)
      verify(t, shd, prv, cf, network)
    }

    t.throws(() => {
      shd.derivePath('m/0')
    }, /Expected master, got child/)

    verify(t, shd, prv, cf, network)
  })
}

validAll.forEach((ff) => {
  tape(ff.comment || ff.base58Priv, (t) => {
    let network
    if (ff.network === 'litecoin') network = LITECOIN

    let hd = BIP32.fromBase58(ff.base58Priv, network)
    verify(t, hd, true, ff, network)

    hd = BIP32.fromBase58(ff.base58, network)
    verify(t, hd, false, ff, network)

    if (ff.seed) {
      let seed = Buffer.from(ff.seed, 'hex')
      hd = BIP32.fromSeed(seed, network)
      verify(t, hd, true, ff, network)
    }

    t.end()
  })
})

tape('fromBase58 throws', (t) => {
  fixtures.invalid.fromBase58.forEach((f) => {
    t.throws(() => {
      let network
      if (f.network === 'litecoin') network = LITECOIN

      BIP32.fromBase58(f.string, network)
    }, new RegExp(f.exception))
  })

  t.end()
})

tape('works for Private -> public (neutered)', (t) => {
  let f = fixtures.valid[1]
  let c = f.master.children[0]

  let master = BIP32.fromBase58(f.master.base58Priv)
  let child = master.derive(c.m).neutered()

  t.plan(1)
  t.equal(child.toBase58(), c.base58)
})

tape('works for Private -> public (neutered, hardened)', (t) => {
  let f = fixtures.valid[0]
  let c = f.master.children[0]

  let master = BIP32.fromBase58(f.master.base58Priv)
  let child = master.deriveHardened(c.m).neutered()

  t.plan(1)
  t.equal(c.base58, child.toBase58())
})

tape('works for Public -> public', (t) => {
  let f = fixtures.valid[1]
  let c = f.master.children[0]

  let master = BIP32.fromBase58(f.master.base58)
  let child = master.derive(c.m)

  t.plan(1)
  t.equal(c.base58, child.toBase58())
})

tape('throws on Public -> public (hardened)', (t) => {
  let f = fixtures.valid[0]
  let c = f.master.children[0]

  let master = BIP32.fromBase58(f.master.base58)

  t.plan(1)
  t.throws(() => {
    master.deriveHardened(c.m)
  }, /Missing private key for hardened child key/)
})

tape('throws on wrong types', (t) => {
  let f = fixtures.valid[0]
  let master = BIP32.fromBase58(f.master.base58)

  fixtures.invalid.derive.forEach((fx) => {
    t.throws(() => {
      master.derive(fx)
    }, /Expected UInt32/)
  })

  fixtures.invalid.deriveHardened.forEach((fx) => {
    t.throws(() => {
      master.deriveHardened(fx)
    }, /Expected UInt31/)
  })

  fixtures.invalid.derivePath.forEach((fx) => {
    t.throws(() => {
      master.derivePath(fx)
    }, /Expected BIP32Path, got/)
  })

  let ZERO = Buffer.alloc(32, 0)
  let ONES = Buffer.alloc(32, 1)

  t.throws(() => {
    BIP32.fromPrivateKey(Buffer.alloc(2), ONES)
  }, /Expected property "privateKey" of type Buffer\(Length: 32\), got Buffer\(Length: 2\)/)

  t.throws(() => {
    BIP32.fromPrivateKey(ZERO, ONES)
  }, /Private key not in range \[1, n\)/)

  t.end()
})

tape('works when private key has leading zeros', (t) => {
  let key = 'xprv9s21ZrQH143K3ckY9DgU79uMTJkQRLdbCCVDh81SnxTgPzLLGax6uHeBULTtaEtcAvKjXfT7ZWtHzKjTpujMkUd9dDb8msDeAfnJxrgAYhr'
  let hdkey = BIP32.fromBase58(key)

  t.plan(2)
  t.equal(hdkey.privateKey.toString('hex'), '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd')
  let child = hdkey.derivePath('m/44\'/0\'/0\'/0/0\'')
  t.equal(child.privateKey.toString('hex'), '3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb')
})

tape('fromSeed', (t) => {
  // TODO
//    'throws if IL is not within interval [1, n - 1] | IL === n || IL === 0'
  fixtures.invalid.fromSeed.forEach((f) => {
    t.throws(() => {
      BIP32.fromSeed(Buffer.from(f.seed, 'hex'))
    }, new RegExp(f.exception))
  })

  t.end()
})

tape('ecdsa', (t) => {
  let seed = Buffer.alloc(32, 1)
  let hash = Buffer.alloc(32, 2)
  let signature = Buffer.from('9636ee2fac31b795a308856b821ebe297dda7b28220fb46ea1fbbd7285977cc04c82b734956246a0f15a9698f03f546d8d96fe006c8e7bd2256ca7c8229e6f5c', 'hex')
  let node = BIP32.fromSeed(seed)

  t.plan(3)
  t.equal(node.sign(hash).toString('hex'), signature.toString('hex'))
  t.equal(node.verify(hash, signature), true)
  t.equal(node.verify(seed, signature), false)
})
