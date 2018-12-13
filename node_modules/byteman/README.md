[![downloads][downloads-badge]][npm-stat]

[downloads-badge]: https://img.shields.io/npm/dm/byteman.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=byteman&from=2016-04-01

---

# 🤖 Byteman

Display bytes in a human readable format: KB, MB, GB, TB, PB, EB, ZB, YB

Byteman is short for "bytes to human" which is a tool to convert a number, normally the amount of bytes of something in to a human readable format. For example `1000` bytes will become `1KB`. Helping you work with big number more easily, and also helping you user understand better what is going on.

# Example

```javascript
let byteman = require('byteman');

let human_form = byteman(10000);
let human_form_decima = byteman(10000, 2);

console.log(human_form)
console.log(human_form_decima)
```

# Installation

```
$ npm install byteman -S
```

# The End

If you've enjoyed this article/project, please consider giving it a 🌟 or donate.

- [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/gattidavid/25)
- [![Star on GitHub](https://img.shields.io/github/stars/davidgatti/byteman.svg?style=social)](https://github.com/davidgatti/byteman/stargazers)
- [![Watch on GitHub](https://img.shields.io/github/watchers/davidgatti/byteman.svg?style=social)](https://github.com/davidgatti/byteman/watchers)

Also check out my [GitHub account](https://github.com/davidgatti), where I have other articles and apps that you might find interesting.

## Where to follow

You can follow me on social media 🐙😇, at the following locations:

- [GitHub](https://github.com/davidgatti)
- [Twitter](https://twitter.com/dawidgatti)
- [Instagram](https://www.instagram.com/gattidavid/)

## More about me

I don’t only live on GitHub, I try to do many things not to get bored 🙃. To learn more about me, you can visit the following links:

- [Podcasts](http://david.gatti.pl/podcasts)
- [Articles](http://david.gatti.pl/articles)
- [Technical Articles](http://david.gatti.pl/technical_articles)
- [Software Projects](http://david.gatti.pl/software_projects)
- [Hardware Projects](http://david.gatti.pl/hardware_projects)
