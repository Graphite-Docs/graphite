import React from 'react'
import {
  getFile,
  putFile,
  loadUserData,
  lookupProfile
} from 'blockstack'
import axios from 'axios';
import {
  getMonthDayYear
} from './getMonthDayYear';
import update from 'immutability-helper';
// import TurndownService from 'turndown';
import { isKeyHotkey } from 'is-hotkey';
import { Value } from 'slate'
import Html from 'slate-html-serializer';
const wordcount = require("wordcount");
const FileSaver = require('file-saver');
const htmlDocx = require('html-docx-js/dist/html-docx');
const lzjs = require('lzjs');
const { encryptECIES } = require('blockstack/lib/encryption');
// const showdown  = require('showdown');
const html2pdf = require('html2pdf.js')
// const turndownService = new TurndownService()
const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

let htmlContent;
// const canvas = require('html2canvas')

const BLOCK_TAGS = {
  blockquote: 'block-quote',
  p: 'paragraph',
  pre: 'code',
  ul: 'list',
  ol: 'ordered',
  li: 'list-item',
  div: 'align',
  img: 'image'
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
        return {
          object: 'block',
          type: type,
          data: {
            class: el.getAttribute('class'),
            // src: el.getArrtribute('src')
          },
          nodes: next(el.childNodes),
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
            const headers = !obj.data.get('headless');
            const rows = children;
            const split = (!headers || !rows || !rows.size || rows.size===1)
                ?  { header: null, rows: rows }
                : {
                    header: rows.get(0),
                    rows: rows.slice(1),
                 }

            return (
                <table>
                    {headers &&
                        <thead>{split.header}</thead>
                    }
                    <tbody>{split.rows}</tbody>
                </table>
            );
          case 'table_row': return <tr>{children}</tr>;
          case 'table_cell': return <td>{children}</td>;
          case 'align':
            return <div className={obj.data.get('class')}>{children}</div>
          case 'code-block':
            return <code>{children}</code>
          case 'image':
            return <img src={ obj.data.get('src') } alt='thumbnail'/>
          case 'video':
            return <iframe src={ obj.data.get('src') } title="video" />
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
              href: el.getAttribute('href')
              // style: JSON.parse('{' + JSON.stringify(el.getAttribute('style')).split(':')[0] + '"' + JSON.parse(JSON.stringify(':')) + '"' + JSON.stringify(el.getAttribute('style')).split(':')[1] + '}'),
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

export function initialDocLoad() {
  this.setState({ loading: true})
  const thisFile = window.location.href.split('doc/')[1];
  const fullFile = '/documents/' + thisFile + '.json';

  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       if(JSON.parse(fileContents)) {
         if(JSON.parse(fileContents).value) {
           this.setState({ value: JSON.parse(fileContents).value, filteredValue: JSON.parse(fileContents).value }, () => {
             let value = this.state.value;
             const thisDoc = value.find((doc) => {
               if(typeof doc.id === "string") {
                 if(doc.id) {
                   return doc.id === window.location.href.split('doc/')[1] //this is comparing a string to a string
                 }
               } else {
                 if(doc.id) {
                   return doc.id.toString() === window.location.href.split('doc/')[1] //this is comparing a string to a string
                 }
               }
               return null;

             });
             let index = thisDoc && thisDoc.id;
             function findObjectIndex(doc) {
               return doc.id === index; //this is comparing a number to a number
             }
             this.setState({index: value.findIndex(findObjectIndex)})
           });
         } else {
           this.setState({ value: JSON.parse(fileContents), filteredValue: JSON.parse(fileContents) }, () => {
             let value = this.state.value;
             const thisDoc = value.find((doc) => {
               if(typeof doc.id === "string") {
                 if(doc.id) {
                   return doc.id === window.location.href.split('doc/')[1] //this is comparing a string to a string
                 }
               } else {
                 if(doc.id) {
                   return doc.id.toString() === window.location.href.split('doc/')[1] //this is comparing a string to a string
                 }
               }
               return null;

             });
             let index = thisDoc && thisDoc.id;
             function findObjectIndex(doc) {
               return doc.id === index; //this is comparing a number to a number
             }
             this.setState({index: value.findIndex(findObjectIndex)})
           });
         }
       }
    } else {
      this.setState({ value: [], filteredValue: [] });
    }
   })
   .then(() => {
     getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(JSON.parse(fileContents))
       let thisContent;

       if(JSON.parse(fileContents).compressed === true) {
         console.log("compressed doc")
         this.setState({
           content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)),
           title: JSON.parse(fileContents || '{}').title,
           tags: JSON.parse(fileContents || '{}').tags,
           idToLoad: JSON.parse(fileContents || '{}').id,
           singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
           docLoaded: true,
           readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
           rtc: JSON.parse(fileContents || '{}').rtc || false,
           sharedWith: JSON.parse(fileContents || '{}').sharedWith,
           teamDoc: JSON.parse(fileContents || '{}').teamDoc,
           compressed: JSON.parse(fileContents || '{}').compressed || false,
           spacing: JSON.parse(fileContents || '{}').spacing,
           lastUpdate: JSON.parse(fileContents).lastUpdate,
           jsonContent: true
         })
       } else {
         console.log("Not compressed")
         if(JSON.parse(fileContents).jsonContent) {
           console.log("Json doc")
           thisContent = JSON.parse(fileContents).content;
           this.setState({
             content: Value.fromJSON(thisContent),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
             rtc: JSON.parse(fileContents || '{}').rtc || false,
             sharedWith: JSON.parse(fileContents || '{}').sharedWith,
             teamDoc: JSON.parse(fileContents || '{}').teamDoc,
             compressed: JSON.parse(fileContents || '{}').compressed || false,
             spacing: JSON.parse(fileContents || '{}').spacing,
             lastUpdate: JSON.parse(fileContents).lastUpdate,
             jsonContent: true
           })
         } else {
           console.log("html doc")
           this.setState({
             content: html.deserialize(JSON.parse(fileContents).content),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
             rtc: JSON.parse(fileContents || '{}').rtc || false,
             sharedWith: JSON.parse(fileContents || '{}').sharedWith,
             teamDoc: JSON.parse(fileContents || '{}').teamDoc,
             compressed: JSON.parse(fileContents || '{}').compressed || false,
             spacing: JSON.parse(fileContents || '{}').spacing,
             lastUpdate: JSON.parse(fileContents).lastUpdate,
           })
         }

       }
     })
     .then(() => {
       this.loadContacts()
     })
     .then(() => {

     })
     .then(() => {
       console.log(this.state.index)
       getFile(window.location.href.split('doc/')[1] + 'sharedwith.json', {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
         } else {
           this.setState({ sharedWith: [] })
         }
       })
       .catch(error => {
         console.log("shared with doc error: ")
         console.log(error);
       });
     })
     .then(() => {
       this.setState({ loading: false}, () => {
         // document.getElementsByClassName('ql-editor')[0].style.lineHeight = this.state.spacing;
         this.loadAvatars();
       })
     })
     .catch(error => {
       console.log(error);
     });
   })
   .catch(error => {
     console.log(error)
   })


  this.printPreview = () => {
    if(this.state.printPreview === true) {
      this.setState({printPreview: false});
    } else {
      this.setState({printPreview: true});
    }
  }
}

export function noCollaboration() {
  const thisFile = window.location.href.split('doc/')[1];
  const fullFile = '/documents/' + thisFile + '.json';
  if(this.state.content === "<p><br></p>") {
    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      this.setState({
        title: JSON.parse(fileContents || '{}').title,
        content: JSON.parse(fileContents || '{}').content,
        tags: JSON.parse(fileContents || '{}').tags,
        idToLoad: JSON.parse(fileContents || '{}').id,
        singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
        docLoaded: true,
        readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setState of readOnly from getFile...
        rtc: JSON.parse(fileContents || '{}').rtc || false,
        sharedWith: JSON.parse(fileContents || '{}').sharedWith
      })
    })
    .catch(error => {
      console.log(error)
    })
  }
}

export function loadAvatars() {
  if(this.state.sharedWith) {
    if (this.state.sharedWith.length > 0) {
      this.state.sharedWith.forEach((name) => {
        console.log(this.state.avatars);
        lookupProfile(name, "https://core.blockstack.org/v1/names")
          .then((profile) => {
            this.setState({ avatars: [...this.state.avatars, profile]});
          })
          .catch((error) => {
            console.log('could not resolve profile')
          })
      })
    } else {
      setTimeout(this.loadAvatars, 300);
    }
  }


}

export function stealthyChat() {
  this.setState({hideStealthy: !this.state.hideStealthy})
}


export function toggleReadOnly() { //make this function toggleReadyOnly state instead, so user can press button again!!!!
  this.setState(
    prevState => ({ readOnly: !prevState.readOnly }) //setState of readOnly to the opposite of its previous state...
  )
  setTimeout(this.sharePublicly, 700); //call sharePublicly on a slight delay, so state has updated since calling setState above...
}

export function handleAutoSave(e) {
  this.setState({ content: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}

export function sharePublicly() {
  if(this.state.readOnly === undefined) {
    this.setState({ readOnly: true }, () => {
      const object = {};
      object.title = this.state.title;
      // object.content = html.serialize(this.state.content);
      object.content = document.getElementsByClassName('editor')[0].innerHTML;
      object.readOnly = true;
      object.words = wordcount(html.serialize(this.state.content));
      object.shared = getMonthDayYear();
      object.singleDocIsPublic = true;
      this.setState({
        singlePublic: object,
        singleDocIsPublic: true
      }, () => {
        this.savePublic();
      })
    })
  } else {
    const object = {};
    object.title = this.state.title;
    if(this.state.readOnly) {
      object.content = document.getElementsByClassName('editor')[0].innerHTML;
    } else {
      let content = this.state.content;
      object.content = content.toJSON();
    }
    object.readOnly = this.state.readOnly;
    object.words = wordcount(html.serialize(this.state.content));
    object.shared = getMonthDayYear();
    object.singleDocIsPublic = true;
    this.setState({
      singlePublic: object,
      singleDocIsPublic: true
    }, () => {
      this.savePublic();
    })
  }
}

export function stopSharing() {
  this.setState({
    singlePublic: {},
    singleDocIsPublic: false
  })
  setTimeout(this.saveStop, 700);
}

export function saveStop() {
  const params = window.location.href.split('doc/')[1];
  const directory = 'public/';
  const file = directory + params + '.json'
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
  .then(() => {
    this.handleAutoAdd();
  })
  .catch(e => {
    console.log(e);
  });
}

export function savePublic() {
  console.log("it's here")
  const user = loadUserData().username;
  const id = window.location.href.split('doc/')[1];
  const link = window.location.origin + '/shared/docs/' + user + '-' + id;
  const directory = 'public/';
  const file = directory + id + '.json';
  putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
  .then(() => {
    this.setState({gaiaLink: link, publicShare: "", shareModal: "hide"});
    // this.handleAutoAdd() //call this every time savePublic is called, so this.state.singleDocIsPublic persists to database...
  })
  .catch(e => {
    console.log(e);
  });
}

export function copyLink() {
    var copyText = document.getElementById("gaia");
    copyText.select();
    document.execCommand("Copy");
    window.Materialize.toast("Link copied to clipboard", 1000);
  }

export function sharedInfoSingleDocRTC(props){
    this.setState({ receiverID: props, rtc: true, loading: true });
    const user = props;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
        console.log("Step One: PubKey Loaded");
      })
      .then(() => {
        getFile('graphiteprofile.json', options)
          .then((fileContents) => {
            if(JSON.parse(fileContents).emailOK) {
              const object = {};
              object.sharedBy = loadUserData().username;
              object.title = this.state.title;
              object.from_email = "contact@graphitedocs.com";
              object.to_email = JSON.parse(fileContents).profileEmail;
              if(window.location.href.includes('/documents')) {
                object.subject = 'New Graphite document shared by ' + loadUserData().username;
                object.link = window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + window.location.href.split('doc/')[1];
                object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" + loadUserData().username + " has shared a document with you.</h3><p>Access it here:</p><br><a href=" + object.link + ">" + object.link + "</a></div>"
                axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared', object)
                  .then((res) => {
                    console.log(res);
                  })
                console.log(object);
              }
            } else {
              console.log("you can't email this person")
            }
          })
      })
        .then(() => {
          this.loadMyFile();
        })
        .catch(error => {
          console.log("No key: " + error);
          this.setState({ loading: false, displayMessage: true, results: [] }, () => {
            setTimeout(() => this.setState({displayMessage: false}), 3000);
          });
        });
}

export function sharedInfoSingleDocStatic(props){
  htmlContent = document.getElementsByClassName('editor')[0].innerHTML;
  this.setState({ receiverID: props, rtc: false, loading: true });
  const user = props;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile('key.json', options)
    .then((file) => {
      this.setState({ pubKey: JSON.parse(file)})
      console.log("Step One: PubKey Loaded");
    })
      .then(() => {
        getFile('graphiteprofile.json', options)
          .then((fileContents) => {
            if(JSON.parse(fileContents).emailOK) {
              const object = {};
              object.sharedBy = loadUserData().username;
              object.title = this.state.title;
              object.from_email = "contact@graphitedocs.com";
              object.to_email = JSON.parse(fileContents).profileEmail;
              if(window.location.href.includes('/documents')) {
                object.subject = 'New Graphite document shared by ' + loadUserData().username;
                object.link = window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + window.location.href.split('doc/')[1];
                object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" + loadUserData().username + " has shared a document with you.</h3><p>Access it here:</p><br><a href=" + object.link + ">" + object.link + "</a></div>"
                axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared', object)
                  .then((res) => {
                    console.log(res);
                  })
                console.log(object);
              }
            } else {
              console.log("you can't email this person")
            }
          })
      })
      .then(() => {
        this.loadMyFile();
      })
      .catch(error => {
        console.log("No key: " + error);
        this.setState({ loading: false, displayMessage: true, results: [] }, () => {
          setTimeout(() => this.setState({displayMessage: false}), 3000);
        });
      });
}

export function loadMyFile() {
  const pubKey = this.state.pubKey;
  const fileName = 'shareddocs.json'
  const file = 'mine/' + pubKey + '/' + fileName;
  getFile(file, {decrypt: true})
  .then((fileContents) => {
    this.setState({ shareFile: JSON.parse(fileContents || '{}') })
    this.setState({ show: "hide" });
  })
  .then(() => {
    const object = {};
    let content = this.state.content;
    object.title = this.state.title;
    object.compressed = false;
    if(this.state.rtc) {
      object.jsonContent = true;
      object.content = content.toJSON();
    } else {
      object.jsonContent = false;
      object.content = htmlContent;
      object.fullContent = content.toJSON();
    }
    this.state.teamShare ? object.teamDoc = true : object.teamDoc = false;
    object.id = window.location.href.split('doc/')[1];
    object.receiverID = this.state.receiverID;
    object.words = wordcount(html.serialize(this.state.content));
    object.sharedWith = [...this.state.sharedWith, this.state.receiverID];
    object.shared = getMonthDayYear();
    object.rtc = this.state.rtc;
    object.user = loadUserData().username;
    this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, this.state.receiverID] });
    setTimeout(this.shareDoc, 700);
  })
  .catch(error => {
    console.log(error);
    this.setState({ loading: "", show: "hide" });

    const object = {};
    let content = this.state.content;
    object.title = this.state.title;
    if(this.state.rtc) {
      object.jsonContent = true;
    } else {
      object.jsonContent = false;
    }
    object.content = content.toJSON();
    if(this.state.teamShare === true) {
      object.teamDoc = true;
    }
    object.id = Date.now();
    object.receiverID = this.state.receiverID;
    object.words = wordcount(html.serialize(this.state.content));
    object.shared = getMonthDayYear();
    object.rtc = this.state.rtc;
    this.setState({ shareFile: [...this.state.shareFile, object] });
    setTimeout(this.shareDoc, 700);
  });
}

export function shareDoc() {
  const fileName = 'shareddocs.json'
  const pubKey = this.state.pubKey;
  const file = 'mine/' + pubKey + '/' + fileName;
  putFile(file, JSON.stringify(this.state.shareFile), {encrypt: true})
  .catch(e => {
    console.log("e");
    console.log(e);
  });

  const data = this.state.shareFile;
  const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
  const directory = 'shared/' + pubKey + fileName;
  putFile(directory, encryptedData, {encrypt: false})
  .then(() => {
    this.setState({ loading: false, displayMessageSuccess: true, results: [] }, () => {
      console.log("Success")
    });
  })
  .catch(e => {
    console.log(e);
  });
  putFile(window.location.href.split('doc/')[1] + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
  .then(() => {
    if(this.state.teamShare === true) {
      this.setState({ count: this.state.count + 1 });
      setTimeout(this.shareToTeam, 300);
    } else {
      this.handleAutoAdd();
      this.loadAvatars();
    }
  })
  .catch(e => {
    console.log(e);
  });
}

export function shareModal() {
  this.setState({
    shareModal: ""
  });
}

export function hideModal() {
  this.setState({
    shareModal: "hide",
    blogModal: "hide"
  });
}

export function handleTitleChange(e) {
  this.setState({ title: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 1500)
}

export function handleChange(change, options = {}) {
  this.setState({ content: change.value, wordCount: wordcount(html.serialize(change.value).replace(/<(?:.|\n)*?>/gm, '')) });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.handleAutoAdd, 3000)
}

export function handleMDChange(event) {
}

export function handleIDChange(e) {
  this.setState({ receiverID: e.target.value })
}

export function handleBack() {
  if(this.state.autoSave === "Saving") {
    setTimeout(this.handleBack, 500);
  } else {
    window.location.replace("/documents");
  }
}

export function handleAutoAdd() {
  // this.analyticsRun('documents');
  let content = this.state.content;
  const object = {};
  const objectTwo = {};
  object.title = this.state.title;
  object.content = content.toJSON();
  object.compressed = false;
  object.jsonContent = true;
  this.state.teamDoc ? object.teamDoc = true : object.teamDoc = false;
  if(window.location.href.includes('docs/')) {
    console.log("Public Doc")
    object.id = window.location.href.split('docs/')[1];
    objectTwo.id = window.location.href.split('docs/')[1];
  } else if(window.location.href.includes('shared/')) {
    console.log("Shared Doc")
    object.id = window.location.href.split('shared/')[1].split('/')[1];
    objectTwo.id = window.location.href.split('shared/')[1].split('/')[1];
  } else {
    console.log("My Doc")
    object.id = window.location.href.split('doc/')[1];
    objectTwo.id = window.location.href.split('doc/')[1];
  }
  object.updated = getMonthDayYear();
  object.sharedWith = this.state.sharedWith;
  object.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
  object.readOnly = this.state.readOnly; //true or false...
  object.rtc = this.state.rtc;
  // object.author = loadUserData().username;
  object.words = wordcount(html.serialize(this.state.content)) || "";
  object.singleDocTags = this.state.singleDocTags;
  object.fileType = "documents";
  object.spacing = this.state.spacing;
  object.lastUpdate = Date.now();
  objectTwo.title = this.state.title;
  this.state.teamDoc ? objectTwo.teamDoc = true : objectTwo.teamDoc = false;
  objectTwo.id = object.id;
  objectTwo.updated = getMonthDayYear();
  objectTwo.words = wordcount(html.serialize(this.state.content));
  objectTwo.lastUpdate = Date.now();
  objectTwo.sharedWith = this.state.sharedWith;
  objectTwo.rtc = this.state.rtc;
  objectTwo.singleDocIsPublic = this.state.singleDocIsPublic; //true or false...
  objectTwo.readOnly = this.state.readOnly; //true or false...
  // objectTwo.author = loadUserData().username;
  objectTwo.singleDocTags = this.state.singleDocTags;
  objectTwo.fileType = "documents";
  const index = this.state.index;
  console.log(this.state.index)
    if(this.state.newSharedDoc) {
      console.log("new shared doc")
      console.log(objectTwo)
      this.setState({ newSharedDoc: false, value: [...this.state.value, objectTwo], singleDoc: object, autoSave: "Saving..." }, () => {
        this.setState({ filteredValue: this.state.value }, () => {
          this.autoSave();
        })
        if (this.state.singleDocIsPublic === true) { //moved this conditional from handleAutoAdd, where it caused an infinite loop...
          this.sharePublicly() //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
        }
      });
    } else {
      console.log("not a new shared doc")
      if(index !== "" && index > -1) {
        console.log("index already set")
        const updatedDoc = update(this.state.value, {$splice: [[this.state.index, 1, objectTwo]]});
        this.setState({value: updatedDoc, filteredValue: updatedDoc, singleDoc: object, autoSave: "Saving..." }, () => {
          this.autoSave();
          if (this.state.singleDocIsPublic === true) { //moved this conditional from handleAutoAdd, where it caused an infinite loop...
            this.sharePublicly() //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
          }
        });
      } else {
        let value = this.state.value;
        console.log(value);
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
          return null;
        });
        let index = thisDoc && thisDoc.id;
        function findObjectIndex(doc) {
          return doc.id === index; //this is comparing a number to a number
        }
        this.setState({index: value.findIndex(findObjectIndex)}, () => {
          const updatedDoc = update(this.state.value, {$splice: [[this.state.index, 1, objectTwo]]});
          this.setState({value: updatedDoc, filteredValue: updatedDoc, singleDoc: object, autoSave: "Saving..." }, () => {
            this.autoSave();
            if (this.state.singleDocIsPublic === true) { //moved this conditional from handleAutoAdd, where it caused an infinite loop...
              this.sharePublicly() //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
            }
          });
        })
      }
    }
}

export function autoSave() {
  const file = window.location.href.split('doc/')[1] || this.state.tempDocId;
  const fullFile = '/documents/' + file + '.json';
  putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
  .then(() => {
    this.saveSingleDocCollection();
  })
  .catch(e => {
    console.log(e);
  });
}

export function saveSingleDocCollection() {
  putFile("documentscollection.json", JSON.stringify(this.state.value), {encrypt: true})
    .then(() => {
      this.setState({autoSave: "Saved"});
      // if(this.state.stealthyConnected) {
      //   setTimeout(this.connectStealthy, 300);
      // } else if(this.state.travelstackConnected) {
      //   setTimeout(this.connectTravelstack, 300);
      // } else if (this.state.coinsConnected) {
      //   setTimeout(this.connectCoins, 300);
      // }

      // this.saveDocsStealthy();
    })
    .then(() => {
      this.loadCollection()
    })
    .catch(e => {
      console.log(e);
    });
}

export function componentDidMountData(props) {


  const thisFile = props;
  const fullFile = '/documents/' + thisFile + '.json';
  this.setState({ documentId: props });

  getFile(props + 'sharedwith.json', {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
     } else {
       this.setState({ sharedWith: [] })
     }
   })
    .catch(error => {
      console.log("shared with doc error: ")
      console.log(error);
    });

  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
      if(JSON.parse(fileContents).value) {
        this.setState({ value: JSON.parse(fileContents || '{}').value })
      } else {
        this.setState({ value: JSON.parse(fileContents || '{}') })
      }

      let value = this.state.value;
      const thisDoc = value.find((doc) => { return doc.id.toString() === props}); //comparing strings
      let index = thisDoc && thisDoc.id;
      console.log(index);
      function findObjectIndex(doc) {
          return doc.id === index; //comparing numbers
      }
      this.setState({index: value.findIndex(findObjectIndex)})
   })
    .catch(error => {
      console.log(error);
    });

getFile(fullFile, {decrypt: true})
 .then((fileContents) => {
    this.setState({
      title: JSON.parse(fileContents || '{}').title,
      content: JSON.parse(fileContents || '{}').content,
      tags: JSON.parse(fileContents || '{}').tags,
      singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic,
      idToLoad: window.location.href.split('doc/')[1],
      docLoaded: true
   })
 })
 .then(() => {
   let markupStr = this.state.content;
   if(markupStr !=="") {
     window.$('.summernote').summernote('code', markupStr);
   }
 })
  .catch(error => {
    console.log(error);
  });
}

export function handleStealthy() {
  this.setState({hideStealthy: !this.state.hideStealthy})
}

export function print() {
  window.print();
}

export function shareToTeam() {

  this.setState({ teamDoc: true, teamShare: true, loadingIndicator: true, action: "Shared document id " + window.location.href.split('doc/')[1] + " with team."})
  const {team, count} = this.state;
  if(team.length > count) {
    this.setState({ auditThis: true });
    if(team[count].blockstackId !== loadUserData().username) {
      this.sharedInfoSingleDocRTC(team[count].blockstackId);
    } else {
      this.setState({ count: this.state.count + 1 });
      setTimeout(this.shareToTeam, 300);
    }
  } else {
    this.setState({ teamShare: false, loadingIndicator: false })
    window.$('#teamShare').modal('close');
    if(this.state.slackConnected){
      this.postToSlack();
    }
    if(this.state.webhookConnected) {
      const object = {};
      let content = this.state.content;
      object.title = this.state.title;
      object.content = content.toJSON();
      object.words = wordcount(html.serialize(this.state.content));;
      object.sharedWith = this.state.sharedWith;
      this.postToWebhook(object);
    }
    this.handleAutoAdd();
    this.loadAvatars();
  }
}

export function sendArticle() {
  this.setState({sentArticles: [...this.state.sentArticles, this.state.singleDoc]})
  setTimeout(this.saveSend, 300);
  this.setState({send: false})
}

export function downloadDoc(props) {
  if(props === "word") {
    var content = '<!DOCTYPE html>' + document.getElementsByClassName('editor')[0].innerHTML;;
    var converted = htmlDocx.asBlob(content);
    var blob = new Blob([converted], {type: "application/msword"});
    FileSaver.saveAs(blob, this.state.title + '.docx');
  } else if(props === "rtf") {
    console.log("rtf")
  } else if(props === 'pdf') {
    var opt = {
      margin:       1,
      filename:     'mypdf.pdf',
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['css'] }
    }


    html2pdf('<div class="pdf" style="margin:45px;margin-bottom:20px;"}>' + document.getElementsByClassName('editor')[0].innerHTML + '</div>')
    .set(opt)
  } else if(props === 'txt') {
    window.open("data:application/txt," + encodeURIComponent(document.getElementsByClassName('editor')[0].innerHTML.replace(/<[^>]+>/g, '')), "_self");
  }

}

export function formatSpacing(props) {
  var nodes = document.getElementsByClassName('ql-editor')[0].childNodes;
  var i=0;
  if(props === 'single') {

      for(i; i<nodes.length; i++) {
          if (nodes[i].nodeName.toLowerCase() === 'p') {
               nodes[i].style.lineHeight = 1;
           }
      }
    // document.getElementsByClassName('ql-editor')[0].querySelectorAll("p").style.lineHeight = 1;
    this.setState({spacing: 1}, () => {
      this.handleAutoAdd();
    })
  } else if(props === 'double') {
      for(i; i<nodes.length; i++) {
          if (nodes[i].nodeName.toLowerCase() === 'p') {
               nodes[i].style.lineHeight = 2;
           }
      }
    // document.getElementsByClassName('ql-editor')[0].style.lineHeight = 2;
    this.setState({spacing: 2}, () => {
      this.handleAutoAdd();
    })
  }

}

export function changeEditor() {
  this.setState({ markdown: !this.state.markdown})
}

export function applyOperations(operations) {
  const { content } = this.state
  const change = content.change().applyOperations(operations)
  this.handleChange(change, { remote: true })
}

export function hasMark(type) {
  const { content } = this.state
  return content.activeMarks.some(mark => mark.type === type)
}

export function onKeyDown(event, change) {
  let mark

  if (isBoldHotkey(event)) {
    mark = 'bold'
  } else if (isItalicHotkey(event)) {
    mark = 'italic'
  } else if (isUnderlinedHotkey(event)) {
    mark = 'underlined'
  } else if (isCodeHotkey(event)) {
    mark = 'code'
  } else {
    return
  }

  event.preventDefault()
  change.toggleMark(mark)
  return true
}

export function onClickMark(event, type) {
  event.preventDefault()
  const { content } = this.state
  const change = content.change().toggleMark(type)
  this.handleChange(change)
}

export function doPDF() {

}
