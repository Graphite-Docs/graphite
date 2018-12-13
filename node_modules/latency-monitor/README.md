# latency-monitor

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]  [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

> A monitor that periodically times how long it takes for a callback to be called. Think event loop latency.


## Usage
This tool allows you to time and get summaries of how long async functions took. By default, it assumes you want to measure
event loop latency, but as [this example](https://github.com/mlucool/latency-monitor/blob/master/examples/customFnMonitor.js) shows,
you can use it for a simple ping pong setup with Promises too. This code works in both browsers and node.js and will do its best effort to use as accurate a timer as possible.


Example event loop monitor (default).
```javascript
import LatencyMonitor from 'latency-monitor';

const monitor = new LatencyMonitor();
console.log('Event Loop Latency Monitor Loaded: %O', {
    latencyCheckIntervalMs: monitor.latencyCheckIntervalMs,
    dataEmitIntervalMs: monitor.dataEmitIntervalMs
});
monitor.on('data', (summary) => console.log('Event Loop Latency: %O', summary));
/*
 * In console you will see something like this:
 * Event Loop Latency Monitor Loaded:
 *   {dataEmitIntervalMs: 5000, latencyCheckIntervalMs: 500}
 * Event Loop Latency:
 *   {avgMs: 3, events: 10, maxMs: 5, minMs: 1, lengthMs: 5000}
 */
```
 
## More Theory
We use `setTimeout` to pick when to run the next test. We do this so we can add in some randomness to avoid aligning
our events with some external event (e.g. another timer that triggers a slow event). When we are monitoring event loop latency
(i.e. no async function provided), then we simply record how long getting the callback really took.
When we measure an async function, we only time how long that async function took to call the passed in `cb`.

When used in a browser, this tool disables itself if the page is hidden because of restrictions with how often we can
call setTimeout see [this](http://stackoverflow.com/questions/6032429/chrome-timeouts-interval-suspended-in-background-tabs).

When monitoring event loop latency, we add in 1ms to all measurements. `setTimeout` is not more accurate than 1ms, so this ensures
every number is greater than 0. To remove this offset, simply subtract 1 from all stats.
**TLDR; event loop latency monitoring does NOT have sub-millisecond accuracy, even if the emitted numbers show this.**

## Installation

Install `latency-monitor` as a dependency:

```shell
npm install --save latency-monitor
```

## On Demand Browser Latency
We also host a copy of the browser event loop latency detector on [jsdelivr](https://www.jsdelivr.com/projects/latency-monitor).
To use this, you can include the script in a src tag, or simply load it in Chrome DevTools. You should expect to see
the same output as documented above in [usage](#usage).

Load via `script` element (paste into page's html):
```html
<script src='//cdn.jsdelivr.net/latency-monitor/0.2.1/EventLoopPrinterWebpacked.js'></script>
```

Load via `script` in JavaScript (paste in your devtools - e.g. Chrome DevTools):
```javascript
var el = document.createElement('script');
el.setAttribute('src', 'https://cdn.jsdelivr.net/latency-monitor/0.2.1/EventLoopPrinterWebpacked.js')
document.body.appendChild(el)
```

Load via `jquery` (if you have `$` loaded on the page already, paste this in Chrome DevTools or in your code):
```javascript
$.getScript('//cdn.jsdelivr.net/latency-monitor/0.2.1/EventLoopPrinterWebpacked.js');
```

Last resort: Load via XMLHTTPRequest:
```javascript
var xhr = new XMLHttpRequest();
xhr.open("GET", "//cdn.jsdelivr.net/latency-monitor/0.2.1/EventLoopPrinterWebpacked.js", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // WARNING! Might be evaluating an evil script!
    var resp = eval(xhr.responseText);
  }
};
xhr.send();
```
**Note**: Remember to change 0.2.1 above to whatever is the [latest version](https://www.npmjs.com/package/latency-monitor) of latency-monitor.

## Debugging
We use [debug](https://github.com/visionmedia/debug). In node set env variable `DEBUG=latency-monitor:*` 
or in a browser `localStorage.debug='latency-monitor'` to see debugging output.

## Notes
This is a reasonable attempt to make a latency monitor. There are issues such as:
- We don't wait for the last event to finish when emitting stats. This means if the last event in a cycle takes the longest,
or is never returned, then for that cycle large latency isn't recorded.

License
-------------
[Apache-2.0 License](http://www.apache.org/licenses/LICENSE-2.0)

[npm-url]: https://npmjs.org/package/latency-monitor
[npm-image]: https://badge.fury.io/js/latency-monitor.svg

[travis-url]: http://travis-ci.org/mlucool/latency-monitor
[travis-image]: https://secure.travis-ci.org/mlucool/latency-monitor.png?branch=master

[coveralls-url]: https://coveralls.io/github/mlucool/latency-monitor?branch=master
[coveralls-image]: https://coveralls.io/repos/mlucool/latency-monitor/badge.svg?branch=master&service=github

[depstat-url]: https://david-dm.org/mlucool/latency-monitor
[depstat-image]: https://david-dm.org/mlucool/latency-monitor.png

