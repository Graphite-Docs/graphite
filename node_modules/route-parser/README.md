[![Build Status](https://travis-ci.org/rcs/route-parser.png?branch=master)](https://travis-ci.org/rcs/route-parser)
[![Dependency Status](https://david-dm.org/rcs/route-parser.svg?theme=shields.io)](https://david-dm.org/rcs/route-parser)
[![devDependency Status](https://david-dm.org/rcs/route-parser/dev-status.svg?theme=shields.io)](https://david-dm.org/rcs/route-parser#info=devDependencies)
## What is it?

A isomorphic, bullet-proof, ninja-ready route parsing, matching, and reversing library for Javascript in Node and the browser.

## Is it any good?

Yes.

## Why do I want it?

You want to write routes in a way that makes sense, capture named parameters, add additional constraints to routing, and be able to generate links using your routes. You don't want to be surprised by limitations in your router or hit a spiral of additional complexity when you need to do more advanced tasks.


## How do I install it?

```Shell
npm install --save route-parser
```

## How do I use it?

```javascript
Route = require('route-parser');
var route = new Route('/my/fancy/route/page/:page');
route.match('/my/fancy/route/page/7') // { page: 7 }
route.reverse({page: 3}) // -> '/my/fancy/route/page/3'
```
## What can I use in my routes?

| Example         | Description          |
| --------------- | -------- |
| `:name`         |  a parameter to capture from the route up to `/`, `?`, or end of string  |
| `*splat`        |  a splat to capture from the route up to `?` or end of string |
| `()`            |  Optional group that doesn't have to be part of the query. Can contain nested optional groups, params, and splats
| anything else   | free form literals |

Some examples:

* `/some/(optional/):thing`
* `/users/:id/comments/:comment/rating/:rating`
* `/*a/foo/*b`
* `/books/*section/:title`
* `/books?author=:author&subject=:subject`


## How does it work?

We define a grammar for route specifications and parse the route. Matching is done by generating a regular expression from that tree, and reversing is done by filling in parameter nodes in the tree.




## FAQ
### Isn't this over engineered? A full parser for route specifications?
Not really. Parsing route specs into regular expressions gets to be problematic if you want to do named captures and route reversing. Other routing libraries have issues with parsing one of `/foo(/:bar)` or `/foo(/:bar)`, and two-pass string-to-RegExp transforms become complex and error prone.

Using a parser here also gives us the chance to give early feedback for any errors that are made in the route spec.

### Why not use...

#### [RFC 6570 URI Templates](http://tools.ietf.org/html/rfc6570) directly?

URI templates are designed for expanding data into a template, not matching a route.  Taking an arbitrary path and matching it against a URI template isn't defined. In the expansion step of URI templates, undefined variables can be evaluated to `''`, which isn't useful when trying to do route matching, optional or otherwise. To use a URI-template-like language is possible, but needs to be expanded past the RFC

### [Express](http://expressjs.com/)/[Backbone.Router](http://backbonejs.org/docs/backbone.html#section-155)/[Director](https://github.com/flatiron/director) style routers

These all lack named parameters and reversability.

Named parameters are less brittle and reduce the coupling betwen routes and their handlers. Given the routes `/users/:userid/photos/:category` and `/photos/:category/users/:userid`, backbone style routing solutions require two different handlers. Named parameters let you use just one.

Reversibility means you can use a single route table for your application for matching and generating links instead of throwing route helper functions throughout your code.


## Related

* [rails/journey](http://github.com/rails/journey)
* [url-pattern](http://github.com/snd/url-pattern)
* [Director](https://github.com/flatiron/director)
