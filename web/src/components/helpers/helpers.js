import {
  getFile, decryptContent
} from "blockstack";
import { setGlobal, getGlobal } from 'reactn';
import { fetchFromProvider } from './storageProviders/fetch';
import { loadContactsCollection } from './contacts';
import { loadIntegrations } from './integrations'; 

export async function loadDocs() {
  console.log("loading docs...")
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(window.location.href.includes('doc/') || window.location.href.includes('shared/')) {
    //Don't do anything right now.
  } else {
    setGlobal({ loading: true })
    if(authProvider === 'blockstack') {
      setGlobal({ loading: true });
        getFile("documentscollection.json", {decrypt: true})
         .then((fileContents) => {
           if(fileContents) {
             if(JSON.parse(fileContents).value) {
               setGlobal({ value: JSON.parse(fileContents).value, countFilesDone: JSON.parse(fileContents).countFilesDone, filteredValue: JSON.parse(fileContents).value, loading: false });
             } else {
               setGlobal({ value: JSON.parse(fileContents), countFilesDone: JSON.parse(fileContents).countFilesDone, filteredValue: JSON.parse(fileContents), loading: false });
             }
             if(JSON.parse(fileContents).countFilesDone) {
              setGlobal({ countFilesDone: true });
            }  else {
              setGlobal({ countFilesDone: false });
            }
          } else {
            setGlobal({ value: [], filteredValue: [], countFilesDone: true });
          }
         })
          .then(() => {
            loadSheets();
          })
          .catch(error => {
            console.log(error);
          });
    } else if(authProvider === 'uPort') {
      const thisKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private

      //Create the params to send to the fetchFromProvider function.

      //The oauth token could be stored in two ways (for dropbox it's always a single access token)
      let token;
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
      const object = {
        provider: JSON.parse(localStorage.getItem('storageProvider')),
        token: token,
        filePath: '/documents/index.json'
      }
      // //Call fetchFromProvider and wait for response.
      let fetchFile = await fetchFromProvider(object);
      
      //Now we need to determine if the response was from indexedDB or an API call:
      if(fetchFile) {
        if(fetchFile.loadLocal) {
          console.log("Loading local instance first");
          const decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
          setGlobal({ value: decryptedContent, filteredValue: decryptedContent, countFilesDone: true, loading: false })
        } else {
          //check if there is no file to load and set state appropriately.
          if(typeof fetchFile === 'string') {
            console.log("Nothing stored locally or in storage provider.")
            if(fetchFile.includes('error')) {
              console.log("Setting state appropriately")
              setGlobal({value: [], filteredValue: [], countFilesDone: true, loading: false}, () => {
                loadSheets();
              })
            }
          } else {
            //No indexedDB data found, so we load and read from the API call.
            //Load up a new file reader and convert response to JSON.
            const reader = await new FileReader();
            var blob = fetchFile.fileBlob;
            reader.onloadend = async (evt) => {
              console.log("read success");
              const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
              setGlobal({ value: decryptedContent, filteredValue: decryptedContent, countFilesDone: true })
            };
            await console.log(reader.readAsText(blob));
          }
        }
      } else {
        setGlobal({ value: [], filteredValue: [], loading: false }) //temporarily set loading to false here.
      }
      //Now call load sheets.
      loadSheets();
    }
  }
}

export function loadSheets() {
  console.log("loading sheets...")
  const global = getGlobal();
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    loadContacts();
  } else {
    getFile("sheetscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       if(JSON.parse(fileContents).sheets) {
         setGlobal({ sheets: JSON.parse(fileContents || '{}').sheets, filteredSheets: global.sheets });
       } else {
         setGlobal({ sheets: [], filteredSheets: [] });
       }
     } else {
       setGlobal({ sheets: [], filteredSheets: [] });
     }
   })
    .then(() => {
      loadContacts();
    })
    .catch(error => {
      console.log(error);
    });
  }
}

export async function loadContacts() {
  console.log("loading contacts...")
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    await loadContactsCollection();
    loadVault();
  } else {
    getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       setGlobal({ contacts: JSON.parse(fileContents || '{}').contacts });
     } else {
       setGlobal({ contacts: [] });
     }
   })
    .then(() => {
      loadVault();
    })
    .catch(error => {
      console.log(error);
    });
  }
}

export async function loadVault() {
  const authProvider = JSON.parse(localStorage.getItem('authProvider'));
  if(authProvider === 'uPort') {
    console.log("loading vault...")
    const thisKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private

      //Create the params to send to the fetchFromProvider function.

      //The oauth token could be stored in two ways (for dropbox it's always a single access token)
      let token;
      if(typeof JSON.parse(localStorage.getItem('oauthData')) === 'object') {
        token = JSON.parse(localStorage.getItem('oauthData')).data.access_token;
      } else {
        token = JSON.parse(localStorage.getItem('oauthData'))
      }
      const object = {
        provider: JSON.parse(localStorage.getItem('storageProvider')),
        token: token,
        filePath: '/vault/index.json'
      }
      // //Call fetchFromProvider and wait for response.
      let fetchFile = await fetchFromProvider(object);
      
      //Now we need to determine if the response was from indexedDB or an API call:
      if(fetchFile) {
        if(fetchFile.loadLocal) {
          console.log("Loading local instance first");
          const decryptedContent = await JSON.parse(decryptContent(JSON.parse(fetchFile.data.content), { privateKey: thisKey }))
          setGlobal({ files: decryptedContent, filteredVault: decryptedContent, loading: false })
        } else {
          //check if there is no file to load and set state appropriately.
          if(typeof fetchFile === 'string') {
            console.log("Nothing stored locally or in storage provider.")
            if(fetchFile.includes('error')) {
              console.log("Setting state appropriately")
              setGlobal({files: [], filteredVault: [], loading: false}, () => {
                console.log("No files found");
              })
            }
          } else {
            //No indexedDB data found, so we load and read from the API call.
            //Load up a new file reader and convert response to JSON.
            const reader = await new FileReader();
            var blob = fetchFile.fileBlob;
            reader.onloadend = async (evt) => {
              console.log("read success");
              const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
              setGlobal({ files: decryptedContent, filteredVault: decryptedContent, loading: false })
            };
            await console.log(reader.readAsText(blob));
          }
        }
      } else {
        setGlobal({ files: [], filteredVault: [], loading: false }) //temporarily set loading to false here.
      }
  } else {
    getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents){
       setGlobal({ files: JSON.parse(fileContents || '{}'), filteredVault: JSON.parse(fileContents || '{}') });
     }else {
       setGlobal({ files: [] });
       setGlobal({filteredVault: []});
     }
   })
    .then(() => {
      setGlobal({ loading: false });
      loadIntegrations();
    })
    .catch(error => {
      console.log(error);
      setGlobal({ files: [], filteredVault: [] });
    });
  }
}

export function signInRedirect() {
  // setGlobal({ loading: true });
  // handlePendingSignIn().then((userData) => {
  //   window.location = window.location.origin;
  //   setGlobal({ loading: false });
  // });
}
