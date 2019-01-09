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
import { Value } from 'slate'
const { decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const lzjs = require('lzjs');
const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
}

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]

      if (block) {
        return {
          object: 'block',
          type: block,
          nodes: next(el.childNodes),
        }
      }
    },
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()]

      if (mark) {
        return {
          object: 'mark',
          type: mark,
          nodes: next(el.childNodes),
        }
      }
    },
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'pre') {
        const code = el.childNodes[0]
        const childNodes =
          code && code.tagName.toLowerCase() === 'code'
            ? code.childNodes
            : el.childNodes

        return {
          object: 'block',
          type: 'code',
          nodes: next(childNodes),
        }
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'img') {
        return {
          object: 'block',
          type: 'image',
          nodes: next(el.childNodes),
          data: {
            src: el.getAttribute('src'),
          },
        }
      }
    },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'a') {
        return {
          object: 'inline',
          type: 'link',
          nodes: next(el.childNodes),
          data: {
            href: el.getAttribute('href'),
          },
        }
      }
    },
  },
]

const html = new Html({ rules: RULES })

export function findDoc() {
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
    let value;
    if(JSON.parse(fileContents).value) {
      value = JSON.parse(fileContents).value;
    } else {
      value = JSON.parse(fileContents);
    }
    const thisDoc = value.find((doc) => {
      if(typeof doc.id === "string") {
        if(doc.id) {
          return doc.id === window.location.href.split('shared/')[1].split('/')[1]
        }
      } else {
        if(doc.id) {
          return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1]
        }
      }
      return null
    });
    if(thisDoc) {
      console.log('found in collection');
      this.setState({ createRTC: false })
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //this is comparing a number to a number
      }
      this.setState({index: value.findIndex(findObjectIndex)}, () => {
        this.loadSingleRTC();
      })
    } else {
      console.log('not found in collection, need to create')
      this.setState({ createRTC: true }, () => {
        this.loadSharedRTC();
      })

    }
  })
  .catch(error => {
    console.log(error);
  });
}

export function loadSharedRTC() {
  let userToLoadFrom = window.location.href.split('shared/')[1].split('/')[0];
  let fileString = 'shareddocs.json';
  let file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + fileString;
  const privateKey = loadUserData().appPrivateKey;
  const directory = 'shared/' + file;
  const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
        this.setState({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
          let docs = this.state.sharedFile;
          const thisDoc = docs.find((doc) => {
            if(doc.id){
              return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1]
            }
            return null
          });
          if(thisDoc && thisDoc.rtc) {
            console.log("real-time")
            if(thisDoc && thisDoc.jsonContent) {
              let content = thisDoc && thisDoc.content;
              this.setState({
                content: Value.fromJSON(content),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
               })
          } else {
            if(thisDoc && thisDoc.compressed) {
              this.setState({
                content: thisDoc && html.deserialize(lzjs.decompress(thisDoc.content)),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
              })
            } else {
              this.setState({
                content: thisDoc && html.deserialize(thisDoc.content),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
              })
            }
          }
        } else {
          console.log("static")
          this.setState({
            content: thisDoc && thisDoc.content,
            fullContent: thisDoc && thisDoc.fullContent,
            title: thisDoc && thisDoc.title,
            newSharedDoc: true,
            rtc: thisDoc && thisDoc.rtc,
            docLoaded: true,
            idToLoad: window.location.href.split('shared/')[1].split('/')[1],
            tempDocId: window.location.href.split('shared/')[1].split('/')[1],
            teamDoc: thisDoc && thisDoc.teamDoc,
            sharedWith: thisDoc && thisDoc.sharedWith
          })
        }
       })
     })
     .then(() => {
       console.log(this.state.index)
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
        if(JSON.parse(fileContents).jsonContent) {
          let content = JSON.parse(fileContents).content;
          this.setState({ content: Value.fromJSON(content) });
        } else {
          this.setState({ content: html.deserialize(JSON.parse(fileContents).content) });
        }
      }
      this.setState({
        title: JSON.parse(fileContents || '{}').title,
        tags: JSON.parse(fileContents || '{}').tags,
        compressed: JSON.parse(fileContents).compressed,
        idToLoad: JSON.parse(fileContents || '{}').id,
        singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
        docLoaded: true,
        readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
        rtc: JSON.parse(fileContents || '{}').rtc || false,
        teamDoc: JSON.parse(fileContents || '{}').teamDoc,
        sharedWith: JSON.parse(fileContents).sharedWith,
        newSharedDoc: false,
        lastUpdate: JSON.parse(fileContents).lastUpdate
      })
    })
    .then(() => {
      console.log(this.state.index)
    })
    .catch(error => {
      console.log(error);
    });
}

export function handleAddRTC() {
  const object = {};
  object.title = this.state.title;
  object.id = this.state.tempDocId;
  object.updated = getMonthDayYear();
  object.tags = [];
  object.sharedWith = [];
  object.rtc = this.state.rtc;
  object.teamDoc = this.state.teamDoc;
  object.compressed = true;
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.created;
  objectTwo.content = lzjs.compress(html.serialize(this.state.content));
  objectTwo.tags = [];
  objectTwo.compressed = true;
  objectTwo.sharedWith = [];
  objectTwo.rtc = this.state.rtc;
  objectTwo.teamDoc = this.state.teamDoc;

  this.setState({
    value: [...this.state.value, object],
    createRTC: false,
     singleDoc: objectTwo
  }, () => {
    this.saveNewSharedFile();
  });
}

export function handleAddStatic() {
  this.setState({ loading: true });
  const object = {};
  const objectTwo = {}
  object.title = this.state.title;
  object.lastUpdate = Date.now();
  object.id = Date.now();
  object.updated = getMonthDayYear();
  object.singleDocTags = [];
  object.sharedWith = [];
  object.fileType = 'documents';
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = Date.now();
  objectTwo.content = this.state.fullContent;
  objectTwo.compressed = false;
  objectTwo.jsonContent = true;
  objectTwo.singleDocTags = [];
  objectTwo.sharedWith = [];

  this.setState({
    value: [...this.state.value, object],
    filteredValue: [...this.state.value, object],
    singleDoc: objectTwo,
    tempDocId: object.id
  }, () => {
    this.saveNewSharedFile();
  });
}

export function saveNewSharedFile() {
  this.setState({loading: true})
  putFile("documentscollection.json", JSON.stringify(this.state.value), {encrypt:true})
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
     if(JSON.parse(fileContents)) {
       if(JSON.parse(fileContents).value) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
       } else {
         this.setState({ value: JSON.parse(fileContents || '{}') });
       }
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
