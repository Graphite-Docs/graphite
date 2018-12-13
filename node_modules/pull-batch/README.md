# pull-batch

Transform arrays of objects into arrays with a maximum length

# Install

```bash
$ npm install pull-batch --save
```

# Use

```js
const pullBatch = require('pull-batch')

const maxLength = 5

pull(
  pull.values([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  pullBatch(maxLength),
  sink
)
```

# License

ISC