import test from 'ava'
import exec from 'execa'
import path from 'path'

test('executes locks in correct order', (t) => {
  return exec('node', [path.join(__dirname, 'fixtures', 'process.js')])
    .then(result => {
      t.is(result.stdout, `write 1
read 1
read 2
read 3
write 2
read 4`)
    })
})
