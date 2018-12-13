<p align="center">
  <a href="https://travis-ci.org/evcohen/react-proptype-conditional-require">
    <img src="https://api.travis-ci.org/evcohen/react-proptype-conditional-require.svg?branch=master"
         alt="build status">
  </a>
  <a href="https://npmjs.org/package/react-proptype-conditional-require">
    <img src="https://img.shields.io/npm/v/react-proptype-conditional-require.svg"
         alt="npm version">
  </a>
  <a href="https://github.com/evcohen/react-proptype-conditional-require/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/react-proptype-conditional-require.svg"
         alt="license">
  </a>
  <a href='https://coveralls.io/github/evcohen/react-proptype-conditional-require?branch=master'>
    <img src='https://coveralls.io/repos/github/evcohen/react-proptype-conditional-require/badge.svg?branch=master' alt='Coverage Status' />
  </a>
</p>

# react-proptype-conditional-require

Conditionally require propTypes based on other props and variables.

# getting started

```
$ npm install --save react-proptype-conditional-require
```

# example

``` js
import React, { PropTypes } from 'react';
import isRequiredIf from 'react-proptype-conditional-require';

const Hello = props => <div className={props.className}>Hello {props.value}!</div>;

Hello.defaultProps = {
  value: 'World'
};

const { string } = PropTypes;

Hello.propTypes = {
  value: string
  className: isRequiredIf(string, (props, propName, componentName) => props.hasOwnProperty('value'))
};
```

# syntax

This is a function that accepts a propType (a typeValidator function) and a condition in which to enforce this propType for React components. The function uses the signature:

```js
import isRequiredIf from 'react-proptype-conditional-require';

...

Component.propTypes = {
  foo: isRequiredIf(typeValidator, conditional[, message])
}

```

# usage

## typeValidator
A function that takes the arguments (props, propName, componentName) and returns an Error object if the validation fails. Do not `console.warn` or `throw`.
  - props - An object containing all of the props passed to the instance.
  - propName - The current key of the prop object under validation.
  - componentName - The class of the React component.

**NOTE: All of the React built-in proptypes use this signature and you will usually use them to specify the typeValidator**:

```js
import React, { PropTypes } from 'react';
import isRequiredIf from 'react-proptype-conditional-require';

const { string, bool } = PropTypes;

...

Component.propTypes = {
  first: isRequiredIf(string, true),
  second: isRequiredIf(bool, false)
}

...
```

## conditional
A boolean *or* function that returns a truthy value that indicates whether the prop is required or not. The function follows the same signature as the typeValidator function: (props, propName, componentName). It should return a boolean, but any truthy value will do.

A common use case:

```js
import React, { PropTypes } from 'react';
import isRequiredIf from 'react-proptype-conditional-require';

const { string } = PropTypes;

...

Component.propTypes = {
  label: string,
  labelClassName: isRequiredIf(string, props => props.hasOwnProperty('label'));
}

...
```

In that case, the labelClassName will only be required if label is passed.

## message (optional)
A string that specifies the custom error message that you would like to provide if the prop is required but missing. If not provided, the error message used by React will be default.

```js
import React, { PropTypes } from 'react';
import isRequiredIf from 'react-proptype-conditional-require';

const { string } = PropTypes;

...

Component.LABEL_CLASSNAME_ERROR_MESSAGE = 'You must provide a labelClassName when passing down the label prop';

Component.propTypes = {
  label: string,
  labelClassName: isRequiredIf(string, props => props.hasOwnProperty('label'), Component.LABEL_CLASSNAME_ERROR_MESSAGE);
}

...
```

The above code snippet would throw the custom error message if the label prop were passed but the labelClassName prop was not.

# license
MIT License.