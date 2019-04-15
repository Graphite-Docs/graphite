import { fetchData } from '../../shared/helpers/fetch';
import { getGlobal, setGlobal } from 'reactn';
import { Value } from 'slate';

const blockstack = require('blockstack');

export async function loadSharedDoc() {
    const { userSession } = getGlobal();
    const userToLoadFrom = window.location.href.split('&user=')[1].split("&")[0];
    const docId = window.location.href.split('&id=')[1];
    const fileString = 'shareddocs.json';
    const file = blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey) + fileString;
    const privateKey = userSession.loadUserData().appPrivateKey;

    const directory = `shared/${file}`;
    const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    
    let params = {
        fileName: directory, 
        options
    }

    let sharedCollection = await fetchData(params);
    let decryptedContent = JSON.parse(userSession.decryptContent(sharedCollection, {privateKey: privateKey}));
    let sharedDocs = decryptedContent;
    let thisDoc = sharedDocs.filter(a => a.id === docId)[0];
    console.log(thisDoc)
    if(thisDoc) {
        setGlobal({
            sharedDoc: thisDoc, 
            title: thisDoc.title, 
            
        })
        if(thisDoc.readOnly) {
            setGlobal({
                content: thisDoc.content
            })
        } else {
            setGlobal({
                content: Value.fromJSON(thisDoc.content), 
                rtc: true
            })
        }
        setGlobal({ loading: false });
    } else {
        setGlobal({
            sharedDoc: {}, 
            title: "Error",
            content: "", 
            loading: false
        })
    }
    //     userSession.getFile(directory, options)
    //   .then((fileContents) => {
    //       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
    //       setGlobal({ sharedFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
    //         let docs = JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents)));
    //         const thisDoc = docs.find((doc) => {
    //           if(doc.id){
    //             return doc.id.toString() === window.location.href.split('shared/')[1].split('/')[1].split('#')[0]
    //           }
    //           return null
    //         });
    //         if(thisDoc && thisDoc.rtc) {
    //           console.log("real-time")
    //           if(thisDoc && thisDoc.jsonContent) {
    //             let content = thisDoc && thisDoc.content;
    //             setGlobal({
    //               content: Value.fromJSON(content),
    //               title: thisDoc && thisDoc.title,
    //               newSharedDoc: true,
    //               rtc: thisDoc && thisDoc.rtc,
    //               docLoaded: true,
    //               idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               teamDoc: thisDoc && thisDoc.teamDoc,
    //               sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user], 
    //               loading: false
    //             })
    //         } else {
    //           if(thisDoc && thisDoc.compressed) {
    //             setGlobal({
    //               content: thisDoc && html.deserialize(lzjs.decompress(thisDoc.content)),
    //               title: thisDoc && thisDoc.title,
    //               newSharedDoc: true,
    //               rtc: thisDoc && thisDoc.rtc,
    //               docLoaded: true,
    //               idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               teamDoc: thisDoc && thisDoc.teamDoc,
    //               sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
    //             })
    //           } else {
    //             setGlobal({
    //               content: thisDoc && html.deserialize(thisDoc.content),
    //               title: thisDoc && thisDoc.title,
    //               newSharedDoc: true,
    //               rtc: thisDoc && thisDoc.rtc,
    //               docLoaded: true,
    //               idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //               teamDoc: thisDoc && thisDoc.teamDoc,
    //               sharedWith: [...thisDoc && thisDoc.sharedWith, thisDoc && thisDoc.user]
    //             })
    //           }
    //         }
    //       } else {
    //         console.log("static")
    //         setGlobal({
    //           content: thisDoc && thisDoc.content,
    //           fullContent: thisDoc && thisDoc.fullContent,
    //           title: thisDoc && thisDoc.title,
    //           newSharedDoc: true,
    //           rtc: thisDoc && thisDoc.rtc,
    //           docLoaded: true,
    //           idToLoad: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //           tempDocId: window.location.href.split('shared/')[1].split('/')[1].split('#')[0],
    //           teamDoc: thisDoc && thisDoc.teamDoc,
    //           sharedWith: thisDoc && thisDoc.sharedWith
    //         })
    //       }
    //     })
    //   })
    //   .then(() => {
    //     console.log(getGlobal().index)
    //   })
    //     .catch(error => {
    //       console.log(error);
    //     });
}