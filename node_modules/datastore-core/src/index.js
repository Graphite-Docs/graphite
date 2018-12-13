/* @flow */
'use strict'

const KeytransformDatastore = require('./keytransform')
const ShardingDatastore = require('./sharding')
const MountDatastore = require('./mount')
const TieredDatastore = require('./tiered')
const NamespaceDatastore = require('./namespace')
const shard = require('./shard')

exports.KeytransformDatastore = KeytransformDatastore
exports.ShardingDatastore = ShardingDatastore
exports.MountDatastore = MountDatastore
exports.TieredDatastore = TieredDatastore
exports.NamespaceDatastore = NamespaceDatastore
exports.shard = shard
