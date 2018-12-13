{Generator} = require '../lib/main.js'

g = new Generator({auto_stop: true, auto_stop_bits: 256})
await setTimeout defer(), 500
console.log "GENERATE STARTING"
await g.generate 512, defer vals
console.log vals.join ","
await setTimeout defer(), 1000
await g.generate 128, defer vals
console.log vals.join ","
await setTimeout defer(), 1000
console.log "killing"
console.log "killed and waiting a sec"
await setTimeout defer(), 1000
console.log "exiting"
process.exit 0
