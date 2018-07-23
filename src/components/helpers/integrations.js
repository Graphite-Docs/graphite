import {
  lookupProfile,
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import axios from 'axios';
const { encryptECIES } = require('blockstack/lib/encryption');
let url;

//Main Integration Functions

export function loadIntegrations() {
  getFile('integrations.json', {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({
          stealthyConnected: JSON.parse(fileContents || '{}').stealthyConnected,
          travelstackConnected: JSON.parse(fileContents || '{}').travelstackConnected
        })
      } else {
        this.setState({
          stealthyConnected: false,
          travelstackConnected: false
        })
      }
    })
}

export function saveIntegrations() {
  const object = {};
  object.stealthyConnected = this.state.stealthyConnected;
  object.travelstackConnected = this.state.travelstackConnected;
  this.setState({ integrations: object });
  setTimeout(this.updateIntegrations, 300);
}

export function updateIntegrations() {
  putFile('integrations.json', JSON.stringify(this.state.integrations), {encrypt: true})
    .catch(error => {
      console.log(error);
    })
}

//Individual Integrations

export function disconnectStealthy() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://www.stealthy.im'];
      this.loadKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function loadKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      stealthyKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], stealthyConnected: false });
    setTimeout(this.saveDocsStealthy, 300)
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function connectStealthy() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://www.stealthy.im'];
      this.loadKey();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function loadKey() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      stealthyKey: response.data,
      stealthyConnected: true
    })
  })
  .then(() => {
    this.loadSharedDocs();
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadSharedDocs() {
  getFile("documentscollection.json", {decrypt: true})
   .then((fileContents) => {
     if(JSON.parse(fileContents || '{}').value) {
       this.setState({
         docs: JSON.parse(fileContents || '{}').value
       })
     } else {
       console.log("No saved files");
     }
   })
    .then(() => {
      this.saveDocsStealthy();
    })
    .catch(error => {
      console.log(error);
    });
}

export function saveDocsStealthy() {
  const publicKey = this.state.stealthyKey;
  const data = this.state.docs;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const fileName = 'stealthyIndex.json';
  putFile(fileName, encryptedData, {encrypt: false})
  .then(() => {
    if(window.location.pathname === "/integrations") {
      window.Materialize.toast('Stealthy integration updated', 4000);
      this.saveIntegrations();
    }
  })
  .catch(e => {
    console.log(e);
  });
}
