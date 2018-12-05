import React from 'react'
import {putFile, encryptContent, decryptContent} from 'blockstack';
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

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  },
  // config: {
  //   Addresses: {
  //     // ...And supply a swarm address to announce on to find other peers
  //     Swarm: [
  //       '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
  //     ]
  //   }
  // }
}

export function storeLocal() {
  const id = window.location.href.split('doc/')[1];
  const ipfs = new IPFS(ipfsOptions)
  ipfs.on('error', (e) => console.error(e))
  ipfs.on('ready', async () => {
    const orbitdb = new OrbitDB(ipfs)
    //TODO wire up the access array below to the orbitDB instance.
    // const access = {
    //   // Give write access to ourselves
    //   write: [orbitdb.key.getPublic('hex')],
    // }
    const db = await orbitdb.keyvalue('graphite-docs-local')
    const content = encryptContent(JSON.stringify(this.state.singleDoc));
    db.put(id, content).then(() => {
      this.setState({ autoSave: "Saved"})
    })
    // this.saveOrbit(db.address.toString())
  })

}

export function loadLocal() {
  const id = window.location.href.split('doc/')[1];
  const ipfs = new IPFS(ipfsOptions)
  ipfs.on('ready', async () => {
    const orbitdb = new OrbitDB(ipfs)
    const db = await orbitdb.keyvalue('graphite-docs-local')
    await db.load();
    const value = db.get(id);
    console.log(JSON.parse(decryptContent(value)))
    if(JSON.parse(decryptContent(value)).lastUpdate > this.state.lastUpdate) {
      if(this.state.compressed) {
        this.setState({ content: html.deserialize(lzjs.decompress(JSON.parse(decryptContent(value)).content)) })
      } else {
        this.setState({ content: html.deserialize(JSON.parse(decryptContent(value)).content) })
      }
    }
  })
}

export function saveOrbit(db) {
  putFile('orbitDB.json', JSON.stringify(db), {encrypt: true})
    .then(() => {
      console.log('orbitDB saved')
    })
    .catch(error => {
      console.log(error);
    })
}
