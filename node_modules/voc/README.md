# Very Ornate Code

So [Literate Coffeescript](http://coffeescript.org/#literate) is a cool idea,
but why isn't there a standard JS or compile-to-JS version?  JS Programmers want
some love too!  This is my effort to rectify this inequity.

## How to use this

To use in-browser, include the marked source (and optionally the coffee-script 
source if desired):

```html
<script src="https://raw.github.com/chjj/marked/master/lib/marked.js"></script>
<script src="http://coffeescript.org/extras/coffee-script.js"></script>
```

In tooling, `npm install -g voc` and run against your markdown file:

```bash
$ voc yourfile.md
```

## VOC style

VOC searches for markdown code blocks.  Using GFM guards (triple backticks),
hints after the opening backticks are used to direct content.

For example, "\`\`\`&gt;foo.bar" will redirect content in the codeblock to 
`foo.bar`.  

## Preprocessing

If a preprocessor is available, VOC can be told to use it!  This is needed for
certain magic cases like Makefiles (which require explicit tabs).

VOC exposes two utility functions:

`VOC.run(src)` will process the specified string source.

`VOC.add(lang, cb)` will assign the handler for the language.  If `lang` is an
array, the handler will be assigned for each language in the array.

The language handlers will be called with one argument: the actual source to be
processed.  Consecutive blocks with the same language are concatenated.

See the enclosed [voc.md](voc.md) for more information.

[![Dependencies Status](https://david-dm.org/sheetjs/voc/status.svg)](https://david-dm.org/sheetjs/voc)
[![NPM Downloads](https://img.shields.io/npm/dt/voc.svg)](https://npmjs.org/package/voc)
[![ghit.me](https://ghit.me/badge.svg?repo=sheetjs/js-xlsx)](https://ghit.me/repo/sheetjs/js-xlsx)
[![Analytics](https://ga-beacon.appspot.com/UA-36810333-1/SheetJS/voc?pixel)](https://github.com/SheetJS/voc)

