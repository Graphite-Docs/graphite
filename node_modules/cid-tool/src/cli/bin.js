#! /usr/bin/env node

'use strict'

const yargs = require('yargs')

// eslint-disable-next-line
yargs
  .demandCommand(1)
  .commandDir('commands')
  .help()
  .argv
