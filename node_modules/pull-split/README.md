# pull-split

[split](https://github.com/dominictarr/split) ported to
[pull-stream](https://github.com/dominictarr/pull-stream) style.

## Example

``` js
var pull = require('pull-stream')
var split = require('pull-split')

pull(
  textStream
  split(),
  output
)
```

if the textStream is buffers, and contain UTF8
(it probably will if you have german or chinese friends, etc)
then you MUST use this with `pull-utf8-decoder`

``` js
var pull = require('pull-stream')
var split = require('pull-split')
var utf8 = require('pull-utf8-decoder')

pull(
  textStream
  utf8(),
  split(),
  output
)
```

## split(matcher, mapper, reverse, skipLast)

### matcher - string or regexp.

unit to split by, defaults to `\n`

### mapper - function

function to apply to each line matched.

### reverse - boolean

if true, emit lines in reverse. use this if the input is a file
you are reading backwards.

### skipLast - boolean

use this to skip the last value if it is and empty string `''`
if this is not set then the behavior is the same as `String#split`

## License

MIT

