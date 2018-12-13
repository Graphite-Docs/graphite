PriorityQueue
====
An implementation of priority queue in javascript.

Installation
----
```
npm install priorityqueue
```

Example
----
```
import PriorityQueue from 'priorityqueue';

class Point{
  constructor(x, y){
    this.x = x;
	this.y = y;
  }
}

let pq = new PriorityQueue({
	comparator: (a, b)=>
	  a.x !== b.x ? a.x - b.x : a.y - b.y;
});

pq.push(new Point(4,6));
pq.push(new Point(2,3));
pq.push(new Point(5,1));
pq.push(new Point(1,2));
pq.pop() // Point{x: 5, y: 1}
pq.top() // Point{x: 4, y: 6}
pq.push(new Point(3,4));
pq.push(new Point(6,5));
pq.size() // 5
pq.top() // Point{x: 6, y: 5}
```

Options
----
## PriorityQueue(options = {})
### options.comparator
`options.comparator` will define an order relation of each values in PriorityQueue.

PriorityQueue with default comparator serves as numerical descending order for numeric values, or lexical descending order for string values.

comparator function format is in according with an argument function of `Array.prototype.sort()`. 


### options.strategy
- PriorityQueue.BinaryHeapStrategy (default)
- PriorityQueue.SkewHeapStrategy
- PriorityQueue.PairingHeapStrategy

All of above strategies are faster than simple implementation such that with `Array.prototype.push() / sort() & pop()`, in the sense of time complexity. 

A binary heap is simple(-er than almost other) and has an in-place algorithm and low complexity.

A skew heap and pairing heap are also faster, but these implementation requires using "linked list" structure. Thus, a bit slow. Why these strategies exist? In case of merging queues, time complexity of two each merging is constant time. 


API
----
## new PriorityQueue(options = {})
Returns new empty instance of `PriorityQueue`.

## clear()
Clear the instance of priority queue.

## from(array)
Fill/Build the instance with entire contents of the array.
if some items are in the instance, these will be dereferenced.

## toArray()
Returns a copy of collection in the instance.

## size()
Returns the number of items in the instance.

## push(value)
## enqueue(value)
Pushes the value at the instance.

## top()
## peek()
Peeks at the top of the instance in order specified by `options.comparator`.

## pop()
## dequeue()
Pops the top of the instance.

## empty()
Returns the instance is empty or not.