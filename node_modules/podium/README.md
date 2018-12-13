# podium

Node (semi) compatible event emitter with extra features.

**podium** is an event emitter with support for tags, filters, channels, event update cloning,
arguments spreading, and other features useful when building large scale applications.
While node's native [`EventEmitter`](https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter) is strictly focused on maximum performance, 
it lacks many features that do not belong in the core implementation. **podium** is not restricted by 
node's performance requirement as it is designed for application layer needs where it's overhead 
is largely insignificant as implementing these features will have similar cost on top of the native emitter.

[![Build Status](https://secure.travis-ci.org/hapijs/podium.svg)](http://travis-ci.org/hapijs/podium)

Lead Maintainer - [Eran Hammer](https://github.com/hueniverse)

## `new Podium(events)`

This creates a new event emitter.

```javascript
const Podium = require('podium');
const podiumObject = new Podium(); // new emitter

const podiumObject2 = new Podium('event1');// creates new event and calls registerEvent()
```

## `podium.registerEvent(events)`

Registers an event `event1` to emitter.

```javascript
podiumObject.registerEvent('event1');

//with optional parameters
podiumObject.registerEvent({
        name: 'event1',
        shared: true
 });
```

## `podium.on(criteria, listener)`

Subscribe a handler to an event. Handler can be seen a function which will be called when the event occurs.

```javascript
podiumObject.registerEvent('event1');

podiumObject.on('event1',function(update){ // Way 1
    console.log('inside autonomous listener without name! data:', update);
});

const listener1 = function() { // normal function object
    console.log('listener1 called');
}
podiumObject.on('event1',listener1); // Way 2
```

## `podium.addListener(criteria, listener)`

Same as `podium.on()`.

```javascript
podiumObject.addListener('event1',listener1);
```

## `podium.once(criteria, listener)`

Same as calling podium.on() with the count option set to 1. Whenever we call emit(), `listener1` will get fired
but also get removed, so that it won't get fired on call to emit().

```javascript
podiumObject.once('event1',listener1);
```

## `podium.emit(criteria, data, [callback])`

Emits an event update to all the subscribed listeners.

```javascript
podiumObject.emit('event1','here we can send any data to listeners.');
```

## `podium.removeListener(name, listener)`

Removes all listeners subscribed to a given event name matching the provided listener method.

```javascript
podiumObject.removeListener('event1',listener1);
```

## `podium.removeAllListeners(name)`

Removes all listeners subscribed to a given event name.

```javascript
podiumObject.removeAllListeners('event1');
```

## `podium.hasListeners(name)`

Returns whether an event has any listeners subscribed.

```javascript
if(podiumObject.hasListeners('event1')){
    console.log('this event has some listeners left');
}
else{
    console.log('this event has no listeners');
}

```

## `podium.registerPodium(podiums)`

Registers a podium object(emitter) to another podium object(source). Whenever any event gets registered on `emitterObject` it gets registered on `sourceObject` as well. But reverse is not true.

```javascript
const source1Object = new Podium('test');
const source2Object = new Podium('test');

const emitterObject = new Podium(source1Object);
emitterObject.registerPodium(source2Object);

const listener1 = function() { // normal function
    console.log('listener1 called');
}
const listener2 = function() { // another normal function
    console.log('listener1 called');
}
emitterObject.on('test',listener1); // listener1 gets registered on emitterObject, source1Object,source2Object events
source1Object.on('test',listener2); // listener2 gets registered on source1Object events only

source1Object.emit('test', 1); // runs all registered events
emitterObject.emit('test', 2);
```

## API

The full API is available in the [API documentation](https://github.com/hapijs/podium/blob/master/API.md).

