'use strict'

// Default configuration for the datastore spec in node.js
module.exports = {
  Spec: {
    type: 'mount',
    mounts: [
      {
        mountpoint: '/blocks',
        type: 'measure',
        prefix: 'flatfs.datastore',
        child: {
          type: 'flatfs',
          path: 'blocks',
          sync: true,
          shardFunc: '/repo/flatfs/shard/v1/next-to-last/2'
        }
      },
      {
        mountpoint: '/',
        type: 'measure',
        prefix: 'leveldb.datastore',
        child: {
          type: 'levelds',
          path: 'datastore',
          compression: 'none'
        }
      }
    ]
  }
}
