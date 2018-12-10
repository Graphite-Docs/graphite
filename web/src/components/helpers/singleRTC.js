import React from 'react';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
// import Plain from 'slate-plain-serializer';
import Html from 'slate-html-serializer';
const { decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
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

export function loadSharedRTC() {
  let userToLoadFrom = window.location.href.split('shared/')[1].split('/')[0];
  let fileString = 'shareddocs.json';
  let file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + fileString;
  const privateKey = loadUserData().appPrivateKey;
  const directory = 'shared/' + file;
  const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))))
        this.setState({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
          let docs = this.state.sharedFile;
          const thisDoc = docs.find((doc) => { return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1]}); //comparing strings
          // let index = thisDoc && thisDoc.id;
          // console.log(thisDoc);
          // function findObjectIndex(doc) {
          //     return doc.id === index; //comparing numbers
          // }
          // console.log(docs.findIndex(findObjectIndex))
          this.setState({ content: thisDoc && html.deserialize(lzjs.decompress(thisDoc.content)), title: thisDoc && thisDoc.title, newSharedDoc: true, rtc: thisDoc && thisDoc.rtc, docLoaded: true, idToLoad: window.location.href.split('shared/')[1].split('/')[1], tempDocId: window.location.href.split('shared/')[1].split('/')[1], teamDoc: thisDoc && thisDoc.teamDoc })
        })
     })
     .then(() => {
       if(this.state.rtc) {
         // this.handleAddRTC();
       }
     })
      .catch(error => {
        console.log(error);
      });
}

export function findDoc() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
    // this.setState({ value: JSON.parse(fileContents || '{}').value })
    let value = this.state.value;
    const thisDoc = value.find((doc) => {
      // if(!isNaN(parseFloat(doc.id)) && isFinite(doc.id)) {
      //   return doc.id === window.location.href.split('shared/')[1].split('/')[1] //this is comparing a string to a string
      // } else {
      //   return doc.id === window.location.href.split('shared/')[1].split('/')[1] //this is comparing a string to a string
      // }
      return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1]
    });
    if(thisDoc) {
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //this is comparing a number to a number
      }
      this.setState({index: value.findIndex(findObjectIndex)}, () => {
        this.loadSingleRTC();
      })
    } else {
      this.loadSharedRTC();
    }
  })
  .catch(error => {
    console.log(error);
  });
}

export function loadSingleRTC() {
  const thisFile = window.location.href.split('shared/')[1].split('/')[1];
  const fullFile = '/documents/' + thisFile + '.json';
  getFile(fullFile, {decrypt: true})
  .then((fileContents) => {
    console.log(JSON.parse(fileContents))
    if(JSON.parse(fileContents).compressed) {
      this.setState({ content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)) })
    } else {
      this.setState({ content: html.deserialize(JSON.parse(fileContents).content) });
    }
    this.setState({
      //NOTE: don't need author, not setting that state attribute...
      title: JSON.parse(fileContents || '{}').title,
      // content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      compressed: JSON.parse(fileContents).compressed,
      idToLoad: JSON.parse(fileContents || '{}').id,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
      docLoaded: true,
      readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
      rtc: JSON.parse(fileContents || '{}').rtc || false,
      teamDoc: JSON.parse(fileContents || '{}').teamDoc
    })
  })
  .catch(error => {
    console.log(error);
  });
}

export function handleAddRTC() {
  // const object = {};
  // object.title = this.state.title;
  // object.id = this.state.tempDocId;
  // object.updated = getMonthDayYear();
  // object.tags = [];
  // object.sharedWith = [];
  // object.rtc = this.state.rtc;
  // object.teamDoc = this.state.teamDoc;
  // const objectTwo = {}
  // objectTwo.title = object.title;
  // objectTwo.id = object.id;
  // objectTwo.updated = object.created;
  // objectTwo.content = this.state.content;
  // objectTwo.tags = [];
  // objectTwo.sharedWith = [];
  // objectTwo.rtc = this.state.rtc;
  // objectTwo.teamDoc = this.state.teamDoc;
  //
  // this.setState({ value: [...this.state.value, object] });
  // this.setState({ singleDoc: objectTwo });
  // this.setState({ action: "Team document received and added to collection"});
  // setTimeout(this.saveNewSharedFile, 500);
}

export function handleAddStatic() {
  const object = {};
  const objectTwo = {}
  object.title = this.state.title;
  object.lastUpdate = Date.now();
  object.id = window.location.href.split('shared/')[1].split('/')[1];
  object.updated = getMonthDayYear();
  object.singleDocTags = [];
  object.sharedWith = [];
  object.fileType = 'documents';
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.created;
  objectTwo.content = this.state.content;
  objectTwo.singleDocTags = [];
  objectTwo.sharedWith = [];

  this.setState({ value: [...this.state.value, object], filteredValue: [...this.state.value, object] });
  this.setState({ singleDoc: objectTwo });
  this.setState({ tempDocId: object.id });
  setTimeout(this.saveNewSharedFile, 500);

  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide", loading: "" })
}

export function saveNewSharedFile() {
  putFile("documentscollection.json", JSON.stringify(this.state), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveNewSingleSharedDoc();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveNewSingleSharedDoc() {
  const file = this.state.tempDocId;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      if(this.state.rtc !== true) {
        window.location.replace("/documents");
      }
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

export function loadAllDocs() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ value: JSON.parse(fileContents || '{}').value });
     } else {
       console.log("No docs");
     }
   })
    .catch(error => {
      console.log(error);
    });
}

export function send(content) {
  // this.uniqueID = Math.round(Math.random() * 1000000000000);
  //
  // this.socket = socketIOClient(process.env.REACT_APP_SERVER);
  //
  // this.socket.on('update content', data => {
  //   const content = JSON.parse(data)
  //   const { uniqueID, content: ops } = content;
  //   if (ops !== null && this.uniqueID !== uniqueID) {
  //     setTimeout(() => {
  //       this.applyOperations(ops);
  //     });
  //   }
  // });
  // const data = JSON.stringify({ content, uniqueID: Math.round(Math.random() * 1000000000000) });
  // this.socket.emit('update content', data);
}

export function onRTCChange(change) {
  // console.log("rtc change boy!")
  // const ops = change.operations
  //   .filter(o => o.type !== 'set_selection' && o.type !== 'set_value')
  //   .toJS();
  //
  // if (ops.length > 0) {
  //   this.send(ops);
  // }
}
