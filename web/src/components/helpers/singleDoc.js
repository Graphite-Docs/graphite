import { setGlobal, getGlobal } from 'reactn';
import { loadDocs, loadContacts } from './helpers';
import { postToSlack, postToWebhook } from './traditionalIntegrations';
import { loadCollection } from './documents';
import {
  getFile,
  putFile,
  loadUserData,
  lookupProfile,
  decryptContent,
  encryptContent
} from "blockstack";
import axios from "axios";
import { getMonthDayYear } from "./getMonthDayYear";
import update from "immutability-helper";
import { isKeyHotkey } from "is-hotkey";
import { Value } from "slate";
import Html from "slate-html-serializer";
import myTimeline from "../documents/editor/initialTimeline.json";
import { fetchFromProvider } from "./storageProviders/fetch";
import { postToStorageProvider } from "./storageProviders/post";
const wordcount = require("wordcount");
const FileSaver = require("file-saver");
const uuidv4 = require("uuid/v4");
const htmlDocx = require("html-docx-js/dist/html-docx");
const lzjs = require("lzjs");
const { encryptECIES } = require("blockstack/lib/encryption");
const html2pdf = require("html2pdf.js");
const isBoldHotkey = isKeyHotkey("mod+b");
const isItalicHotkey = isKeyHotkey("mod+i");
const isUnderlinedHotkey = isKeyHotkey("mod+u");
const isCodeHotkey = isKeyHotkey("mod+`");

const authProvider = JSON.parse(localStorage.getItem("authProvider"));

let htmlContent;
let versionID;
var timer = null;

const BLOCK_TAGS = {
  p: "paragraph",
  li: "list-item",
  ul: "bulleted-list",
  ol: "numbered-list",
  blockquote: "quote",
  pre: "code",
  h1: "heading-one",
  h2: "heading-two",
  h3: "heading-three",
  h4: "heading-four",
  h5: "heading-five",
  h6: "heading-six"
};

const MARK_TAGS = {
  strong: "bold",
  em: "italic",
  u: "underline",
  s: "strikethrough",
  code: "code"
};

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()];

      if (block) {
        return {
          object: "block",
          type: block,
          nodes: next(el.childNodes)
        };
      }
    }
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()];

      if (mark) {
        return {
          object: "mark",
          type: mark,
          nodes: next(el.childNodes)
        };
      }
    }
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === "pre") {
        const code = el.childNodes[0];
        const childNodes =
          code && code.tagName.toLowerCase() === "code"
            ? code.childNodes
            : el.childNodes;

        return {
          object: "block",
          type: "code",
          nodes: next(childNodes)
        };
      }
    }
  },
  {
    // Special case for images, to grab their src.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === "img") {
        return {
          object: "block",
          type: "image",
          nodes: next(el.childNodes),
          data: {
            src: el.getAttribute("src")
          }
        };
      }
    }
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === "a") {
        return {
          object: "inline",
          type: "link",
          nodes: next(el.childNodes),
          data: {
            href: el.getAttribute("href")
          }
        };
      }
    }
  }
];

const html = new Html({ rules: RULES });

export async function initialDocLoad() {
  setGlobal({ loading: true });
  setGlobal({
    myTimeline: myTimeline,
    timelineTitle: myTimeline.title,
    timelineEvents: myTimeline.events
  });
  const thisFile = window.location.href.split("doc/")[1].includes("#")
    ? window.location.href.split("doc/")[1].split("#")[0]
    : window.location.href.split("doc/")[1];
  const fullFile = "/documents/" + thisFile + ".json";

  if (authProvider === "uPort") {
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(localStorage.getItem('oauthData')) {
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
    } else {
      token = "";
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
    if (fetchFile.loadLocal || storageProvider === 'google' || storageProvider === 'ipfs' || storageProvider === 'ipfs') {
      let decryptedContent;
      if(storageProvider === 'google' || storageProvider === 'ipfs') {
        if(storageProvider === 'google') {
          decryptedContent = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
        } else {
          if(fetchFile.loadLocal) {
            let content = fetchFile.data.content;
            console.log(JSON.parse(content));
            decryptedContent = await JSON.parse(decryptContent(JSON.parse(content), { privateKey: thisKey }))
          } else {
            let content = fetchFile.data.pinataContent ? fetchFile.data.pinataContent : fetchFile.data;
          console.log(content);
          decryptedContent = await JSON.parse(decryptContent(content.content, { privateKey: thisKey }))
          }
        }
      } else {
        decryptedContent = await JSON.parse(
          decryptContent(JSON.parse(fetchFile.data.content), {
            privateKey: thisKey
          }));
      }
      try {
        setGlobal({ content: Value.fromJSON(decryptedContent.content) })
      } catch(err) {
        setGlobal({ content: getGlobal().content });
      }
      setGlobal(
        {
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
        },
        async () => {
          console.log(getGlobal().content)
          const storageProvider = JSON.parse(localStorage.getItem('storageProvider'))
          let token;
          if(localStorage.getItem('oauthData')) {
            if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
              token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
            } else {
              token = JSON.parse(localStorage.getItem('oauthData'))
            }
          } else {
            token = "";
          }
          const object = {
            provider: storageProvider,
            token: token,
            filePath: '/documents/index.json'
          }
          //Call fetchFromProvider and wait for response.
          const indexFile = await fetchFromProvider(object);
          console.log('indexFile')
          console.log(indexFile)
          let decryptedIndex;
          if(storageProvider === 'google') {
            decryptedIndex = await JSON.parse(decryptContent(indexFile, { privateKey: thisKey }));
          } else if(storageProvider === 'ipfs') {
            if(indexFile.loadLocal) {
              let indexContent = indexFile.data.content;
              console.log(indexContent);
              decryptedIndex = await JSON.parse(decryptContent(JSON.parse(indexContent), { privateKey: thisKey }))
            } else {
              let indexContent = indexFile.data.pinataContent ? indexFile.data.pinataContent : indexFile.data;
              console.log(indexContent);
              decryptedIndex = await JSON.parse(decryptContent(indexContent.content, { privateKey: thisKey }))
            }
          } else {
            decryptedIndex = await JSON.parse(decryptContent(JSON.parse(indexFile.data.content), { privateKey: thisKey }))
          }
           
          setGlobal(
            {
              value: decryptedIndex,
              filteredValue: decryptedIndex
            },
             async () => {
              console.log(decryptedIndex)
              let value = decryptedIndex;
              const thisDoc = await value.find(doc => {
                if (typeof doc.id === "string") {
                  if (doc.id) {
                    if (window.location.href.split('doc/')[1].includes('#')) {
                      return (
                        doc.id ===
                        window.location.href.split("doc/")[1].split("#")[0]
                      );
                    } else {
                      return doc.id === window.location.href.split("doc/")[1].split('#')[0];
                    }
                  }
                } else {
                  if (doc.id) {
                    if (window.location.href.split('doc/')[1].includes('#')) {
                      return (
                        doc.id.toString() ===
                        window.location.href.split("doc/")[1].split("#")[0]
                      );
                    } else {
                      return doc.id.toString() === window.location.href.split("doc/")[1];
                    }
                  }
                }
                return null;
              });
              let index = thisDoc && thisDoc.id;
              function findObjectIndex(doc) {
                return doc.id === index; //this is comparing a number to a number
              }
              setGlobal({ index: value.findIndex(findObjectIndex) }, async () => {
                //Here we are fetching the timeline file (if there is one)
                const storageProvider = JSON.parse(localStorage.getItem('storageProvider'))
                let token;
                if(localStorage.getItem('oauthData')) {
                  if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
                    token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
                  } else {
                    token = JSON.parse(localStorage.getItem('oauthData'))
                  }
                } else {
                  token = "";
                }
                const object = {
                  provider: storageProvider,
                  token: token,
                  filePath: `/timelines/${thisFile}.json`
                }
                const timelineFile = await fetchFromProvider(object);
                console.log(timelineFile)
                let decryptedTimeline;
                if(storageProvider === 'google') {
                  decryptedTimeline = await JSON.parse(decryptContent(timelineFile, { privateKey: thisKey }))
                } else if(storageProvider === 'ipfs') {
                  let content = timelineFile.data.pinataContent ? timelineFile.data.pinataContent : timelineFile.data;
                  console.log(content);
                  decryptedTimeline = await JSON.parse(decryptContent(content.content, { privateKey: thisKey }))
                } else {
                  decryptedTimeline = await JSON.parse(decryptContent(JSON.parse(indexFile.data.content), { privateKey: thisKey }))
                }
                if(decryptedTimeline) {
                  setGlobal({
                    myTimeline: decryptedTimeline,
                    timelineTitle: decryptedTimeline.title,
                    timelineEvents: decryptedTimeline.events
                  })
                }
              });
            }
          );
        }
      );
    } else {
      //No indexedDB data found, so we load and read from the API call.
      //Load up a new file reader and convert response to JSON.
      const reader = await new FileReader();
      var blob = await fetchFile.fileBlob;
      reader.onloadend = async evt => {
        let decryptedContent;
        console.log("read success");
        if(JSON.parse(localStorage.getItem('storageProvider')) === 'google') {
          decryptedContent = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
        } else {
          decryptedContent = await JSON.parse(
            decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey })
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
          });
      };
      await console.log(reader.readAsText(blob));


      const storageProvider = JSON.parse(localStorage.getItem('storageProvider'))
      let token;
      if(localStorage.getItem('oauthData')) {
        if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
          token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
        } else {
          token = JSON.parse(localStorage.getItem('oauthData'))
        }
      } else {
        token = "";
      }
      const object = {
        provider: storageProvider,
        token: token,
        filePath: '/documents/index.json'
      }
      //Call fetchFromProvider and wait for response.
      const indexFile = await fetchFromProvider(object);
      console.log('indexFile')
      console.log(indexFile)
      var blob2 = indexFile.fileBlob;
      reader.onloadend = async evt => {
        let decryptedIndex;
        const thisKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
        if(JSON.parse(localStorage.getItem('storageProvider')) === 'google') {
          decryptedIndex = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
        } else {
          decryptedIndex = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
        }
        console.log(decryptedIndex)
        await setGlobal(
        {
          value: decryptedIndex,
          filteredValue: decryptedIndex
        },
        async () => {
          const thisDoc = await decryptedIndex.find(doc => {
            if (typeof doc.id === "string") {
              if (doc.id) {
                if (window.location.href.split("doc/")[1].includes("#")) {
                  return (
                    doc.id ===
                    window.location.href.split("doc/")[1].split("#")[0]
                  );
                } else {
                  return doc.id === window.location.href.split("doc/")[1];
                }
              }
            } else {
              if (doc.id) {
                return (
                  doc.id.toString() ===
                  window.location.href.split("doc/")[1].split('#')[0]
                ); //this is comparing a string to a string
              }
            }
            return null;
          });
          let index = thisDoc && thisDoc.id;
          function findObjectIndex(doc) {
            return doc.id === index; //this is comparing a number to a number
          }
          setGlobal({ index: decryptedIndex.findIndex(findObjectIndex) });
        }
      );
      }

      await console.log(reader.readAsText(blob2));
    }
  } else if (authProvider === "blockstack") {
    getFile("documentscollection.json", { decrypt: true })
      .then(fileContents => {
        if (fileContents) {
          if (JSON.parse(fileContents)) {
            if (JSON.parse(fileContents).value) {
              setGlobal(
                {
                  value: JSON.parse(fileContents).value,
                  filteredValue: JSON.parse(fileContents).value
                },
                () => {
                  let value = getGlobal().value;
                  const thisDoc = value.find(doc => {
                    if (typeof doc.id === "string") {
                      if (doc.id) {
                        if (
                          window.location.href.split("doc/")[1].includes("#")
                        ) {
                          return (
                            doc.id ===
                            window.location.href.split("doc/")[1].split("#")[0]
                          );
                        } else {
                          return (
                            doc.id === window.location.href.split("doc/")[1]
                          );
                        }
                      }
                    } else {
                      if (doc.id) {
                        return (
                          doc.id.toString() ===
                          window.location.href.split("doc/")[1].split('#')[0]
                        ); //this is comparing a string to a string
                      }
                    }
                    return null;
                  });
                  let index = thisDoc && thisDoc.id;
                  function findObjectIndex(doc) {
                    return doc.id === index; //this is comparing a number to a number
                  }
                  setGlobal({ index: value.findIndex(findObjectIndex) });
                }
              );
            } else {
              setGlobal(
                {
                  value: JSON.parse(fileContents),
                  filteredValue: JSON.parse(fileContents)
                },
                () => {
                  let value = getGlobal().value;
                  const thisDoc = value.find(doc => {
                    if (typeof doc.id === "string") {
                      if (doc.id) {
                        return doc.id === window.location.href.split("doc/")[1].split('#')[0]; //this is comparing a string to a string
                      }
                    } else {
                      if (doc.id) {
                        return (
                          doc.id.toString() ===
                          window.location.href.split("doc/")[1]
                        ); //this is comparing a string to a string
                      }
                    }
                    return null;
                  });
                  let index = thisDoc && thisDoc.id;
                  function findObjectIndex(doc) {
                    return doc.id === index; //this is comparing a number to a number
                  }
                  setGlobal({ index: value.findIndex(findObjectIndex) });
                }
              );
            }
          }
        } else {
          setGlobal({ value: [], filteredValue: [] });
        }
      })
      .then(() => {
        getFile(fullFile, { decrypt: true })
          .then(fileContents => {
            console.log(JSON.parse(fileContents));
            let thisContent;

            if (JSON.parse(fileContents).compressed === true) {
              console.log("compressed doc");
              setGlobal({
                content: html.deserialize(
                  lzjs.decompress(JSON.parse(fileContents).content)
                ),
                title: JSON.parse(fileContents || "{}").title,
                tags: JSON.parse(fileContents || "{}").tags,
                idToLoad: JSON.parse(fileContents || "{}").id,
                singleDocIsPublic: JSON.parse(fileContents || "{}")
                  .singleDocIsPublic, //adding this...
                docLoaded: true,
                readOnly: JSON.parse(fileContents || "{}").readOnly, //NOTE: adding this, to setState of readOnly from getFile...
                rtc: JSON.parse(fileContents || "{}").rtc || false,
                sharedWith: JSON.parse(fileContents || "{}").sharedWith,
                teamDoc: JSON.parse(fileContents || "{}").teamDoc,
                compressed:
                  JSON.parse(fileContents || "{}").compressed || false,
                spacing: JSON.parse(fileContents || "{}").spacing,
                lastUpdate: JSON.parse(fileContents).lastUpdate,
                jsonContent: true,
                versions: JSON.parse(fileContents).versions || []
              });
            } else {
              console.log("Not compressed");
              if (JSON.parse(fileContents).jsonContent) {
                console.log("Json doc");
                thisContent = JSON.parse(fileContents).content;
                setGlobal({
                  content: Value.fromJSON(thisContent),
                  title: JSON.parse(fileContents || "{}").title,
                  tags: JSON.parse(fileContents || "{}").tags,
                  idToLoad: JSON.parse(fileContents || "{}").id,
                  singleDocIsPublic: JSON.parse(fileContents || "{}")
                    .singleDocIsPublic, //adding this...
                  docLoaded: true,
                  readOnly: JSON.parse(fileContents || "{}").readOnly, //NOTE: adding this, to setState of readOnly from getFile...
                  rtc: JSON.parse(fileContents || "{}").rtc || false,
                  sharedWith: JSON.parse(fileContents || "{}").sharedWith,
                  teamDoc: JSON.parse(fileContents || "{}").teamDoc,
                  compressed:
                    JSON.parse(fileContents || "{}").compressed || false,
                  spacing: JSON.parse(fileContents || "{}").spacing,
                  lastUpdate: JSON.parse(fileContents).lastUpdate,
                  jsonContent: true,
                  versions: JSON.parse(fileContents).versions || []
                });
              } else {
                thisContent = JSON.parse(fileContents).content;
                console.log("html doc");
                setGlobal({
                  content: Value.fromJSON(thisContent),
                  title: JSON.parse(fileContents || "{}").title,
                  tags: JSON.parse(fileContents || "{}").tags,
                  idToLoad: JSON.parse(fileContents || "{}").id,
                  singleDocIsPublic: JSON.parse(fileContents || "{}")
                    .singleDocIsPublic, //adding this...
                  docLoaded: true,
                  readOnly: JSON.parse(fileContents || "{}").readOnly, //NOTE: adding this, to setState of readOnly from getFile...
                  rtc: JSON.parse(fileContents || "{}").rtc || false,
                  sharedWith: JSON.parse(fileContents || "{}").sharedWith,
                  teamDoc: JSON.parse(fileContents || "{}").teamDoc,
                  compressed:
                    JSON.parse(fileContents || "{}").compressed || false,
                  spacing: JSON.parse(fileContents || "{}").spacing,
                  lastUpdate: JSON.parse(fileContents).lastUpdate,
                  versions: JSON.parse(fileContents).versions || []
                });
              }
            }
          })
          .then(() => {
            loadContacts();
          })
          .then(() => {
            let timelineFile =
              "timelines/" + window.location.href.split("doc/")[1] + ".json";
            getFile(timelineFile, { decrypt: true }).then(file => {
              if (file) {
                setGlobal(
                  {
                    myTimeline: JSON.parse(file),
                    timelineTitle: JSON.parse(file).title,
                    timelineEvents: JSON.parse(file).events
                  },
                  () => {
                    new window.TL.Timeline(
                      "timeline-embed",
                      getGlobal().myTimeline
                    );
                  }
                );
              } else {
                setGlobal({
                  myTimeline: myTimeline,
                  timelineTitle: myTimeline.title,
                  timelineEvents: myTimeline.events
                });
              }
            });
          })
          .then(() => {
            getFile(window.location.href.split("doc/")[1] + "sharedwith.json", {
              decrypt: true
            })
              .then(fileContents => {
                if (fileContents) {
                  setGlobal({
                    sharedWith: JSON.parse(fileContents || "{}")
                  });
                } else {
                  setGlobal({ sharedWith: [] });
                }
              })
              .catch(error => {
                console.log("shared with doc error: ");
                console.log(error);
              });
          })
          .then(() => {
            setGlobal({ loading: false }, () => {
              // document.getElementsByClassName('ql-editor')[0].style.lineHeight = getGlobal().spacing;
              loadAvatars();
            });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });

    this.printPreview = () => {
      if (getGlobal().printPreview === true) {
        setGlobal({ printPreview: false });
      } else {
        setGlobal({ printPreview: true });
      }
    };
  }
}

export function noCollaboration() {
  const thisFile = window.location.href.split("doc/")[1];
  const fullFile = "/documents/" + thisFile + ".json";
  if (getGlobal().content === "<p><br></p>") {
    getFile(fullFile, { decrypt: true })
      .then(fileContents => {
        setGlobal({
          title: JSON.parse(fileContents || "{}").title,
          content: JSON.parse(fileContents || "{}").content,
          tags: JSON.parse(fileContents || "{}").tags,
          idToLoad: JSON.parse(fileContents || "{}").id,
          singleDocIsPublic: JSON.parse(fileContents || "{}").singleDocIsPublic, //adding this...
          docLoaded: true,
          readOnly: JSON.parse(fileContents || "{}").readOnly, //NOTE: adding this, to setState of readOnly from getFile...
          rtc: JSON.parse(fileContents || "{}").rtc || false,
          sharedWith: JSON.parse(fileContents || "{}").sharedWith
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export function loadAvatars() {
  if (getGlobal().sharedWith) {
    if (getGlobal().sharedWith.length > 0) {
      getGlobal().sharedWith.forEach(name => {
        console.log(getGlobal().avatars);
        lookupProfile(name, "https://core.blockstack.org/v1/names")
          .then(profile => {
            setGlobal({ avatars: [...getGlobal().avatars, profile] });
          })
          .catch(error => {
            console.log("could not resolve profile");
          });
      });
    } else {
      setTimeout(loadAvatars, 300);
    }
  }
}

export function stealthyChat() {
  setGlobal({ hideStealthy: !getGlobal().hideStealthy });
}

export function toggleReadOnly() {
  //make this function toggleReadyOnly state instead, so user can press button again
  setGlobal({readOnly: !getGlobal().readOnly}, () => {
    sharePublicly();
  })
}

export function handleAutoSave(e) {
  setGlobal({ content: e.target.value });
  clearTimeout(this.timeout);
  this.timeout = setTimeout(handleAutoAdd, 1500);
}

export function sharePublicly() {
  if (getGlobal().readOnly === undefined) {
    setGlobal({ readOnly: true }, async () => {
      const object = await {
        title: getGlobal().title,
        content: document.getElementsByClassName("editor")[0].innerHTML, 
        readOnly: true,
        words: wordcount(
          document
            .getElementsByClassName("editor")[0]
            .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
        ), 
        shared: getMonthDayYear(), 
        singleDocIsPublic: true
      };
      setGlobal(
        {
          singlePublic: object,
          singleDocIsPublic: true
        },
        () => {
          savePublic();
        }
      );
    });
  } else {
    const object = {};
    object.title = getGlobal().title;
    if (getGlobal().readOnly) {
      object.content = document.getElementsByClassName("editor")[0].innerHTML;
    } else {
      let content = getGlobal().content;
      object.content = content.toJSON();
    }
    object.readOnly = getGlobal().readOnly;
    object.words = wordcount(
      document
        .getElementsByClassName("editor")[0]
        .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
    );
    object.shared = getMonthDayYear();
    object.singleDocIsPublic = true;
    setGlobal(
      {
        singlePublic: object,
        singleDocIsPublic: true
      },
      () => {
        savePublic();
      }
    );
  }
}

export function stopSharing() {
  setGlobal({
    singlePublic: {},
    singleDocIsPublic: false
  }, () => {
    saveStop()
  });
}

export async function saveStop() {
  const params = window.location.href.split("doc/")[1];
  const directory = "public/";
  const file = directory + params + ".json";
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    const did = await JSON.parse(localStorage.getItem('uPortUser')).payload.did.split(':')[2];
    const data = JSON.stringify(getGlobal().singlePublic);
    const params = {
      content: data,
      provider: 'ipfs',
      filePath: `/ipfs/${did}/${file}`,
    };
    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);
    handleAutoAdd();
  } else {
    putFile(file, JSON.stringify(getGlobal().singlePublic), { encrypt: false })
    .then(() => {
      handleAutoAdd();
    })
    .catch(e => {
      console.log(e);
    });
  }
}

export async function savePublic() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const id = window.location.href.split("doc/")[1].split('#')[0];
  const directory = "public/";
  const file = directory + id + ".json";
  if(authProvider === 'uPort') {
    const did = await JSON.parse(localStorage.getItem('uPortUser')).payload.did.split(':')[2];
    const link = `${window.location.origin}/shared/docs/ipfs/${did}/${file}`;
    const data = JSON.stringify(getGlobal().singlePublic);
    const params = {
      content: data,
      provider: 'ipfs',
      filePath: `/ipfs/${did}/${file}`,
    };
    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);
    await setGlobal({ gaiaLink: link, publicShare: "", shareModal: "hide" });
  } else {
    const user = loadUserData().username;
    const link = window.location.origin + "/shared/docs/" + user + "-" + id;
    putFile(file, JSON.stringify(getGlobal().singlePublic), { encrypt: false })
    .then(() => {
      setGlobal({ gaiaLink: link, publicShare: "", shareModal: "hide" });
      // this.handleAutoAdd() //call this every time savePublic is called, so getGlobal().singleDocIsPublic persists to database...
    })
    .catch(e => {
      console.log(e);
    });
  }
}

export function copyLink() {
  var copyText = document.getElementById("gaia");
  copyText.select();
  document.execCommand("Copy");
  window.Materialize.toast("Link copied to clipboard", 1000);
}

export function sharedInfoSingleDocRTC(props) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(props.contact.includes('did:')) {
    //This is a uPort contact. Need to grab the pubkey
    setGlobal({ pubKey: props.pubKey, receiverID: props.contact.name, rtc: true }, () => {
      loadMyFile();
    })
  } else {
    setGlobal({ receiverID: props.contact, rtc: true });
    const user = props.contact;
    const options = {
      username: user,
      zoneFileLookupURL: "https://core.blockstack.org/v1/names",
      decrypt: false
    };

    getFile("key.json", options)
      .then(file => {
        setGlobal({ pubKey: JSON.parse(file) });
        console.log("Step One: PubKey Loaded");
      })
      .then(() => {
        getFile("graphiteprofile.json", options).then(fileContents => {
          if (JSON.parse(fileContents).emailOK) {
            const object = {};
            object.sharedBy = authProvider === 'uPort' ? JSON.parse(localStorage.getItem('uPortUser')).payload.did : loadUserData().username;
            object.title = getGlobal().title;
            object.from_email = "contact@graphitedocs.com";
            object.to_email = JSON.parse(fileContents).profileEmail;
            if (window.location.href.includes("/documents")) {
              object.subject =
                "New Graphite document shared by " + loadUserData().username;
              object.link =
                window.location.origin +
                "/documents/single/shared/" +
                object.sharedBy +
                "/" +
                window.location.href.split("doc/")[1];
              object.content =
                "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" +
                object.sharedBy +
                " has shared a document with you.</h3><p>Access it here:</p><br><a href=" +
                object.link +
                ">" +
                object.link +
                "</a></div>";
              axios
                .post(
                  "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared",
                  object
                )
                .then(res => {
                  console.log(res);
                });
              console.log(object);
            }
          } else {
            console.log("you can't email this person");
          }
        });
      })
      .then(() => {
        loadMyFile();
      })
      .catch(error => {
        console.log("No key: " + error);
        setGlobal(
          { loading: false, displayMessage: true, results: [] },
          () => {
            setTimeout(() => setGlobal({ displayMessage: false }), 3000);
          }
        );
      });
  }
}

export async function sharedInfoSingleDocStatic(props) {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  htmlContent = document.getElementsByClassName("editor")[0].innerHTML;
  if(props.contact.includes('did:')) {
    //This is a uPort contact. Need to grab the pubkey
    setGlobal({ pubKey: props.pubKey, receiverID: props.contact.name, rtc: false }, () => {
      loadMyFile();
    })
  } else {
    setGlobal({ receiverID: props.contact, rtc: false });
    const user = props.contact;
    const options = {
      username: user,
      zoneFileLookupURL: "https://core.blockstack.org/v1/names",
      decrypt: false
    };
  getFile("key.json", options)
    .then(file => {
      setGlobal({ pubKey: JSON.parse(file) });
      console.log("Step One: PubKey Loaded");
    })
    .then(() => {
      getFile("graphiteprofile.json", options).then(fileContents => {
        if (JSON.parse(fileContents).emailOK) {
          const object = {};
          object.sharedBy = authProvider === 'uPort' ? JSON.parse(localStorage.getItem('uPortUser')).payload.did : loadUserData().username;
          object.title = getGlobal().title;
          object.from_email = "contact@graphitedocs.com";
          object.to_email = JSON.parse(fileContents).profileEmail;
          if (window.location.href.includes("/documents")) {
            object.subject =
              "New Graphite document shared by " + object.sharedBy;
            object.link =
              window.location.origin +
              "/documents/single/shared/" +
              object.sharedBy +
              "/" +
              window.location.href.split("doc/")[1].split('#')[0];
            object.content =
              "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='margin:15px;color:#fff;'>Graphite</h3></div><h3>" +
              object.sharedBy +
              " has shared a document with you.</h3><p>Access it here:</p><br><a href=" +
              object.link +
              ">" +
              object.link +
              "</a></div>";
            axios
              .post(
                "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/file-shared",
                object
              )
              .then(res => {
                console.log(res);
              });
            console.log(object);
          }
        } else {
          console.log("you can't email this person");
        }
      });
    })
    .then(() => {
      loadMyFile();
    })
    .catch(error => {
      console.log("No key: " + error);
      setGlobal(
        { loading: false, displayMessage: true, results: [] },
        () => {
          setTimeout(() => setGlobal({ displayMessage: false }), 3000);
        }
      );
    });
  }
}

export async function loadMyFile() {
  console.log(getGlobal().receiverID)
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const pubKey = getGlobal().pubKey;
  if(authProvider === 'uPort') {
    const fileName = "shareddocs.json";
    const file = "/mine/" + pubKey + "/" + fileName;
    const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
    //Create the params to send to the fetchFromProvider function.
    const storageProvider = JSON.parse(localStorage.getItem('storageProvider'));
    let token;
    if(localStorage.getItem('oauthData')) {
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
    } else {
      token = "";
    }
    const params = {
      provider: storageProvider,
      token: token,
      filePath: file
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(params);
    console.log(fetchFile)
    if(fetchFile) {
      if(fetchFile.loadLocal || storageProvider === 'google' || storageProvider === 'ipfs') {
        let decryptedContent;
        if(storageProvider === 'google') {
          decryptedContent = await JSON.parse(decryptContent(fetchFile, { privateKey: thisKey }))
        } else {
          decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
        }
        await setGlobal({ shareFile: decryptedContent })
      } else {
        //check if there is no file to load and set state appropriately.
        if(typeof fetchFile === 'string') {
          console.log("Nothing stored locally or in storage provider.")
          if(fetchFile.includes('error')) {
            console.log("Setting state appropriately")
            await setGlobal({shareFile: []})
          }
        } else {
          //No indexedDB data found, so we load and read from the API call.
          //Load up a new file reader and convert response to JSON.
          const reader = await new FileReader();
          var blob = fetchFile.fileBlob;
          reader.onloadend = async (evt) => {
            console.log("read success");
            const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
            await setGlobal({ shareFile: decryptedContent })
          };
          await console.log(reader.readAsText(blob));
        }
      }
    } else {
      await setGlobal({ shareFile: [] })
    }
    const object = {};
        let content = getGlobal().content;
        object.title = getGlobal().title;
        object.compressed = false;
        if (getGlobal().rtc) {
          object.jsonContent = true;
          object.content = content.toJSON();
        } else {
          object.jsonContent = false;
          object.content = htmlContent;
          object.fullContent = content.toJSON();
        }
        getGlobal().teamShare ? (object.teamDoc = true) : (object.teamDoc = false);
        object.id = window.location.href.split("doc/")[1];
        object.receiverID = getGlobal().receiverID;
        object.words = wordcount(
          document
            .getElementsByClassName("editor")[0]
            .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
        );
        object.sharedWith = [...getGlobal().sharedWith, getGlobal().receiverID];
        object.shared = getMonthDayYear();
        object.rtc = getGlobal().rtc;
        object.user = JSON.parse(localStorage.getItem('uPortUser')).payload.did;
        await setGlobal({
          shareFile: [...getGlobal().shareFile, object],
          sharedWith: [...getGlobal().sharedWith, getGlobal().receiverID]
        }, () => {
          shareDoc();
        });
  } else {
    const fileName = "shareddocs.json";
    const file = "mine/" + pubKey + "/" + fileName;
    getFile(file, { decrypt: true })
      .then(fileContents => {
        setGlobal({ shareFile: JSON.parse(fileContents || "{}") });
        setGlobal({ show: "hide" });
      })
      .then(() => {
        const object = {};
        let content = getGlobal().content;
        object.title = getGlobal().title;
        object.compressed = false;
        if (getGlobal().rtc) {
          object.jsonContent = true;
          object.content = content.toJSON();
        } else {
          object.jsonContent = false;
          object.content = htmlContent;
          object.fullContent = content.toJSON();
        }
        getGlobal().teamShare ? (object.teamDoc = true) : (object.teamDoc = false);
        object.id = window.location.href.split("doc/")[1];
        object.receiverID = getGlobal().receiverID;
        object.words = wordcount(
          document
            .getElementsByClassName("editor")[0]
            .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
        );
        object.sharedWith = [...getGlobal().sharedWith, getGlobal().receiverID];
        object.shared = getMonthDayYear();
        object.rtc = getGlobal().rtc;
        object.user = loadUserData().username;
        setGlobal({
          shareFile: [...getGlobal().shareFile, object],
          sharedWith: [...getGlobal().sharedWith, getGlobal().receiverID]
        });
        setTimeout(shareDoc, 700);
      })
      .catch(error => {
        console.log(error);
        setGlobal({ loading: "", show: "hide" });
  
        const object = {};
        let content = getGlobal().content;
        object.title = getGlobal().title;
        if (getGlobal().rtc) {
          object.jsonContent = true;
        } else {
          object.jsonContent = false;
        }
        object.content = content.toJSON();
        if (getGlobal().teamShare === true) {
          object.teamDoc = true;
        }
        object.id = Date.now();
        object.receiverID = getGlobal().receiverID;
        object.words = wordcount(
          document
            .getElementsByClassName("editor")[0]
            .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
        );
        object.shared = getMonthDayYear();
        object.rtc = getGlobal().rtc;
        setGlobal({ shareFile: [...getGlobal().shareFile, object] });
        setTimeout(shareDoc, 700);
      });
  }
}

export async function shareDoc() {
  setGlobal({ loading: true })
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    const fileName = "shareddocs.json";
    const pubKey = getGlobal().pubKey;
    const file = "/mine/" + pubKey + "/" + fileName;
    const publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(getGlobal().shareFile);
    const encryptedData = await encryptContent(data, { publicKey: publicKey });
    const storageProvider = JSON.parse(localStorage.getItem("storageProvider"));
    let token;
    if(localStorage.getItem('oauthData')) {
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
    } else {
      token = "";
    }
    const params = {
      content: encryptedData,
      filePath: file,
      provider: storageProvider,
      token: token
    };

    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);

    const file2 = "/shared/" + pubKey + "/" + fileName;
    const data2 = JSON.stringify(getGlobal().shareFile);
    const encryptedData2 = await encryptContent(data2, { publicKey: getGlobal().pubKey });
    const params2 = {
      content: encryptedData2,
      filePath: file2,
      provider: 'ipfs'
    }

    let postToStorage2 = await postToStorageProvider(params2);
    console.log(postToStorage2);

    const file3 = "/" + window.location.href.split("doc/")[1].split('#')[0] + "sharedwith.json";
    const data3 = JSON.stringify(getGlobal().sharedWith);
    const encryptedData3 = await encryptContent(data3, { publicKey: publicKey });
    const params3 = {
      content: encryptedData3,
      filePath: file3,
      provider: storageProvider, 
      token: token
    }

    let postToStorage3 = await postToStorageProvider(params3);
    console.log(postToStorage3);
    setGlobal({ loading: false })
  } else {
    const fileName = "shareddocs.json";
    const pubKey = getGlobal().pubKey;
    const file = "mine/" + pubKey + "/" + fileName;
    putFile(file, JSON.stringify(getGlobal().shareFile), {
      encrypt: true
    }).catch(e => {
      console.log("e");
      console.log(e);
    });
  
    const data = getGlobal().shareFile;
    const encryptedData = JSON.stringify(
      encryptECIES(pubKey, JSON.stringify(data))
    );
    const directory = "shared/" + pubKey + fileName;
    putFile(directory, encryptedData, { encrypt: false })
      .then(() => {
        setGlobal(
          { loading: false, displayMessageSuccess: true, results: [] },
          () => {
            console.log("Success");
          }
        );
      })
      .catch(e => {
        console.log(e);
      });
    putFile(
      window.location.href.split("doc/")[1].split('#')[0] + "sharedwith.json",
      JSON.stringify(getGlobal().sharedWith),
      { encrypt: true }
    )
      .then(() => {
        if (getGlobal().teamShare === true) {
          setGlobal({ count: getGlobal().count + 1 });
          setTimeout(shareToTeam, 300);
        } else {
          handleAutoAdd();
          loadAvatars();
        }
      })
      .catch(e => {
        console.log(e);
      });
  }
}

export function shareModal() {
  setGlobal({
    shareModal: ""
  });
}

export function hideModal() {
  setGlobal({
    shareModal: "hide",
    blogModal: "hide"
  });
}

export function handleTitleChange(e) {
  setGlobal({ title: e.target.value });
  // clearTimeout(this.timeout);
  // this.timeout = setTimeout(handleAutoAdd, 1500);
}

export function handleChange(change) {
  setGlobal({
    content: change.value,
    wordCount: wordcount(
      document
        .getElementsByClassName("editor")[0]
        .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
    )
  });
  clearTimeout(timer); 
  timer = setTimeout(handleAutoAdd, 3000)
  // clearTimeout(this.timeout);
  // this.timeout = setTimeout(handleAutoAdd, 3000);
}

export function handleMDChange(event) {}

export function handleIDChange(e) {
  setGlobal({ receiverID: e.target.value });
}

export function handleBack() {
  if (getGlobal().autoSave === "Saving") {
    setTimeout(handleBack, 500);
  } else {
    window.location.replace("/documents");
  }
}

export function handleAutoAdd() {
  versionID = uuidv4();
  // this.analyticsRun('documents');
  let content = getGlobal().content;
  const object = {};
  const objectTwo = {};
  const versionObject = {};
  versionObject.createdAt = new Date();
  versionObject.id = versionID;
  object.title = getGlobal().title;
  object.content = content.toJSON();
  object.versions = [...getGlobal().versions, versionObject];
  object.compressed = false;
  object.jsonContent = true;
  getGlobal().teamDoc ? (object.teamDoc = true) : (object.teamDoc = false);
  if (window.location.href.includes("docs/")) {
    console.log("Public Doc");
    object.id = window.location.href.split("doc/")[1].includes("#")
      ? window.location.href.split("doc/")[1].split("#")[0]
      : window.location.href.split("doc/")[1];
    objectTwo.id = window.location.href.split("doc/")[1].includes("#")
      ? window.location.href.split("doc/")[1].split("#")[0]
      : window.location.href.split("doc/")[1];
  } else if (window.location.href.includes("shared/")) {
    console.log("Shared Doc");
    object.id = window.location.href.split("shared/")[1].split("/")[1].split('#')[0];
    objectTwo.id = window.location.href.split("shared/")[1].split("/")[1].split('#')[0];
  } else {
    object.id = window.location.href.split("doc/")[1].includes("#")
      ? window.location.href.split("doc/")[1].split("#")[0]
      : window.location.href.split("doc/")[1];
    objectTwo.id = window.location.href.split("doc/")[1].includes("#")
      ? window.location.href.split("doc/")[1].split("#")[0]
      : window.location.href.split("doc/")[1];
  }
  object.updated = getMonthDayYear();
  object.sharedWith = getGlobal().sharedWith;
  object.singleDocIsPublic = getGlobal().singleDocIsPublic; //true or false...
  object.readOnly = getGlobal().readOnly; //true or false...
  object.rtc = getGlobal().rtc;
  // object.author = loadUserData().username;
  object.words =
    wordcount(
      document
        .getElementsByClassName("editor")[0]
        .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
    ) || "";
  object.singleDocTags = getGlobal().singleDocTags;
  object.fileType = "documents";
  object.spacing = getGlobal().spacing;
  object.lastUpdate = Date.now();
  objectTwo.title = getGlobal().title;
  getGlobal().teamDoc ? (objectTwo.teamDoc = true) : (objectTwo.teamDoc = false);
  objectTwo.id = object.id;
  objectTwo.updated = getMonthDayYear();
  objectTwo.words = wordcount(
    document
      .getElementsByClassName("editor")[0]
      .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
  );
  objectTwo.lastUpdate = Date.now();
  objectTwo.sharedWith = getGlobal().sharedWith;
  objectTwo.rtc = getGlobal().rtc;
  objectTwo.singleDocIsPublic = getGlobal().singleDocIsPublic; //true or false...
  objectTwo.readOnly = getGlobal().readOnly; //true or false...
  // objectTwo.author = loadUserData().username;
  objectTwo.singleDocTags = getGlobal().singleDocTags;
  objectTwo.fileType = "documents";
  const index = getGlobal().index;
  console.log(getGlobal().index);
  if (getGlobal().newSharedDoc) {
    console.log("new shared doc");
    console.log(objectTwo);
    setGlobal(
      {
        versions: [...getGlobal().versions, versionObject],
        newSharedDoc: false,
        value: [...getGlobal().value, objectTwo],
        singleDoc: object,
        autoSave: "Saving..."
      },
      () => {
        setGlobal({ filteredValue: getGlobal().value }, () => {
          autoSave();
        });
        if (getGlobal().singleDocIsPublic === true) {
          //moved this conditional from handleAutoAdd, where it caused an infinite loop...
          sharePublicly(); //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
        }
      }
    );
  } else {
    console.log("not a new shared doc");
    if (index !== "" && index > -1) {
      console.log("index already set");
      console.log(getGlobal().value);
      const updatedDoc = update(getGlobal().value, {
        $splice: [[getGlobal().index, 1, objectTwo]]
      });
      setGlobal(
        {
          versions: [...getGlobal().versions, versionObject],
          value: updatedDoc,
          filteredValue: updatedDoc,
          singleDoc: object,
          autoSave: "Saving..."
        },
        () => {
          autoSave();
          if (getGlobal().singleDocIsPublic === true) {
            //moved this conditional from handleAutoAdd, where it caused an infinite loop...
            sharePublicly(); //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
          }
        }
      );
    } else {
      let value = getGlobal().value;
      console.log(value);
      const thisDoc = value.find(doc => {
        if (typeof doc.id === "string") {
          if (doc.id) {
            return (
              doc.id === window.location.href.split("shared/")[1].split("/")[1] || window.location.href.split('doc/')[1].split('#')[0]
            );
          }
        } else {
          if (doc.id) {
            return (
              doc.id.toString() ===
              window.location.href.split("shared/")[1].split("/")[1] || window.location.href.split('doc/')[1].split('#')[0]
            );
          }
        }
        return null;
      });
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //this is comparing a number to a number
      }
      setGlobal({ index: value.findIndex(findObjectIndex) }, () => {
        const updatedDoc = update(getGlobal().value, {
          $splice: [[getGlobal().index, 1, objectTwo]]
        });
        setGlobal(
          {
            versions: [...getGlobal().versions, versionObject],
            value: updatedDoc,
            filteredValue: updatedDoc,
            singleDoc: object,
            autoSave: "Saving..."
          },
          () => {
            autoSave();
            if (getGlobal().singleDocIsPublic === true) {
              //moved this conditional from handleAutoAdd, where it caused an infinite loop...
              sharePublicly(); //this will call savePublic, which will call handleAutoAdd, so we'll be calling handleAutoAdd twice, but it's at least it's not an infinite loop!
            }
          }
        );
      });
    }
  }
}

export function setVersion(id) {
  console.log("Fetching " + id);
  getFile(id + ".json", { decrypt: true })
    .then(file => {
      setGlobal({
        content: Value.fromJSON(JSON.parse(file)),
        versionModal: false
      });
    })
    .catch(error => console.log(error));
}

export async function autoSave() {
  const file = window.location.href.includes("shared/")
    ? window.location.href.split("shared/")[1].split("/")[1].split("#")[0]
    : window.location.href.split("doc/")[1].split('#')[0] || getGlobal().tempDocId;
  const fullFile = "/documents/" + file + ".json";
  if (authProvider === "uPort") {
    const publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
    const data = JSON.stringify(getGlobal().value);
    const encryptedData = await encryptContent(data, { publicKey: publicKey });
    const storageProvider = JSON.parse(localStorage.getItem("storageProvider"));
    let token;
    if(localStorage.getItem('oauthData')) {
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
    } else {
      token = "";
    }
    const params = {
      content: encryptedData,
      filePath: "/documents/index.json",
      provider: storageProvider,
      token: token, 
      update: true
    };

    let postToStorage = await postToStorageProvider(params);
    console.log(postToStorage);
    const singleData = JSON.stringify(getGlobal().singleDoc);
    const singleEncrypted = await encryptContent(singleData, {
      publicKey: publicKey
    });
    const singleParams = {
      content: singleEncrypted,
      filePath: `/documents/single/${file}.json`,
      provider: storageProvider,
      token: token, 
      update: true
    };
    let postSingle = await postToStorageProvider(singleParams);
    console.log(postSingle);
    setGlobal({ autoSave: "Saved" });
    loadDocs();
  } else if (authProvider === "blockstack") {
    putFile(fullFile, JSON.stringify(getGlobal().singleDoc), { encrypt: true })
      .then(() => {
        saveSingleDocCollection();
      })
      .catch(e => {
        console.log(e);
      });
  }
}

export function saveSingleDocCollection() {
  putFile("documentscollection.json", JSON.stringify(getGlobal().value), {
    encrypt: true
  })
    .then(() => {
      let content = getGlobal().content;
      setGlobal({ autoSave: "Saved" });
      console.log("Saving " + versionID);
      putFile(versionID + ".json", JSON.stringify(content.toJSON()), {
        encrypt: true
      }).then(() => {
        console.log("Versions saved");
        loadCollection();
      });
    })
    .catch(e => {
      console.log(e);
    });
}

export function componentDidMountData(props) {
  const thisFile = props;
  const fullFile = "/documents/" + thisFile + ".json";
  setGlobal({ documentId: props });

  getFile(props + "sharedwith.json", { decrypt: true })
    .then(fileContents => {
      if (fileContents) {
        setGlobal({ sharedWith: JSON.parse(fileContents || "{}") });
      } else {
        setGlobal({ sharedWith: [] });
      }
    })
    .catch(error => {
      console.log("shared with doc error: ");
      console.log(error);
    });

  getFile("documentscollection.json", { decrypt: true })
    .then(fileContents => {
      if (JSON.parse(fileContents).value) {
        setGlobal({ value: JSON.parse(fileContents || "{}").value });
      } else {
        setGlobal({ value: JSON.parse(fileContents || "{}") });
      }

      let value = getGlobal().value;
      const thisDoc = value.find(doc => {
        return doc.id.toString() === props;
      }); //comparing strings
      let index = thisDoc && thisDoc.id;
      console.log(index);
      function findObjectIndex(doc) {
        return doc.id === index; //comparing numbers
      }
      setGlobal({ index: value.findIndex(findObjectIndex) });
    })
    .catch(error => {
      console.log(error);
    });

  getFile(fullFile, { decrypt: true })
    .then(fileContents => {
      setGlobal({
        title: JSON.parse(fileContents || "{}").title,
        content: JSON.parse(fileContents || "{}").content,
        tags: JSON.parse(fileContents || "{}").tags,
        singleDocIsPublic: JSON.parse(fileContents || "{}").singleDocIsPublic,
        idToLoad: window.location.href.split("doc/")[1].includes("#")
          ? window.location.href.split("doc/")[1].split("#")[0]
          : window.location.href.split("doc/")[1],
        docLoaded: true
      });
    })
    .then(() => {
      let markupStr = getGlobal().content;
      if (markupStr !== "") {
        window.$(".summernote").summernote("code", markupStr);
      }
    })
    .catch(error => {
      console.log(error);
    });
}

export function handleStealthy() {
  setGlobal({ hideStealthy: !getGlobal().hideStealthy });
}

export function print() {
  window.print();
}

export function shareToTeam() {
  setGlobal({
    teamDoc: true,
    teamShare: true,
    loadingIndicator: true,
    action:
      "Shared document id " +
      window.location.href.split("doc/")[1] +
      " with team."
  });
  const { team, count } = global;
  if (team.length > count) {
    setGlobal({ auditThis: true });
    if (team[count].blockstackId !== loadUserData().username) {
      sharedInfoSingleDocRTC(team[count].blockstackId);
    } else {
      setGlobal({ count: getGlobal().count + 1 });
      setTimeout(shareToTeam, 300);
    }
  } else {
    setGlobal({ teamShare: false, loadingIndicator: false });
    window.$("#teamShare").modal("close");
    if (getGlobal().slackConnected) {
      postToSlack();
    }
    if (getGlobal().webhookConnected) {
      const object = {};
      let content = getGlobal().content;
      object.title = getGlobal().title;
      object.content = content.toJSON();
      object.words = wordcount(
        document
          .getElementsByClassName("editor")[0]
          .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
      );
      object.sharedWith = getGlobal().sharedWith;
      postToWebhook(object);
    }
    handleAutoAdd();
    loadAvatars();
  }
}

export function sendArticle() {
  setGlobal({
    sentArticles: [...getGlobal().sentArticles, getGlobal().singleDoc]
  });
  // setTimeout(saveSend, 300);
  setGlobal({ send: false });
}

export function downloadDoc(props) {
  if (props === "word") {
    var content =
      "<!DOCTYPE html>" +
      document.getElementsByClassName("editor")[0].innerHTML;
    var converted = htmlDocx.asBlob(content);
    var blob = new Blob([converted], { type: "application/msword" });
    FileSaver.saveAs(blob, getGlobal().title + ".docx");
  } else if (props === "rtf") {
    console.log("rtf");
  } else if (props === "pdf") {
    var opt = {
      margin: 1,
      filename: "mypdf.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["css"] }
    };

    html2pdf(
      '<div class="pdf" style="margin:45px;margin-bottom:20px;"}>' +
        document.getElementsByClassName("editor")[0].innerHTML +
        "</div>"
    ).set(opt);
  } else if (props === "txt") {
    window.open(
      "data:application/txt," +
        encodeURIComponent(
          document
            .getElementsByClassName("editor")[0]
            .innerHTML.replace(/<[^>]+>/g, "")
        ),
      "_self"
    );
  }
}

export function formatSpacing(props) {
  var nodes = document.getElementsByClassName("ql-editor")[0].childNodes;
  var i = 0;
  if (props === "single") {
    for (i; i < nodes.length; i++) {
      if (nodes[i].nodeName.toLowerCase() === "p") {
        nodes[i].style.lineHeight = 1;
      }
    }
    // document.getElementsByClassName('ql-editor')[0].querySelectorAll("p").style.lineHeight = 1;
    setGlobal({ spacing: 1 }, () => {
      handleAutoAdd();
    });
  } else if (props === "double") {
    for (i; i < nodes.length; i++) {
      if (nodes[i].nodeName.toLowerCase() === "p") {
        nodes[i].style.lineHeight = 2;
      }
    }
    // document.getElementsByClassName('ql-editor')[0].style.lineHeight = 2;
    setGlobal({ spacing: 2 }, () => {
      handleAutoAdd();
    });
  }
}

export function changeEditor() {
  setGlobal({ markdown: !getGlobal().markdown });
}

export function applyOperations(operations) {
  const { content } = global;
  const change = content.change().applyOperations(operations);
  handleChange(change, { remote: true });
}

export function hasMark(type) {
  const { content } = global;
  return content.activeMarks.some(mark => mark.type === type);
}

export function onKeyDown(event, change) {
  let mark;

  if (isBoldHotkey(event)) {
    mark = "bold";
  } else if (isItalicHotkey(event)) {
    mark = "italic";
  } else if (isUnderlinedHotkey(event)) {
    mark = "underlined";
  } else if (isCodeHotkey(event)) {
    mark = "code";
  } else {
    return;
  }

  event.preventDefault();
  change.toggleMark(mark);
  return true;
}

export function onClickMark(event, type) {
  event.preventDefault();
  const { content } = global;
  const change = content.change().toggleMark(type);
  handleChange(change);
}

export function doPDF() {}

//Timeline Stuff Here

export function handleTimelineTitleMediaUrl(e) {
  setGlobal({ timelineTitleMediaUrl: e.target.value });
}

export function handleTimelineTitleMediaCaption(e) {
  setGlobal({ timelineTitleMediaCaption: e.target.value });
}

export function handleTimelineTitleMediaCredit(e) {
  setGlobal({ timelineTitleMediaCredit: e.target.value });
}

export function handleTimelineTitleTextHeadline(e) {
  console.log("doing it");
  setGlobal({ timelineTitleTextHeadline: e.target.value });
}

export function handleTimelineTitleTextText(e) {
  setGlobal({ timelineTitleTextText: e.target.value });
}

export function handleTimelineEventMediaUrl(e) {
  setGlobal({ timelineEventMediaUrl: e.target.value });
}

export function handleTimelineEventMediaCaption(e) {
  setGlobal({ timelineEventMediaCaption: e.target.value });
}

export function handleTimelineEventMediaCredit(e) {
  setGlobal({ timelineEventMediaCredit: e.target.value });
}

export function handleTimelineEventStartMonth(e) {
  setGlobal({ timelineEventStartMonth: e.target.value });
}

export function handleTimelineEventStartDay(e) {
  setGlobal({ timelineEventStartDay: e.target.value });
}

export function handleTimelineEventStartYear(e) {
  setGlobal({ timelineEventStartYear: e.target.value });
}

export function handleTimelineEventTextHeadline(e) {
  setGlobal({ timelineEventTextHeadline: e.target.value });
}

export function handleTimelineEventTextText(e) {
  setGlobal({ timelineEventTextText: e.target.value });
}

export function handleUpdateTimelineTitle() {
  const object = {};
  const media = {};
  const text = {};
  media.url = getGlobal().timelineTitleMediaUrl;
  media.caption = getGlobal().timelineTitleMediaCaption;
  media.credit = getGlobal().timelineTitleMediaCredit;
  text.headline = getGlobal().timelineTitleTextHeadline;
  text.text = getGlobal().timelineTitleTextText;
  object.media = media;
  object.text = text;
  setGlobal({ timelineTitle: object }, () => {
    const timelineObj = {};
    timelineObj.title = getGlobal().timelineTitle;
    timelineObj.events = getGlobal().timelineEvents;
    setGlobal({ myTimeline: timelineObj });
  });
}

export function handleAddNewTimelineEvent() {
  const object = {};
  const media = {};
  const start_date = {};
  const text = {};
  media.url = getGlobal().timelineEventMediaUrl;
  media.caption = getGlobal().timelineEventMediaCaption;
  media.credit = getGlobal().timelineEventMediaCredit;
  start_date.month = getGlobal().timelineEventStartMonth;
  start_date.day = getGlobal().timelineEventStartDay;
  start_date.year = getGlobal().timelineEventStartYear;
  text.headline = getGlobal().timelineEventTextHeadline;
  text.text = getGlobal().timelineEventTextText;
  object.media = media;
  object.start_date = start_date;
  object.text = text;
  object.unique_id = Date.now();
  setGlobal(
    { timelineEvents: [...getGlobal().timelineEvents, object] },
    () => {
      const timelineObj = {};
      timelineObj.title = getGlobal().timelineTitle;
      timelineObj.events = getGlobal().timelineEvents;
      setGlobal({ myTimeline: timelineObj });
    }
  );
}

export async function handleTimelineSave() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  const object = {};
  object.title = getGlobal().timelineTitle;
  object.events = getGlobal().timelineEvents;
  setGlobal({ myTimeline: object }, async () => {
    if(authProvider === 'uPort') {
      let timelineFile =
      `/timelines/ + ${window.location.href.split("doc/")[1].split('#')[0]}.json`;
      const publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
      const data = JSON.stringify(getGlobal().myTimeline);
      const encryptedData = await encryptContent(data, { publicKey: publicKey });
      const storageProvider = JSON.parse(localStorage.getItem("storageProvider"));
      let token;
      if(localStorage.getItem('oauthData')) {
        if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
          token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
        } else {
          token = JSON.parse(localStorage.getItem('oauthData'))
        }
      } else {
        token = "";
      }
      const params = {
        content: encryptedData,
        filePath: timelineFile,
        provider: storageProvider,
        token: token
      };

      let postToStorage = await postToStorageProvider(params);
      console.log(postToStorage);
    } else {
      let timelineFile =
      `timelines/ + ${window.location.href.split("doc/")[1].split('#')[0]}.json`;
    putFile(timelineFile, JSON.stringify(getGlobal().myTimeline), {
      encrypt: true
    }).then(() => console.log("Timeline saved!"));
    }
  });
}

export function handleDeleteTimelineEvent(id) {
  let events = getGlobal().timelineEvents;
  console.log(events);
  let index = events.findIndex(a => a.unique_id === id);
  if (index > -1) {
    events.splice(index, 1);
  }
  setGlobal({ timelineEvents: events }, () => {
    handleTimelineSave();
  });
}

//End of the Timeline Stuff
