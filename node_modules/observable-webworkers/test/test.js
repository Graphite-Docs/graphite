import test from 'ava'
import exec from 'execa'
import path from 'path'

test('it should spawn a worker', (t) => {
  return exec('run-headless', {
    input: exec('browserify', [path.join(__dirname, 'fixtures', 'spawn.js')]).stdout
  })
    .then(result => {
      t.is(result.stdout, `ok`)
    })
})
