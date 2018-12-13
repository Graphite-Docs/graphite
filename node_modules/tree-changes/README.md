tree-changes
===

[![NPM version](https://badge.fury.io/js/tree-changes.svg)](https://www.npmjs.com/package/tree-changes) 
[![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) 
[![Maintainability](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/maintainability)](https://codeclimate.com/github/gilbarbara/tree-changes/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/test_coverage)](https://codeclimate.com/github/gilbarbara/tree-changes/test_coverage)

Get changes between two versions of the same object.  
A good use for this is in [React](https://reactjs.org/) lifecycle methods, like `componentWillReceiveProps` or `componentDidUpdate`.

### Setup

```bash
npm install tree-changes
```

### Usage

```js
import treeChanges from 'tree-changes';

const A = {
    status: 'idle',
    hasData: false,
    data: { a: 1 },
    items: [{ name: 'test' }],
    ratio: 0.45,
    retries: 0,
    switch: false,
};

const B = {
    status: 'done',
    hasData: true,
    data: { a: 1 },
    items: [],
    ratio: 0.4,
    retries: 1,
};

const { changed, changedFrom, changedTo, increased, decreased } = treeChanges(objA, objB);

if (changed('status')) {
    // do something
}

if (changedFrom('retries', 0, 1) {
    // should we try again?
}

// works with array values too
if (changedFrom('status', 'idle', ['done', 'ready']) {
    // status has changed!
}

if (decreased('ratio')) {
    // hey, slow down.
}
```

### With React

```js
import treeChanges from 'tree-changes';

class Comp extends React.Component {
    ...
    componentDidUpdate(prevProps) {
        const { changedFrom, changedTo } = treeChanges(prevProps, this.props);
        
        if (changedFrom('retries', 0, 1) {
            // dispatch some error
        }
        
        if (changedTo('hasData', true)) {
            // send data to analytics or something.
        }
    }
    ...
}
```

### API

**changed(key: string)**  
Check if the value has changed. Supports objects and arrays.

**changedFrom(key: string, previous: string | boolean | number, actual: string | boolean | number)**  
Check if the value has changed from `previous` to `actual`. 

**changedTo(key: string, actual: string | boolean | number)**  
Check if the value has changed to `actual`. 

**increased(key: string)**  
Check if both versions are numbers and the value has increased. 

**decreased(key: string)**  
Check if both versions are numbers and the value has decreased. 



