import {
  loadUserData,
  getFile,
  putFile, 
  decryptContent, 
  encryptContent
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
// import Plain from 'slate-plain-serializer';
import Html from 'slate-html-serializer';
import { Value } from 'slate'
import { getGlobal, setGlobal } from 'reactn';
import { fetchFromProvider } from './storageProviders/fetch';
import { postToStorageProvider } from './storageProviders/post';
import { loadDocs } from './helpers';
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

export async function findDoc() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    await loadDocs();
    console.log(getGlobal().value);
    let value = getGlobal().value;
    const thisDoc = value.find((doc) => {
      if(typeof doc.id === "string") {
        if(doc.id) {
          if(window.location.href.includes('did:')) {
            return doc.id === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
          } else {
            return doc.id === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
          }
        }
      } else {
        if(doc.id) {
          if(window.location.href.includes('did:')) {
            return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
          } else {
            return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
          }
        }
      }
      return null
    });
    if(thisDoc) {
      console.log('found in collection');
      setGlobal({ createRTC: false })
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //this is comparing a number to a number
      }
      setGlobal({index: value.findIndex(findObjectIndex)}, () => {
        loadSingleRTC();
      })
    } else {
      console.log('not found in collection, need to create')
      setGlobal({ createRTC: true }, () => {
        loadSharedRTC();
      })
    }
  } else {
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
            if(window.location.href.includes('did:')) {
              return doc.id === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
            } else {
              return doc.id === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
            }
          }
        } else {
          if(doc.id) {
            if(window.location.href.includes('did:')) {
              return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
            } else {
              return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
            }
          }
        }
        return null
      });
      if(thisDoc) {
        console.log('found in collection');
        setGlobal({ createRTC: false })
        let index = thisDoc && thisDoc.id;
        function findObjectIndex(doc) {
          return doc.id === index; //this is comparing a number to a number
        }
        setGlobal({index: value.findIndex(findObjectIndex)}, () => {
          loadSingleRTC();
        })
      } else {
        console.log('not found in collection, need to create')
        setGlobal({ createRTC: true }, () => {
          loadSharedRTC();
        })
      }
    })
    .catch(error => {
      console.log(error);
    });
  }
}

export async function loadSharedRTC() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  let thisKey;
  if(authProvider === 'uPort') {
    thisKey = JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
  } else {
    thisKey = loadUserData().appPrivateKey;
  }
  if(window.location.href.includes('did:')) {
    let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    let fileString = 'shareddocs.json'
    //the sharer is a uPort user and thus shared using IPFS. Need to fetch from there. 
    const params = {
        provider: 'ipfs',
        filePath: `/shared/${publicKey}/${fileString}`
      };
      //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(params);
    console.log(fetchFile)
    if(fetchFile) {
        const decryptedContent = await JSON.parse(decryptContent(fetchFile.data.pinataContent.content, { privateKey: thisKey }))
        console.log(decryptedContent);
        setGlobal({ sharedFile: decryptedContent }, () => {
          let docs = decryptedContent;
          const thisDoc = docs.find((doc) => {
            if(doc.id){
              return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
            }
            return null
          });
          if(thisDoc && thisDoc.rtc) {
            console.log("real-time")
            if(thisDoc && thisDoc.jsonContent) {
              let content = thisDoc && thisDoc.content;
              setGlobal({
                content: Value.fromJSON(content),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
              })
          } else {
            if(thisDoc && thisDoc.compressed) {
              setGlobal({
                content: thisDoc && html.deserialize(lzjs.decompress(thisDoc.content)),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
              })
            } else {
              setGlobal({
                content: thisDoc && html.deserialize(thisDoc.content),
                title: thisDoc && thisDoc.title,
                newSharedDoc: true,
                rtc: thisDoc && thisDoc.rtc,
                docLoaded: true,
                idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                teamDoc: thisDoc && thisDoc.teamDoc,
                sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
              })
            }
          }
        } else {
          console.log("static")
          setGlobal({
            content: thisDoc && thisDoc.content,
            fullContent: thisDoc && thisDoc.fullContent,
            title: thisDoc && thisDoc.title,
            newSharedDoc: true,
            rtc: thisDoc && thisDoc.rtc,
            docLoaded: true,
            idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
            tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
            teamDoc: thisDoc && thisDoc.teamDoc,
            sharedWith: thisDoc && thisDoc.sharedWith
          })
        }
      })
      } else {
        await setGlobal({ docs: [], loading: false })
      }
  } else {
    let userToLoadFrom = window.location.href.split('shared/')[1].split('/')[0].split('#')[0];
    let fileString = 'shareddocs.json';
    let file;
    let privateKey;
    if(authProvider === 'uPort') {
      file = JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public + fileString;
      privateKey = JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    } else {
      file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + fileString;
      privateKey = loadUserData().appPrivateKey;
    }
    const directory = 'shared/' + file;
    const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      getFile(directory, options)
      .then((fileContents) => {
          console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
          setGlobal({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
            let docs = JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents)));
            const thisDoc = docs.find((doc) => {
              if(doc.id){
                return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0]
              }
              return null
            });
            if(thisDoc && thisDoc.rtc) {
              console.log("real-time")
              if(thisDoc && thisDoc.jsonContent) {
                let content = thisDoc && thisDoc.content;
                setGlobal({
                  content: Value.fromJSON(content),
                  title: thisDoc && thisDoc.title,
                  newSharedDoc: true,
                  rtc: thisDoc && thisDoc.rtc,
                  docLoaded: true,
                  idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  teamDoc: thisDoc && thisDoc.teamDoc,
                  sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user], 
                  loading: false
                })
            } else {
              if(thisDoc && thisDoc.compressed) {
                setGlobal({
                  content: thisDoc && html.deserialize(lzjs.decompress(thisDoc.content)),
                  title: thisDoc && thisDoc.title,
                  newSharedDoc: true,
                  rtc: thisDoc && thisDoc.rtc,
                  docLoaded: true,
                  idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  teamDoc: thisDoc && thisDoc.teamDoc,
                  sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
                })
              } else {
                setGlobal({
                  content: thisDoc && html.deserialize(thisDoc.content),
                  title: thisDoc && thisDoc.title,
                  newSharedDoc: true,
                  rtc: thisDoc && thisDoc.rtc,
                  docLoaded: true,
                  idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
                  teamDoc: thisDoc && thisDoc.teamDoc,
                  sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
                })
              }
            }
          } else {
            console.log("static")
            setGlobal({
              content: thisDoc && thisDoc.content,
              fullContent: thisDoc && thisDoc.fullContent,
              title: thisDoc && thisDoc.title,
              newSharedDoc: true,
              rtc: thisDoc && thisDoc.rtc,
              docLoaded: true,
              idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
              tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
              teamDoc: thisDoc && thisDoc.teamDoc,
              sharedWith: thisDoc && thisDoc.sharedWith
            })
          }
        })
      })
      .then(() => {
        console.log(getGlobal().index)
      })
        .catch(error => {
          console.log(error);
        });
  }
}

export async function loadSingleRTC() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const thisFile = window.location.href.split('shared/')[1].split('/')[1].split('#')[0];
  const fullFile = '/documents/' + thisFile + '.json';
  if(authProvider === 'uPort') {
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
    } else {
      token = JSON.parse(localStorage.getItem('oauthData'))
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
    if (fetchFile.loadLocal || storageProvider === 'google' || storageProvider === 'ipfs') {
      let decryptedContent;
      if(storageProvider === 'google') {
        decryptedContent = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
      } else {
        decryptedContent = await JSON.parse(
          decryptContent(JSON.parse(fetchFile.data.content), {
            privateKey: thisKey
          })
        );
      }
      
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
  } else {
    getFile(fullFile, {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
        if(JSON.parse(fileContents).compressed) {
          setGlobal({ content: html.deserialize(lzjs.decompress(JSON.parse(fileContents).content)) })
        } else {
          if(JSON.parse(fileContents).jsonContent) {
            let content = JSON.parse(fileContents).content;
            setGlobal({ content: Value.fromJSON(content) });
          } else {
            setGlobal({ content: html.deserialize(JSON.parse(fileContents).content) });
          }
        }
        setGlobal({
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
        console.log(getGlobal().index)
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export async function handleAddRTC() {
  const object = {};
  object.title = getGlobal().title;
  object.id = getGlobal().tempDocId;
  object.updated = getMonthDayYear();
  object.tags = [];
  object.sharedWith = [];
  object.rtc = getGlobal().rtc;
  object.teamDoc = getGlobal().teamDoc;
  object.compressed = true;
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.created;
  objectTwo.content = lzjs.compress(html.serialize(getGlobal().content));
  objectTwo.tags = [];
  objectTwo.compressed = true;
  objectTwo.sharedWith = [];
  objectTwo.rtc = getGlobal().rtc;
  objectTwo.teamDoc = getGlobal().teamDoc;

  setGlobal({
    value: [...getGlobal().value, object],
    createRTC: false,
     singleDoc: objectTwo
  }, () => {
    saveNewSharedFile();
  });
}

export async function handleAddStatic() {
  setGlobal({ loading: true });
  const object = {};
  const objectTwo = {}
  object.title = getGlobal().title;
  object.lastUpdate = Date.now();
  object.id = Date.now();
  object.updated = getMonthDayYear();
  object.singleDocTags = [];
  object.sharedWith = [];
  object.fileType = 'documents';
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = Date.now();
  objectTwo.content = getGlobal().fullContent;
  objectTwo.compressed = false;
  objectTwo.jsonContent = true;
  objectTwo.singleDocTags = [];
  objectTwo.sharedWith = [];

  setGlobal({
    value: [...getGlobal().value, object],
    filteredValue: [...getGlobal().value, object],
    singleDoc: objectTwo,
    tempDocId: object.id
  }, () => {
    saveNewSharedFile();
  });
}

export async function saveNewSharedFile() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  setGlobal({loading: true})
  if(authProvider === 'uPort') {
    const publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(getGlobal().value);
    const encryptedData = await encryptContent(data, { publicKey: publicKey });
    const storageProvider = JSON.parse(localStorage.getItem("storageProvider"));
    let token;
    if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
      token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
    } else {
      token = JSON.parse(localStorage.getItem('oauthData'))
    }
    const params = {
      content: encryptedData,
      filePath: '/documents/index.json',
      provider: storageProvider,
      token: token, 
      update: true
    };

    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);

    const data2 = JSON.stringify(getGlobal().singleDoc);
    const encryptedData2 = await encryptContent(data2, { publicKey: publicKey });
    const params2 = {
      content: encryptedData2,
      filePath: `/documents/single/${getGlobal().tempDocId}.json`,
      provider: storageProvider,
      token: token, 
      update: true
    };

   let postToStorage2 = await postToStorageProvider(params2);
   console.log(postToStorage2);
   window.location.replace("/documents");
  } else {
    putFile("documentscollection.json", JSON.stringify(getGlobal().value), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      saveNewSingleSharedDoc();
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }
}

export async function saveNewSingleSharedDoc() {
  const file = getGlobal().tempDocId;
  const fullFile = '/documents/' + file + '.json'
  putFile(fullFile, JSON.stringify(getGlobal().singleDoc), {encrypt:true})
    .then(() => {
      console.log("Saved!");
      if(getGlobal().rtc !== true) {
        window.location.replace("/documents");
      }
    })
    .catch(e => {
      console.log("e");
      console.log(e);
    });
  }

export async function loadAllDocs() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents)) {
       if(JSON.parse(fileContents).value) {
         setGlobal({ value: JSON.parse(fileContents || '{}').value });
       } else {
         setGlobal({ value: JSON.parse(fileContents || '{}') });
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
