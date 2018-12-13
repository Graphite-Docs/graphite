# gar
> The lightweight Node arguments parser

[GitHub](https://github.com/ethanent/gar) | [NPM](https://www.npmjs.com/package/gar)

## Install

```bash
npm i gar
```

## Use

![gar usage demo](https://i.imgur.com/Ln6A8Nn.png)

```javascript
const args = require('gar')(process.argv.slice(2))

console.log(args)
```

So for: `-h hey --toggle -ac --hey=hi -spaced "hey there" -num 1 lone`

```json
{
	"h": "hey",
	"toggle": true,
	"a": true,
	"c": true,
	"hey": "hi",
	"spaced": "hey there",
	"num": 1,
	"_": ["lone"]
}
```

## Why use gar?

gar is way more lightweight than other argument parsing packages.

<img src="https://pbs.twimg.com/media/DSVYanWVwAADiCB.jpg:large" alt="gar is less than 4% the size of the optimist library."/>

Package | Size (KB) | Dependencies<br />(Tree Count) | Size Comparison<br />(vs. gar)
--- | --- | --- | ---
optimist | 109 | [2](http://npm.anvaka.com/#/view/2d/optimist) | 27.25x
minimist | 31 | [0](http://npm.anvaka.com/#/view/2d/minimist) | 7.75x
args-parser | 15 | [0](http://npm.anvaka.com/#/view/2d/args-parser) | 3.75x
gar | 4 | [0](http://npm.anvaka.com/#/view/2d/gar) | 1x