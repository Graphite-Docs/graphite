# observable-webworkers

Allow you to listen to messages emitted by web workers

## Install

```sh
$ npm install --save observable-webworkers
```

## Usage

```javascript
const observe = require('observable-webworkers')

const worker = new Worker('my-worker-script.js')

observe(worker)

observe.addEventListener('message', (worker, event) => {
  console.info(event.data)
})
```
