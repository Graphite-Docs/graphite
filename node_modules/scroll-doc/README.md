# scrollDoc
Feature detected access to the scroller element

``` javascript
import scrollDoc from 'scroll-doc';

const scrollElement = scrollDoc();

// scroll to the top
scrollElement.scrollTop = 0;
```

### How it works
ScrollDoc uses feature detection to detect which element is valid for scrolling the document. It attempts to scroll 1px using document.documentElement if it succeeds, it will reset document.documentElement to it's original scroll position and return document.documentElement; if it fails, it will return document.body. The result is cached and the cached value is returned on subsequent calls.
