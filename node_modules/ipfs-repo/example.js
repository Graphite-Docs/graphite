'use strict'

const Repo = require('ipfs-repo')
const repo = new Repo('/Users/awesome/.jsipfs')

repo.init({my: 'config'}, (err) => {
  if (err) {
    throw err
  }

  repo.open((err) => {
    if (err) {
      throw err
    }

    console.log('repo is ready')
  })
})
