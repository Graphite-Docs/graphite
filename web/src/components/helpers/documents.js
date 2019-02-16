import {
  putFile,
  getFile,
  loadUserData,
  encryptContent, 
  decryptContent
} from 'blockstack';
import React, {setGlobal, getGlobal} from 'reactn'
import { Value } from 'slate'
import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
// import { checkStorageProvider } from '../onboarding/profiles/storage'
import { postToStorageProvider } from './storageProviders/post';
import { fetchFromProvider } from './storageProviders/fetch';
import Html from 'slate-html-serializer';
const { getPublicKeyFromPrivate } = require('blockstack');
const { decryptECIES } = require('blockstack/lib/encryption');
const lzjs = require('lzjs');

const { encryptECIES } = require('blockstack/lib/encryption');

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
              href: el.getAttribute('href'),
              src: el.getArrtribute('src')
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

export function loadCollection() {
  setGlobal({ results: [] })
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}')) {
       if(JSON.parse(fileContents).value) {
         setGlobal({ value: JSON.parse(fileContents || '{}').value, filteredValue: JSON.parse(fileContents || '{}').value, loading: false });
       } else {
         setGlobal({ value: JSON.parse(fileContents), filteredValue: JSON.parse(fileContents), loading: false });
       }

     } else {
       console.log("No saved files");
       setGlobal({ loading: false });
     }
   })
    .catch(error => {
      console.log(error);
    });
}

export function setTags(e) {
  setGlobal({ tag: e.target.value});
}

export function handleKeyPress(e) {
  let keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode === '13') {
      if(global.tag !=="") {
        setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
          setGlobal({ tag: "" });
        });
      }
    }
}

export function handleTagChange(e) {
  console.log("changing...")
  setGlobal({ tag: e.target.value});
}

export async function addTagManual(doc) {
  const global = await getGlobal();
  console.log(global.tag)
  if(global.tag !=="") {
    setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
      let value = global.value;
      const thisDoc = value.find((document) => { return document.id.toString() === doc.id.toString()});
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
          return doc.id === index; //this is comparing numbers
      }
      setGlobal({index: value.findIndex(findObjectIndex), tag: "" });
    });
  }

}

export function handleaddItem() {
  const global = getGlobal();
  setGlobal({loading: true})
  const rando = Date.now();
  const object = {};
  const objectTwo = {}
  if(window.location.href.includes('vault')) {
    setGlobal({ loading: true, })
    object.title = global.name;
    object.lastUpdate = Date.now();
    object.id = rando;
    object.updated = getMonthDayYear();
    object.singleDocTags = [];
    object.sharedWith = [];
    object.fileType = 'documents';
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.updated = object.created;
    objectTwo.content = global.content;
    objectTwo.tags = [];
    objectTwo.sharedWith = [];
  } else {
    object.title = "Untitled";
    object.lastUpdate = Date.now();
    object.id = rando;
    object.updated = getMonthDayYear();
    object.singleDocTags = [];
    object.sharedWith = [];
    object.fileType = 'documents';
    objectTwo.title = object.title;
    objectTwo.id = object.id;
    objectTwo.updated = object.created;
    objectTwo.content = global.content;
    objectTwo.tags = [];
    objectTwo.sharedWith = [];
  }

  setGlobal({ value: [...global.value, object], filteredValue: [...global.filteredValue, object], singleDoc: objectTwo, tempDocId: object.id  }, () => {
    saveNewFile();
  });
}

export function filterList(event){
  const global = getGlobal();
  var updatedList = global.value;
  updatedList = updatedList.filter(function(item){
    if(item.title !== undefined) {
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    }
    return null;
  });
  setGlobal({filteredValue: updatedList});
}

export async function saveNewFile() {
  const global = getGlobal();
  let authProvider = await JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(global.value);
    const encryptedData = await encryptContent(data, {publicKey: publicKey})
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(storageProvider === 'dropbox') {
      token = JSON.parse(localStorage.getItem('oauthData'))
    } else {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token
    }
    const params = {
      content: encryptedData,
      filePath: '/documents/index.json',
      provider: storageProvider,
      token: token
    }

    let postToStorage = await postToStorageProvider(params);
    await console.log(postToStorage);
    const singleData = await JSON.stringify(global.singleDoc);
    const singleEncrypted = await encryptContent(singleData, {publicKey: publicKey})
    const doc = await global.singleDoc;
    const singleParams = await {
      content: singleEncrypted,
      filePath: `/documents/single/${doc.id}.json`,
      provider: storageProvider,
      token: token
    }
    let postSingle = await postToStorageProvider(singleParams)
    await console.log(postSingle);
    if(window.location.href.includes('vault')) {
      window.location.replace('/documents');
    } else if(!window.location.href.includes('google') && !window.location.href.includes('documents/doc/') && !window.location.href.includes('file-explorer')) {
      setTimeout(() => {
        setGlobal({ redirect: true });
      }, 1500)
    } else if(window.location.href.includes('documents/doc/')) {
      window.location.replace(window.location.origin + '/documents/doc/' + global.tempDocId)
    } else if(window.location.href.includes('file-explorer')) {
      window.location.replace('/documents');
    }
  } else if(authProvider === 'blockstack') {
    putFile("documentscollection.json", JSON.stringify(global.value), {encrypt:true})
      .then(() => {
        // this.saveNewSingleDoc();
        console.log("Saved Collection!");
        setTimeout(saveNewSingleDoc, 200);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        setGlobal({ loading: false })
        alert("Trouble saving");
      });
  }
}

export function saveNewSingleDoc() {
  const global = getGlobal();
  const file = global.tempDocId;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(global.singleDoc), {encrypt:true})
    .then(() => {
      if(window.location.href.includes('vault')) {
        window.location.replace('/documents');
      } else if(!window.location.href.includes('google') && !window.location.href.includes('documents/doc/') && !window.location.href.includes('file-explorer')) {
        setGlobal({ redirect: true });
      } else if(window.location.href.includes('documents/doc/')) {
        window.location.replace(window.location.origin + '/documents/doc/' + global.tempDocId);
      } else if(window.location.href.includes('file-explorer')) {
        window.location.replace('/documents');
      }
      if(global.importAll) {
        setGlobal({ count: global.count + 1 });
      }
    })
    .then(() => {
      if(global.importAll) {
        this.importAllGDocs();
      }
    })
    .catch(e => {
      console.log("e");
      console.log(e);
      setGlobal({ loading: false })
      alert("Trouble saving")
    });
}

export function handlePageChange(props) {
  setGlobal({
    currentPage: props
  });
}

export function handleCheckbox(event) {
  const global = getGlobal();
  let checkedArray = global.docsSelected;
    let selectedValue = event.target.value;

      if (event.target.checked === true) {
        checkedArray.push(selectedValue);
          setGlobal({
            docsSelected: checkedArray
          });
        if(checkedArray.length === 1) {
          setGlobal({activeIndicator: true});

        } else {
          setGlobal({activeIndicator: false});
        }
      } else {
        setGlobal({activeIndicator: false});
        let valueIndex = checkedArray.indexOf(selectedValue);
          checkedArray.splice(valueIndex, 1);

          setGlobal({
            docsSelected: checkedArray
          });
          if(checkedArray.length === 1) {
            setGlobal({activeIndicator: true});
          } else {
            setGlobal({activeIndicator: false});
          }
      }
}

export function sharedInfo(props, doc) {
  const user = props;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  setGlobal({ receiverID: props, rtc: true, loading: true })
  getFile('key.json', options)
    .then((file) => {
      setGlobal({ pubKey: JSON.parse(file)})
    })
      .then(() => {
        this.loadSharedCollection(doc);
      })
      .catch(error => {
        console.log("No key: " + error);
        setGlobal({ loading: false, displayMessage: true, results: [] }, () => {
          setTimeout(() => setGlobal({displayMessage: false}), 3000);
        });
      });
}

export function sharedInfoStatic(props) {
  const user = props;
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  setGlobal({ receiverID: props, rtc: false })
  getFile('key.json', options)
    .then((file) => {
      setGlobal({ pubKey: JSON.parse(file)})
    })
      .then(() => {
        this.loadSharedCollection();
      })
      .catch(error => {
        console.log("No key: " + error);
        window.Materialize.toast(props + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
        setGlobal({ shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
      });
}

export function loadSharedCollection (doc) {
  const global = getGlobal();
  // const user = global.receiverID;
  // const file = "shared.json";
  // getFile(user + file, {decrypt: true})
  const pubKey = global.pubKey;
  const fileName = 'shareddocs.json'
  const file = 'mine/' + pubKey + '/' + fileName;
  getFile(file, {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        setGlobal({ sharedCollection: JSON.parse(fileContents || '{}') })
      } else {
        setGlobal({ sharedCollection: [] });
      }
    })
    .then(() => {
      this.loadSingle(doc);
    })
    .catch((error) => {
      console.log(error)
    });
}

export function loadSingle(doc) {
  const global = getGlobal();
    const thisFile = doc.id;
    const fullFile = '/documents/' + thisFile + '.json';
    let thisContent;
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents).compressed === true) {
         console.log("compressed doc")
         setGlobal({
           content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)),
           title: JSON.parse(fileContents || '{}').title,
           tags: JSON.parse(fileContents || '{}').tags,
           idToLoad: JSON.parse(fileContents || '{}').id,
           singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
           docLoaded: true,
           readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
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
           setGlobal({
             content: Value.fromJSON(thisContent),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
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
           setGlobal({
             content: html.deserialize(JSON.parse(fileContents).content),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
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
        setGlobal({ sharedWithSingle: [...global.sharedWithSingle, global.receiverID] }, () => {
          this.getCollection(doc)
        });
      })
      .catch(error => {
        console.log(error);
      });
}

export function getCollection(doc) {
  const global = getGlobal();
  getFile("documentscollection.json", {decrypt: true})
  .then((fileContents) => {
    if(JSON.parse(fileContents).value) {
      setGlobal({ value: JSON.parse(fileContents || '{}').value })
      setGlobal({ initialLoad: "hide" });
    } else {
      setGlobal({ value: JSON.parse(fileContents || '{}') })
      setGlobal({ initialLoad: "hide" });
    }
  }).then(() =>{
    let value = global.value;
    const thisDoc = value.find((document) => { return document.id.toString() === doc.id.toString()});
    let index = thisDoc && thisDoc.id;
    function findObjectIndex(doc) {
        return doc.id === index; //this is comparing numbers
    }
    setGlobal({index: value.findIndex(findObjectIndex) });
  })
    .then(() => {
      this.share(doc);
    })
    .catch(error => {
      console.log(error);
    });
}

export function share(doc) {
  const global = getGlobal();
  let thisContent = global.content;
  const object = {};
  object.title = global.title;
  object.jsonContent = true;
  object.content = thisContent.toJSON();
  object.id = doc.id;
  object.updated = getMonthDayYear();
  object.sharedWith = global.sharedWithSingle;
  object.lastUpdate = Date.now
  object.singleDocTags = global.singleDocTags;
  object.words = global.words;
  object.rtc = global.rtc;
  object.compressed = false;
  const index = global.index;
  const updatedDocs = update(global.value, {$splice: [[index, 1, object]]});  // array.splice(start, deleteCount, item1)
  setGlobal({value: updatedDocs, singleDoc: object, sharedCollection: [...global.sharedCollection, object]});

  setTimeout(() => this.saveSharedFile(doc), 300);
}

export function saveSharedFile(doc) {
  const global = getGlobal();
  // const user = global.receiverID;
  // const file = "shared.json";
  //
  // putFile(user + file, JSON.stringify(global.sharedCollection), {encrypt: true})
  const fileName = 'shareddocs.json'
  const pubKey = global.pubKey;
  const file = 'mine/' + pubKey + '/' + fileName;
  putFile(file, JSON.stringify(global.sharedCollection), {encrypt: true})
    .then(() => {
      console.log("Shared Collection Saved");

    })

    const data = global.sharedCollection;
    const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
    const directory = 'shared/' + pubKey + fileName;
    putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("saved")
    })
    .catch(e => {
      console.log(e);
    });
    putFile(doc.id + 'sharedwith.json', JSON.stringify(global.sharedWith), {encrypt: true})
    .then(() => {
      // this.handleAutoAdd();
      // this.loadAvatars();
      this.saveSingleFile(doc);
    })
    .catch(e => {
      console.log(e);
    });
}

export function saveSingleFile(doc) {
  const global = getGlobal();
  const file = doc.id;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(global.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      this.saveCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function saveCollection() {
  const global = getGlobal();
  putFile("documentscollection.json", JSON.stringify(global.value), {encrypt: true})
    .then(() => {
      console.log("Saved Collection");
      // this.sendFile();
      setGlobal({ title: "Untitled"})
    })
    .then(() => {
      this.loadCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function sendFile() {
  const global = getGlobal();
  const user = global.receiverID;
  const userShort = user.slice(0, -3);
  const fileName = 'shareddocs.json'
  const file = userShort + fileName;
  const publicKey = global.pubKey;
  const data = global.sharedCollection;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const directory = '/shared/' + file;
  putFile(directory, encryptedData, {encrypt: false})
    .then(() => {
      console.log("Shared encrypted file ");
      window.Materialize.toast('Document shared with ' + global.receiverID, 4000);
      this.loadCollection();
      setGlobal({shareModal: "hide", loadingTwo: "hide", contactDisplay: ""});
    })
    .catch(e => {
      console.log(e);
    });
}

export async function loadSingleTags(doc) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const global = getGlobal();
  const thisFile = doc.id;
  const fullFile = '/documents/' + thisFile + '.json';

  if(authProvider === 'uPort') {
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(storageProvider === 'dropbox') {
      token = JSON.parse(localStorage.getItem('oauthData'))
    } else {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token
    }
    const object = {
      provider: storageProvider,
      token: token,
      filePath: `/documents/single/${thisFile}.json`
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(object);
    console.log(fetchFile)
    //Now we need to determine if the response was from indexedDB or an API call:
    if (fetchFile.loadLocal) {
      const decryptedContent = await JSON.parse(
        decryptContent(JSON.parse(fetchFile.data.content), {
          privateKey: thisKey
        })
      );
      setGlobal(
        {
          content: Value.fromJSON(decryptedContent.content),
          title: decryptedContent.title,
          tags: decryptedContent.tags,
          idToLoad: decryptedContent.id,
          singleDocIsPublic: decryptedContent.singleDocIsPublic, //adding this...
          docLoaded: true,
          readOnly: decryptedContent.readOnly, //NOTE: adding this, to setState of readOnly from getFile...
          rtc: decryptedContent.rtc || false,
          sharedWith: decryptedContent.sharedWith,
          teamDoc: decryptedContent.teamDoc,
          compressed: decryptedContent.compressed || false,
          spacing: decryptedContent.spacing,
          lastUpdate: decryptedContent.lastUpdate,
          jsonContent: true,
          versions: decryptedContent.versions || [],
          loading: false
        })
      } else {
        //No indexedDB data found, so we load and read from the API call.
        //Load up a new file reader and convert response to JSON.
        const reader = await new FileReader();
        var blob = fetchFile.fileBlob;
        reader.onloadend = async evt => {
          console.log("read success");
          const decryptedContent = await JSON.parse(
            decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey })
          );
          setGlobal(
            {
              content: Value.fromJSON(decryptedContent.content),
              title: decryptedContent.title,
              tags: decryptedContent.tags,
              idToLoad: decryptedContent.id,
              singleDocIsPublic: decryptedContent.singleDocIsPublic, //adding this...
              docLoaded: true,
              readOnly: decryptedContent.readOnly, //NOTE: adding this, to setState of readOnly from getFile...
              rtc: decryptedContent.rtc || false,
              sharedWith: decryptedContent.sharedWith,
              teamDoc: decryptedContent.teamDoc,
              compressed: decryptedContent.compressed || false,
              spacing: decryptedContent.spacing,
              lastUpdate: decryptedContent.lastUpdate,
              jsonContent: true,
              versions: decryptedContent.versions || [],
              loading: false
            })
          }
          console.log(blob);
        }
  } else {
    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      let thisContent;
      if(JSON.parse(fileContents || '{}').singleDocTags || JSON.parse(fileContents).tags) {
        if(JSON.parse(fileContents).singleDocTags) {
          if(JSON.parse(fileContents).compressed === true) {
          console.log("compressed doc")
          setGlobal({
            content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)),
            title: JSON.parse(fileContents || '{}').title,
            tags: JSON.parse(fileContents || '{}').tags,
            idToLoad: JSON.parse(fileContents || '{}').id,
            singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
            docLoaded: true,
            readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
            rtc: JSON.parse(fileContents || '{}').rtc || false,
            sharedWith: JSON.parse(fileContents || '{}').sharedWith,
            teamDoc: JSON.parse(fileContents || '{}').teamDoc,
            compressed: JSON.parse(fileContents || '{}').compressed || false,
            spacing: JSON.parse(fileContents || '{}').spacing,
            lastUpdate: JSON.parse(fileContents).lastUpdate,
            jsonContent: true
          }, () => {
            if(global.tag !=="") {
              setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
                setGlobal({ tag: "" });
              });
            }
          })
        } else {
          console.log("Not compressed")
          if(JSON.parse(fileContents).jsonContent) {
            console.log("Json doc")
            thisContent = JSON.parse(fileContents).content;
            setGlobal({
              content: Value.fromJSON(thisContent),
              title: JSON.parse(fileContents || '{}').title,
              tags: JSON.parse(fileContents || '{}').tags,
              idToLoad: JSON.parse(fileContents || '{}').id,
              singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
              docLoaded: true,
              readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
              rtc: JSON.parse(fileContents || '{}').rtc || false,
              sharedWith: JSON.parse(fileContents || '{}').sharedWith,
              teamDoc: JSON.parse(fileContents || '{}').teamDoc,
              compressed: JSON.parse(fileContents || '{}').compressed || false,
              spacing: JSON.parse(fileContents || '{}').spacing,
              lastUpdate: JSON.parse(fileContents).lastUpdate,
              jsonContent: true
            }, () => {
              if(global.tag !=="") {
                setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
                  setGlobal({ tag: "" });
                });
              }
            })
          } else {
            console.log("html doc")
            setGlobal({
              content: html.deserialize(JSON.parse(fileContents).content),
              title: JSON.parse(fileContents || '{}').title,
              tags: JSON.parse(fileContents || '{}').tags,
              idToLoad: JSON.parse(fileContents || '{}').id,
              singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
              docLoaded: true,
              readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
              rtc: JSON.parse(fileContents || '{}').rtc || false,
              sharedWith: JSON.parse(fileContents || '{}').sharedWith,
              teamDoc: JSON.parse(fileContents || '{}').teamDoc,
              compressed: JSON.parse(fileContents || '{}').compressed || false,
              spacing: JSON.parse(fileContents || '{}').spacing,
              lastUpdate: JSON.parse(fileContents).lastUpdate,
            }, () => {
              if(global.tag !=="") {
                setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
                  setGlobal({ tag: "" });
                });
              }
            })
          }
        }
       } else if(JSON.parse(fileContents).tags) {
         if(JSON.parse(fileContents).compressed === true) {
         console.log("compressed doc")
         setGlobal({
           content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)),
           title: JSON.parse(fileContents || '{}').title,
           tags: JSON.parse(fileContents || '{}').tags,
           idToLoad: JSON.parse(fileContents || '{}').id,
           singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
           docLoaded: true,
           readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
           rtc: JSON.parse(fileContents || '{}').rtc || false,
           sharedWith: JSON.parse(fileContents || '{}').sharedWith,
           teamDoc: JSON.parse(fileContents || '{}').teamDoc,
           compressed: JSON.parse(fileContents || '{}').compressed || false,
           spacing: JSON.parse(fileContents || '{}').spacing,
           lastUpdate: JSON.parse(fileContents).lastUpdate,
           jsonContent: true
         }, () => {
           if(global.tag !=="") {
             setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
               setGlobal({ tag: "" });
             });
           }
         })
       } else {
         console.log("Not compressed")
         if(JSON.parse(fileContents).jsonContent) {
           console.log("Json doc")
           thisContent = JSON.parse(fileContents).content;
           setGlobal({
             content: Value.fromJSON(thisContent),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
             rtc: JSON.parse(fileContents || '{}').rtc || false,
             sharedWith: JSON.parse(fileContents || '{}').sharedWith,
             teamDoc: JSON.parse(fileContents || '{}').teamDoc,
             compressed: JSON.parse(fileContents || '{}').compressed || false,
             spacing: JSON.parse(fileContents || '{}').spacing,
             lastUpdate: JSON.parse(fileContents).lastUpdate,
             jsonContent: true
           }, () => {
             if(global.tag !=="") {
               setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
                 setGlobal({ tag: "" });
               });
             }
           })
         } else {
           console.log("html doc")
           setGlobal({
             content: html.deserialize(JSON.parse(fileContents).content),
             title: JSON.parse(fileContents || '{}').title,
             tags: JSON.parse(fileContents || '{}').tags,
             idToLoad: JSON.parse(fileContents || '{}').id,
             singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
             docLoaded: true,
             readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
             rtc: JSON.parse(fileContents || '{}').rtc || false,
             sharedWith: JSON.parse(fileContents || '{}').sharedWith,
             teamDoc: JSON.parse(fileContents || '{}').teamDoc,
             compressed: JSON.parse(fileContents || '{}').compressed || false,
             spacing: JSON.parse(fileContents || '{}').spacing,
             lastUpdate: JSON.parse(fileContents).lastUpdate,
           }, () => {
             if(global.tag !=="") {
               setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
                 setGlobal({ tag: "" });
               });
             }
           })
         }
       }
       }
 
     } else {
       setGlobal({
         content: html.deserialize(JSON.parse(fileContents).content),
         title: JSON.parse(fileContents || '{}').title,
         tags: JSON.parse(fileContents || '{}').tags,
         idToLoad: JSON.parse(fileContents || '{}').id,
         singleDocIsPublic: JSON.parse(fileContents || '{}').singleDocIsPublic, //adding this...
         docLoaded: true,
         readOnly: JSON.parse(fileContents || '{}').readOnly, //NOTE: adding this, to setGlobal of readOnly from getFile...
         rtc: JSON.parse(fileContents || '{}').rtc || false,
         sharedWith: JSON.parse(fileContents || '{}').sharedWith,
         teamDoc: JSON.parse(fileContents || '{}').teamDoc,
         compressed: JSON.parse(fileContents || '{}').compressed || false,
         spacing: JSON.parse(fileContents || '{}').spacing,
         lastUpdate: JSON.parse(fileContents).lastUpdate,
       }, () => {
         if(global.tag !=="") {
           setGlobal({ singleDocTags: [...global.singleDocTags, global.tag]}, () => {
             setGlobal({ tag: "" });
           });
         }
       })
     }
    })
    .then(() => {
      this.getCollectionTags(doc);
    })
     .catch(error => {
       console.log(error);
     });
  }
}

export async function getCollectionTags(doc) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const global = getGlobal();
  if(authProvider === 'uPort') {
    let value = global.value;
      const thisDoc = await value.find((document) => { return document.id.toString() === doc.id.toString()});
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
          return doc.id === index; //this is comparing numbers
      }
      await setGlobal({ index: value.findIndex(findObjectIndex) });
  } else {
    getFile("documentscollection.json", {decrypt: true})
    .then((fileContents) => {
       if(JSON.parse(fileContents).value) {
         setGlobal({ value: JSON.parse(fileContents || '{}').value })
         setGlobal({ initialLoad: "hide" });
       } else {
         setGlobal({ value: JSON.parse(fileContents || '{}') })
         setGlobal({ initialLoad: "hide" });
       }
    }).then(() =>{
      let value = global.value;
      const thisDoc = value.find((document) => { return document.id.toString() === doc.id.toString()});
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
          return doc.id === index; //this is comparing numbers
      }
      setGlobal({ index: value.findIndex(findObjectIndex) });
    })
      .catch(error => {
        console.log(error);
      });
  }
}

export function saveNewTags(doc) {
  const global = getGlobal();
  setGlobal({ loading: true });
  let content = global.content;
  const object = {};
  object.id = doc.id;
  object.title = global.title;
  object.updated = getMonthDayYear();
  object.singleDocTags = global.singleDocTags;
  object.content = content.toJSON();
  object.jsonContent = true;
  object.sharedWith = global.sharedWith;
  object.lastUpdate = Date.now();
  object.compressed = false;
  const objectTwo = {};
  objectTwo.title = global.title;
  objectTwo.id = doc.id;
  objectTwo.updated = getMonthDayYear();
  objectTwo.sharedWith = global.sharedWith;
  objectTwo.singleDocTags = global.singleDocTags;
  objectTwo.lastUpdate = Date.now;
  const index = global.index;
  const updatedDoc = update(global.value, {$splice: [[index, 1, objectTwo]]});
  setGlobal({value: updatedDoc, filteredValue: updatedDoc, singleDoc: object, loading: false }, () => {
    this.saveFullCollectionTags(doc);
  });

}

export async function saveFullCollectionTags(doc) {
  const global = getGlobal();
  let authProvider = await JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    const publicKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(global.value);
    const encryptedData = await encryptContent(data, {publicKey: publicKey})
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(storageProvider === 'dropbox') {
      token = JSON.parse(localStorage.getItem('oauthData'))
    } else {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token
    }
    const params = {
      content: encryptedData,
      filePath: '/documents/index.json',
      provider: storageProvider,
      token: token
    }

    let postToStorage = await postToStorageProvider(params);
    await console.log(postToStorage);
    const singleData = await JSON.stringify(global.singleDoc);
    const singleEncrypted = await encryptContent(singleData, {publicKey: publicKey})
    const doc = await global.singleDoc;
    const singleParams = await {
      content: singleEncrypted,
      filePath: `/documents/single/${doc.id}.json`,
      provider: storageProvider,
      token: token
    }
    let postSingle = await postToStorageProvider(singleParams)
    await console.log(postSingle);
    } else {
    putFile("documentscollection.json", JSON.stringify(global.value), {encrypt: true})
    .then(() => {
      console.log("Saved");
      this.saveSingleDocTags(doc);
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  } 
}

export function saveSingleDocTags(doc) {
  const global = getGlobal();
  const thisFile = doc.id;
  const fullFile = '/documents/' + thisFile + '.json';
  putFile(fullFile, JSON.stringify(global.singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved tags");
      this.loadCollection();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
}

export function deleteTag(tag, type) {
  // let tags;
  // if(doc.singleDocTags) {
  //   tags = doc.singleDocTags;
  // } else if(doc.tags) {
  //   tags = doc.tags;
  // }
  // setGlobal({ singleDocTags: tags}, () => {
  //   let singleDocTags = global.singleDocTags;
  //   const thisTag = singleDocTags.find((a) => { return a === tag});
  //   let tagIndex = thisTag;
  //   function findObjectIndex(a) {
  //       return a === tagIndex; //this is comparing numbers
  //   }
  //   setGlobal({ tagIndex: tags.findIndex(findObjectIndex) }, () => {
  //     tags.splice(global.tagIndex, 1);
  //     setGlobal({singleDocTags: tags});
  //   });
  // })
}

export function collabFilter(props) {
  const global = getGlobal();
  let value = global.value;
  let collaboratorFilter = value.filter(x => typeof x.sharedWith !== 'undefined' ? x.sharedWith.includes(props) : console.log(""));
  setGlobal({ filteredValue: collaboratorFilter, appliedFilter: true});
}

export function tagFilter(props) {
  const global = getGlobal();
  let value = global.value;
  let tagFilter = value.filter(x => typeof x.singleDocTags !== 'undefined' ? x.singleDocTags.includes(props) : null);
  setGlobal({ filteredValue: tagFilter, appliedFilter: true});
}

export function dateFilter(props) {
  const global = getGlobal();
  let value = global.value;
  let definedDate = value.filter((val) => { return val.updated !==undefined });
  let dateFilter = definedDate.filter(x => x.updated.includes(props));
  setGlobal({ filteredValue: dateFilter, appliedFilter: true});
}

export function clearFilter() {
  const global = getGlobal();
  setGlobal({ appliedFilter: false, filteredValue: global.value});
}

export function setDocsPerPage(e) {
  setGlobal({ docsPerPage: e.target.value});
}

export function loadTeamDocs() {
  const global = getGlobal();
  const { team, count } = global;
  if(team.length > count) {
    let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    let fileString = 'shareddocs.json'
    let file = publicKey + fileString;
    const directory = 'shared/' + file;
    const user = team[count].blockstackId;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(directory, options)
     .then((fileContents) => {
       let privateKey = loadUserData().appPrivateKey;
       setGlobal({
         docs: global.docs.concat(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents)))),
         count: global.count + 1
       })
     })
     .then(() => {
       this.loadTeamDocs();
     })
      .catch(error => {
        console.log(error);
        setGlobal({ count: global.count + 1})
        this.loadTeamDocs();
      });
  } else {
    setGlobal({ count: 0, loadingIndicator: false });
  }
}

export function handleRestore(file) {
  const global = getGlobal();
  let content = file.content;
  console.log(file);
  setGlobal({loading: true})
  const rando = Date.now();
  const object = {};
  const objectTwo = {}
  setGlobal({ loading: true, })
  object.title = file.title;
  object.lastUpdate = Date.now();
  object.id = rando;
  object.updated = getMonthDayYear();
  object.singleDocTags = file.singleDocTags || [];
  object.sharedWith = file.sharedWith || [];
  object.fileType = 'documents';
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.created;
  objectTwo.content = content;
  objectTwo.jsonContent = true;
  objectTwo.singleDocTags = object.singleDocTags;
  objectTwo.sharedWith = object.sharedWith;

  setGlobal({ value: [...global.value, object], filteredValue: [...global.filteredValue, object], singleDoc: objectTwo, tempDocId: object.id  }, () => {
    this.saveNewFile();
  });
}
