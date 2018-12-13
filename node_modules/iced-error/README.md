
# IcedErrors

An integrated error system for dealing with errors, written for
and with IcedCoffeeScript.  I found myself doing this stuff everytime
I wrote a new project, so better to standardize it.

## Enumerated Error Types

In your `lib/error.iced` file:

```coffeescript

{make_errors} = require 'iced-error'
exports.E = make_errors
  NOT_FOUND : "Requested resource was not found"
  BAD_MAC : "MAC failed on header"
  INVAL : "Invalid value"
  DB_INSERT : "Error inserting into the database"  
```

In your `foo.iced` file:

```coffeescript
{E} = require './lib/error'

console.log E.OK                # prints 0
console.log E.NOT_FOUND         # prints 100
console.log E.msg[E.NOT_FOUND]  # prints "Requested resource was not found"
console.log E.msg.NOT_FOUND]    # prints "Requested resource was not found"
console.log E.name.NOT_FOUND    # prints "NOT_FOUND"
console.log E.name[E.NOT_FOUND] # prints "NOT_FOUND"
```

You can also use predefined Error classes:

```coffeescript
{E} = require './lib/error'

# You can throw these errors too
throw new E.NotFoundError("your file") 

# Will print [NotFoundError: your file (code 100)]
console.log new E.NotFoundError "your file"

# Will print "your file"
console.log (new E.NotFoundError "your file").message

# Will print 100
console.log (new E.NotFoundError "your file").code
```

## Error Short Circuiters

Catch errors all at once, not everywhere! 

```coffeescript
{make_esc} = require 'iced-error'
my_fn = (cb) ->
  esc = make_esc gcb, "my_fn"
  await socket.get 'image id', esc defer id
  await Image.findById id, esc defer image
  await check_permissions user, image, esc defer permitted
  gcb null, image
```
