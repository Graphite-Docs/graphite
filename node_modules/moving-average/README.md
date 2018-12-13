# moving-average

[![Build Status](https://travis-ci.org/pgte/moving-average.svg?branch=master)](https://travis-ci.org/pgte/moving-average)

Online calculation of Exponential Moving Average for Node.js.

Also suports Moving Variance, Moving Deviation and Forecast.

The [following](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average) online algorythm is implemented:

```
diff := x - mean
incr := alpha * diff
mean := mean + incr
variance := (1 - alpha) * (variance + diff * incr)
forecast := mean + alpha * diff
```

## Install

```bash
$ npm install moving-average
```

## Use

```javascript
var timeInterval = 5 * 60 * 1000; // 5 minutes

var MA = require('moving-average');
var ma = MA(timeInterval);

setInterval(function() {
  ma.push(Date.now(), Math.random() * 500);
  console.log('moving average now is', ma.movingAverage());
  console.log('moving variance now is', ma.variance());
  console.log('moving deviation now is', ma.deviation());
  console.log('forecast is', ma.forecast());
});
```

## License

MIT
