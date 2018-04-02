shorten.js
================

Shorten is a free url-shortener extending githubs internal url-shortener with the ability to shorten urls outside of githubs own domain.

## Installation

###bower
```bash
bower install shorten --save
```

###cdn
```html
  <script type="text/javascript" src="https://cdn.rawgit.com/shorten/js/master/dist/0.2.0/shorten.js"></script>

```
##Usage


```javascript
var longUrl = 'http://news.ycombinator.com';

shorten.url(longUrl, function(err, shortenUrl){
  if(err){
    //handle error
  }

  console.log(shortenUrl);
});
```

## LICENSE

(MIT License)

Copyright (c) 2015 Piérre Reimertz <pierrereimertz@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
