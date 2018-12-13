# data-queue
Queue and get data

# Usage
```js
const Queue = require("data-queue")

const queue = Queue() //create without new

queue.get((err, data) => { //this will wait for .append()/.prepend() or .error() calls
  console.log(data)
  queue.get((err, data) => {
    if (err) throw err //Throw the error
  })
})

queue.append("Hi there")

queue.error(new Error("Something fatal happened"))

queue.append("What's up?") //This won't append the data. instead it will return the error

console.log(queue.height()) //This gets the number of items in the queue
```
