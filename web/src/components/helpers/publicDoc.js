import React from 'react'
import {lookupProfile} from 'blockstack';
import axios from 'axios';
import Html from 'slate-html-serializer';
const lzjs = require('lzjs');
const BLOCK_TAGS = {
  blockquote: 'block-quote',
  p: 'paragraph',
  pre: 'code',
  ul: 'list',
  ol: 'ordered',
  li: 'list-item',
  div: 'align'
}
// Add a dictionary of mark tags.
const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
  pre: 'code',
  strike: 'strikethrough',
  span: 'color'
}

const INLINE_TAGS = {
  a: 'link'
}
const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]

      if (type) {
        if(type === 'align') {
          // console.log(el.getAttribute('class'))
          return {
            object: 'block',
            type: type,
            data: {
              class: el.getAttribute('class'),
            },
            nodes: next(el.childNodes),
          }
        } else {
          return {
            object: 'block',
            type: type,
            nodes: next(el.childNodes),
          }
        }

      }
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>
          case 'block-quote':
            return <blockquote>{children}</blockquote>
          case 'list':
            return <ul>{children}</ul>
          case 'heading-one':
            return <h1>{children}</h1>
          case 'heading-two':
            return <h2>{children}</h2>
          case 'heading-three':
            return <h3>{children}</h3>
          case 'heading-four':
            return <h4>{children}</h4>
          case 'heading-five':
            return <h5>{children}</h5>
          case 'heading-six':
            return <h6>{children}</h6>
          case 'list-item':
            return <li>{children}</li>
          case 'ordered':
            return <ol>{children}</ol>
          case 'table':
            return <table>{children}</table>
          case 'table_row':
            return <tr>{children}</tr>
          case 'table_cell':
            return <td>{children}</td>
          case 'align':
            return <div className={obj.data.get('class')}>{children}</div>
          case 'code-block':
            return <code>{children}</code>
          default: return ''
        }
      }
    }
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'mark',
          type: type,
          data: {
            class: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>
          case 'italic':
            return <em>{children}</em>
          case 'underline':
            return <u>{children}</u>
          case 'strikethrough':
            return <strike>{children}</strike>
          case 'color':
            return <span className={obj.data.get('class')}>{children}</span>
          case 'code':
            return <pre><code>{children}</code></pre>
          case 'code-block':
            return <pre className={obj.data.get('className')}><code>{children}</code></pre>
          default: return ''
        }
      }
    }
  },
    {
      deserialize(el, next) {
        const type = INLINE_TAGS[el.tagName.toLowerCase()]
        if (type) {
          // return console.log(el.style)
          return {
            object: 'inline',
            type: type,
            data: {
              href: el.getAttribute('href'),
              style: JSON.parse('{' + JSON.stringify(el.getAttribute('style')).split(':')[0] + '"' + JSON.parse(JSON.stringify(':')) + '"' + JSON.stringify(el.getAttribute('style')).split(':')[1] + '}'),
            },
            nodes: next(el.childNodes),
          }
        }
      },
      serialize(obj, children) {
        if (obj.object === 'inline') {
          switch (obj.type) {
            case 'link':
              return <a href={obj.data.get('href')}>{children}</a>
            case 'color':
              return <span style={ obj.data.get('style') }>{children}</span>
            default: return ''
          }
        }
      },
  },
]

const html = new Html({ rules })

export function loadInitial(props) {
  // this.setState({
  //   userToLoadFrom: props.substr(0, props.indexOf('-')),
  //   idToLoad: props.split('-')[1]
  // })
  // setTimeout(this.fetchData, 300);
}

export function fetchData() {
  const user = window.location.href.split('docs/')[1].split('-')[0]
  lookupProfile(user, "https://core.blockstack.org/v1/names")
  .then((profile) => {
    console.log(profile)
    this.setState({ url: profile.apps[window.location.origin]}, () => {
      this.loadDoc();
    })
  })
  .catch((error) => {
    console.log('could not resolve profile')
  })
}

export function loadDoc() {
  const id = window.location.href.split('docs/')[1].split('-')[1]
  axios.get(this.state.url + 'public/' + id+ '.json')
  .then((response) => {
    var responseHeaders = response.headers
    var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]];
    if(Object.keys(response.data).length > 0) {
      this.setState({
        lastUpdated: lastUpdated,
        singleDocIsPublic: response.data.singleDocIsPublic,
        title: response.data.title,
        readOnly: response.data.readOnly,
        words: response.data.words,
        wholeFile: response.data
      }, () => {
        if(this.state.readOnly) {
          this.setState({content: response.data.content, docLoaded: true})
        } else {
          this.setState({content: html.deserialize(lzjs.decompress(response.data.content)), docLoaded: true})
        }
      })
    } else {
      this.setState({
        singleDocIsPublic: false,
      })
    }
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

//this function is for TextEdit...
export function handlePubChange(change) { //calling this on change in textarea...
  this.setState({
    content: change.value
  });
}

export function handlePubTitleChange(e) {
  this.setState({
    title: e.target.value
  });
}
