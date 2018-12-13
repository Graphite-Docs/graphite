# react-markdown-editor

[![npm (scoped)](https://img.shields.io/npm/v/@insidersbyte/react-markdown-editor.svg)](https://www.npmjs.com/package/@insidersbyte/react-markdown-editor)  
[![Build Status](https://travis-ci.org/InsidersByte/react-markdown-editor.svg)](https://travis-ci.org/InsidersByte/react-markdown-editor)
[![Coverage Status](https://coveralls.io/repos/github/InsidersByte/react-markdown-editor/badge.svg?branch=master)](https://coveralls.io/github/InsidersByte/react-markdown-editor?branch=master)
[![Code Climate](https://codeclimate.com/github/InsidersByte/react-markdown-editor/badges/gpa.svg)](https://codeclimate.com/github/InsidersByte/react-markdown-editor)
[![bitHound Overall Score](https://www.bithound.io/github/InsidersByte/react-markdown-editor/badges/score.svg)](https://www.bithound.io/github/InsidersByte/react-markdown-editor)  
[![Dependency Status](https://david-dm.org/insidersbyte/react-markdown-editor.svg)](https://david-dm.org/insidersbyte/react-markdown-editor)
[![peerDependency Status](https://david-dm.org/insidersbyte/react-markdown-editor/peer-status.svg)](https://david-dm.org/insidersbyte/react-markdown-editor#info=peerDependencies)
[![devDependency Status](https://david-dm.org/insidersbyte/react-markdown-editor/dev-status.svg)](https://david-dm.org/insidersbyte/react-markdown-editor#info=devDependencies)

[![NPM](https://nodei.co/npm/@insidersbyte/react-markdown-editor.png?downloads=true&downloadRank=true)](https://nodei.co/npm/@insidersbyte/react-markdown-editor/)

[React](http://facebook.github.io/react) Markdown editor with preview, built with [react-markdown-renderer](https://github.com/insidersbyte/react-markdown-renderer).

## Demo
http://insidersbyte.github.io/react-markdown-editor

## Installing

```bash
npm install @insidersbyte/react-markdown-editor --save
```

## Basic Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownEditor from '@insidersbyte/react-markdown-editor';
import '@insidersbyte/react-markdown-editor/dist/css/react-markdown-editor.css';

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            markdown: '# This is a H1  \n## This is a H2  \n###### This is a H6',
        };

        this.updateMarkdown = this.updateMarkdown.bind(this);
    }

    updateMarkdown(event) {
        this.setState({ markdown: event.target.value });
    }

    render() {
        return (
            <MarkdownEditor
                value={this.state.markdown}
                onChange={this.updateMarkdown}
            />
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
```

## Props

* value (*string*) - the raw markdown that will be converted to html (**required**)
* onChange (*function*) - called when a change is made (**required**)
* options (*object*) - the options for remarkable (see [here](https://github.com/jonschlinkert/remarkable#options)) (default: { })

## Styles

You can either write your own css for this component or use the one provided. If you want to write your own look at [react-markdown-editor.styl](https://github.com/InsidersByte/react-markdown-editor/blob/master/src/react-markdown-editor.styl) for an idea on how to style this component.

## Contributing

Contributions are very welcome!

Please note that by submitting a pull request for this project, you agree to license your contribution under the [MIT License](https://github.com/insidersbyte/react-markdown-editor/blob/master/LICENSE) to this project.

## License

Published under the [MIT License](https://github.com/insidersbyte/react-markdown-editor/blob/master/LICENSE).
