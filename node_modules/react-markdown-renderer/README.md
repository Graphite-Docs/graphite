# react-markdown-renderer

[![npm](https://img.shields.io/npm/v/react-markdown-renderer.svg)](https://www.npmjs.com/package/react-markdown-renderer)  
[![Build Status](https://travis-ci.org/InsidersByte/react-markdown-renderer.svg)](https://travis-ci.org/InsidersByte/react-markdown-renderer)
[![Coverage Status](https://coveralls.io/repos/github/InsidersByte/react-markdown-renderer/badge.svg?branch=master)](https://coveralls.io/github/InsidersByte/react-markdown-renderer?branch=master)
[![Code Climate](https://codeclimate.com/github/InsidersByte/react-markdown-renderer/badges/gpa.svg)](https://codeclimate.com/github/InsidersByte/react-markdown-renderer)
[![bitHound Overall Score](https://www.bithound.io/github/InsidersByte/react-markdown-renderer/badges/score.svg)](https://www.bithound.io/github/InsidersByte/react-markdown-renderer)  
[![Dependency Status](https://david-dm.org/insidersbyte/react-markdown-renderer.svg)](https://david-dm.org/insidersbyte/react-markdown-renderer)
[![peerDependency Status](https://david-dm.org/insidersbyte/react-markdown-renderer/peer-status.svg)](https://david-dm.org/insidersbyte/react-markdown-renderer#info=peerDependencies)
[![devDependency Status](https://david-dm.org/insidersbyte/react-markdown-renderer/dev-status.svg)](https://david-dm.org/insidersbyte/react-markdown-renderer#info=devDependencies)

[![NPM](https://nodei.co/npm/react-markdown-renderer.png?downloads=true&downloadRank=true)](https://nodei.co/npm/react-markdown-renderer/)

Simple React component that renders Markdown, built with [remarkable](https://github.com/jonschlinkert/remarkable). 

## Installing

```bash
npm install react-markdown-renderer --save
```

## Basic Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownRenderer from 'react-markdown-renderer';

const markdown = '# This is a H1  \n## This is a H2  \n###### This is a H6';

ReactDOM.render(
  <MarkdownRenderer markdown={markdown} />,
  document.getElementById('content')
);
```

## Props

#### `markdown: string`

The raw markdown that will be converted to html.

#### `options: Object` (optional)

Default value: `{ preset: 'default' }`

The [options](https://github.com/jonschlinkert/remarkable#option) and [preset](https://github.com/jonschlinkert/remarkable#presets) for [remarkable](https://github.com/jonschlinkert/remarkable).

> All other props are transferred via spreading (see [here](https://facebook.github.io/react/docs/transferring-props.html)).

## Contributing

Contributions are very welcome!

Please note that by submitting a pull request for this project, you agree to license your contribution under the [MIT License](https://github.com/insidersbyte/react-markdown-renderer/blob/master/LICENSE) to this project.

## License

Published under the [MIT License](https://github.com/insidersbyte/react-markdown-renderer/blob/master/LICENSE).
