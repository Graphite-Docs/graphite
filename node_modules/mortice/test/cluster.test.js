import test from 'ava'
import exec from 'execa'
import path from 'path'

test('executes locks in correct order', (t) => {
  return exec('node', [path.join(__dirname, 'fixtures', 'cluster.js')])
    .then(result => {
      t.is(result.stdout, `write 1
read 1
read 2
read 3
write 2
read 4`)
    })
})

test('executes locks in correct order on a single process', (t) => {
  return exec('node', [path.join(__dirname, 'fixtures', 'cluster-single-thread.js')])
    .then(result => {
      t.is(result.stdout, `write 1
read 1
read 2
read 3
write 2
read 4`)
    })
})
