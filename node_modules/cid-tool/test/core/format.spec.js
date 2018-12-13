/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const CIDTool = require('../../')

describe('core format', () => {
  const cidv0 = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
  const cidv1 = 'zdj7WfLr9DhLrb1hsoSi4fSdjjxuZmeqgEtBPWxMLtPbDNbFD'

  const testData = [
    [cidv0, { format: '%P' }, 'cidv0-dag-pb-sha2-256-32'],
    [cidv0, { format: 'prefix' }, 'cidv0-dag-pb-sha2-256-32'],
    [cidv0, { format: '%b-%v-%c-%h-%L' }, 'base58btc-cidv0-dag-pb-sha2-256-32'],
    [cidv0, { format: '%s' }, 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'],
    [cidv0, { format: '%S' }, 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'],
    [cidv0, { format: 'ver#%V/#%C/#%H/%L' }, 'ver#0/#112/#18/32'],
    [cidv0, { format: '%m' }, 'zQmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'],
    [cidv0, { format: '%M' }, 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'],
    [cidv0, { format: '%d' }, 'z72gdmFAgRzYHkJzKiL8MgMMRW3BTSCGyDHroPxJbxMJn'],
    [cidv0, { format: '%D' }, '72gdmFAgRzYHkJzKiL8MgMMRW3BTSCGyDHroPxJbxMJn'],
    [cidv0, { base: 'b', format: '%S' }, 'ciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y'],
    [cidv0, { base: 'b', format: '%B%S' }, 'bciqftfeehedf6klbt32bfaglxezl4uwfnwm4lftlmxqbcerz6cmlx3y'],
    [cidv0, { cidVersion: 1 }, 'zdj7WbTaiJT1fgatdet9Ei9iDB5hdCxkbVyhyh8YTUnXMiwYi'],
    [cidv1, { format: '%P' }, 'cidv1-dag-pb-sha2-256-32'],
    [cidv1, { format: '%b-%v-%c-%h-%L' }, 'base58btc-cidv1-dag-pb-sha2-256-32'],
    [cidv1, { format: '%s' }, 'zdj7WfLr9DhLrb1hsoSi4fSdjjxuZmeqgEtBPWxMLtPbDNbFD'],
    [cidv1, { format: '%S' }, 'dj7WfLr9DhLrb1hsoSi4fSdjjxuZmeqgEtBPWxMLtPbDNbFD'],
    [cidv1, { format: 'ver#%V/#%C/#%H/%L' }, 'ver#1/#112/#18/32'],
    [cidv1, { format: '%m' }, 'zQmYFbmndVP7QqAVWyKhpmMuQHMaD88pkK57RgYVimmoh5H'],
    [cidv1, { format: '%M' }, 'QmYFbmndVP7QqAVWyKhpmMuQHMaD88pkK57RgYVimmoh5H'],
    [cidv1, { format: '%d' }, 'zAux4gVVsLRMXtsZ9fd3tFEZN4jGYB6kP37fgoZNTc11H'],
    [cidv1, { format: '%D' }, 'Aux4gVVsLRMXtsZ9fd3tFEZN4jGYB6kP37fgoZNTc11H'],
    [cidv1, { base: 'base32', format: '%s' }, 'bafybeietjgsrl3eqpqpcabv3g6iubytsifvq24xrrhd3juetskltgq7dja'],
    [cidv1, { base: 'base32', format: '%S' }, 'afybeietjgsrl3eqpqpcabv3g6iubytsifvq24xrrhd3juetskltgq7dja'],
    [cidv1, { base: 'base32', format: '%B%S' }, 'bafybeietjgsrl3eqpqpcabv3g6iubytsifvq24xrrhd3juetskltgq7dja'],
    [cidv1, { cidVersion: 0 }, 'QmYFbmndVP7QqAVWyKhpmMuQHMaD88pkK57RgYVimmoh5H'],
    [cidv1, { format: '%%' }, '%']
  ]

  testData.forEach(([ cid, options, expectedResult ]) => {
    it(getTitle(cid, options), () => {
      const res = CIDTool.format(cid, options)
      expect(res).to.eql(expectedResult)
    })
  })

  function getTitle (cid, { format, base, cidVersion }) {
    let title = [`should format ${format || '%s'}`]
    if (base != null) title.push(`change multibase to ${base}`)
    if (cidVersion != null) title.push(`change CID version to ${cidVersion}`)
    return title.join(' and ') + ` for CIDv${new CID(cid).version}`
  }

  it('should throw error for non printf string', () => {
    expect(() => CIDTool.format(cidv0, { format: 'no specifiers!' }))
      .to.throw(/^invalid format string/)
  })

  it('should throw error for unrecognized specifier', () => {
    expect(() => CIDTool.format(cidv1, { format: '%x' }))
      .to.throw(/^unrecognized specifier/)
  })

  it('should throw error for invalid CID', () => {
    expect(() => CIDTool.format('INVALID CID'))
      .to.throw(/^invalid cid/)
  })

  it('should throw error for invalid CID version option', () => {
    expect(() => CIDTool.format(cidv0, { cidVersion: 2 }))
      .to.throw(/^invalid cid version/)
  })

  it('should throw error for invalid base (as code) option', () => {
    expect(() => CIDTool.format(cidv1, { base: '*' }))
      .to.throw(/^invalid multibase/)
  })

  it('should throw error converting incompatible CIDv1 to CIDv0', () => {
    expect(() => CIDTool.format('zb2rhhiSUwEBZxSyBL6wJmWB5i2U1J7BLdSdnUa73ptNrrCW7', { cidVersion: 0 }))
      .to.throw(/^Cannot convert a non dag-pb CID to CIDv0/)
  })
})
