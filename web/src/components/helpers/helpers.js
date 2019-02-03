import {
  getFile, decryptContent
} from "blockstack";
import { fetchFromProvider } from './storageProviders/fetch';

const authProvider = JSON.parse(localStorage.getItem('authProvider'));

export async function loadDocs() {
  if(authProvider === 'blockstack') {
    this.setState({ loading: true });
      getFile("documentscollection.json", {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           if(JSON.parse(fileContents).value) {
             this.setState({ value: JSON.parse(fileContents).value, countFilesDone: JSON.parse(fileContents).countFilesDone, filteredValue: JSON.parse(fileContents).value });
           } else {
             this.setState({ value: JSON.parse(fileContents), countFilesDone: JSON.parse(fileContents).countFilesDone, filteredValue: JSON.parse(fileContents) });
           }
           if(JSON.parse(fileContents).countFilesDone) {
            this.setState({ countFilesDone: true });
          }  else {
            this.setState({ countFilesDone: false });
          }
        } else {
          this.setState({ value: [], filteredValue: [], countFilesDone: true });
        }
       })
        .then(() => {
          this.loadSheets();
        })
        .catch(error => {
          console.log(error);
        });
  } else if(authProvider === 'uPort') {
    //Create the params to send to the fetchFromProvider function.
    const object = {
      provider: JSON.parse(localStorage.getItem('storageProvider')),
      token: JSON.parse(localStorage.getItem('oauthData')).data.access_token,
      filePath: '/documents/index.json'
    }
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(object);
    console.log(fetchFile)
    //Load up a new file reader and convert response to JSON.
    const reader = await new FileReader();
    var blob = fetchFile.fileBlob;
    reader.onloadend = async (evt) => {
      console.log("read success");
      const thisKey = await JSON.parse(JSON.parse(localStorage.getItem('connectState'))).keypair.privateKey;
      const decryptedContent = await JSON.parse(decryptContent(JSON.parse(evt.target.result), { privateKey: thisKey }))
      this.setState({ value: decryptedContent, filteredValue: decryptedContent, countFilesDone: true })
    };
    await console.log(reader.readAsText(blob));

    //TODO: Move this somewhere else. 
    if(fetchFile.includes('error')) {
      this.setState({value: [], filteredValue: [], countFilesDone: true}, () => {
        this.loadSheets();
      })
    }

    //Now call load sheets.
    this.loadSheets();
  }
}

export function loadSheets() {
  getFile("sheetscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       if(JSON.parse(fileContents).sheets) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets, filteredSheets: this.state.sheets });
       } else {
         this.setState({ sheets: [], filteredSheets: [] });
       }
     } else {
       this.setState({ sheets: [], filteredSheets: [] });
     }
   })
    .then(() => {
      this.loadContacts();
    })
    .catch(error => {
      console.log(error);
    });
}

export function loadContacts() {
  getFile("contact.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
     } else {
       this.setState({ contacts: [] });
     }
   })
    .then(() => {
      this.loadVault();
    })
    .catch(error => {
      console.log(error);
    });
}

export function loadVault() {
  getFile("uploads.json", {decrypt: true})
   .then((fileContents) => {
     if(fileContents){
       this.setState({ files: JSON.parse(fileContents || '{}'), filteredVault: JSON.parse(fileContents || '{}') });
     }else {
       this.setState({ files: [] });
       this.setState({filteredVault: []});
     }
   })
    .then(() => {
      this.setState({ loading: false });
      this.loadIntegrations();
    })
    .catch(error => {
      console.log(error);
      this.setState({ files: [], filteredVault: [] });
    });
}

export function signInRedirect() {
  // this.setState({ loading: true });
  // handlePendingSignIn().then((userData) => {
  //   window.location = window.location.origin;
  //   this.setState({ loading: false });
  // });
}
