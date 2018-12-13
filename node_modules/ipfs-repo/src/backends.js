'use strict'

exports.create = function createBackend (name, path, options) {
  const Ctor = options.storageBackends[name]
  const backendOptions = Object.assign({}, options.storageBackendOptions[name] || {})
  return new Ctor(path, backendOptions)
}
