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
          blockusignConnected: JSON.parse(fileContents || '{}').blockusignConnected,
          coinsConnected: JSON.parse(fileContents || '{}').coinsConnected,
          kanstackConnected: JSON.parse(fileContents || '{}').kanstackConnected,
          noteRiotConnected: JSON.parse(fileContents || '{}').noteRiotConnected,
          mediumConnected: JSON.parse(fileContents || '{}').mediumConnected,
          slackConnected: JSON.parse(fileContents || '{}').slackConnected,
          webhookConnected: JSON.parse(fileContents || '{}').webhookConnected
        })
      } else {
        this.setState({
          stealthyConnected: false,
          blockusignConnected: false,
          coinsConnected: false,
          kanstackConnected: false,
          noteRiotConnected: false,
        })
      }
    })
    .then(() => {
      this.loadAccountPlan()
    })
    .then(() => {
      if(window.location.href.includes("medium")) {
        const object = {};
        object.integration = window.location.pathname.split('/')[2];
        object.state = window.location.href.split('=')[1];
        object.code = window.location.href.split('=')[2];
        this.connectMedium(object.code);
      } else if (window.location.href.includes('slack')) {
        this.connectSlack(window.location.href.split('=')[1].split('&')[0]);
      } else if(window.location.href.includes('gdocs')) {
        this.connectGoogleDocs(window.location.href.split('=')[2].split('&')[0]);
      }
    })
    .catch(error => {
      console.log(error);
    })
}

export function saveIntegrations() {
  const object = {};
  object.stealthyConnected = this.state.stealthyConnected;
  object.blockusignConnected = this.state.blockusignConnected;
  object.coinsConnected = this.state.coinsConnected;
  object.kanstackConnected = this.state.kanstackConnected;
  object.noteRiotConnected = this.state.noteRiotConnected;
  object.mediumConnected = this.state.mediumConnected;
  object.slackConnected = this.state.slackConnected;
  object.webhookConnected = this.state.webhookConnected;
  this.setState({ integrations: object });
  setTimeout(this.updateIntegrations, 300);
}

export function updateIntegrations() {
  putFile('integrations.json', JSON.stringify(this.state.integrations), {encrypt: true})
    .then(() => {
      if(window.location.href.includes('medium') || window.location.href.includes('slack')) {
        window.location.replace('/integrations');
      } else {
        this.loadIntegrations();
      }
    })
    .catch(error => {
      console.log(error);
    })
}

//Individual Integrations

export function disconnectStealthy() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://www.stealthy.im'];
      // this.setState({ stealthyConnected: false });
  })
  .then(() => {
    this.loadStealthyKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function disconnectCoins() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://use.coinsapp.co'];
      this.setState({ coinsConnected: false });
  })
  .then(() => {
    this.loadCoinsKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function disconnectBlockusign() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://blockusign.co'];
      this.setState({ blockusignConnected: false });
  })
  .then(() => {
    this.loadBlockusignKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function disconnectNoteRiot() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://note.riot.ai'];
      this.setState({ noteRiotConnected: false });
  })
  .then(() => {
    this.loadNoteRiotKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function disconnectKanstack() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://kanstack.com/'];
      this.setState({ kanstackConnected: false });
  })
  .then(() => {
    this.loadKanstackKeyDisconnect();
  })
  .catch((error) => {
    console.log(error)
  })
}

export function loadStealthyKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      stealthyKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], stealthyConnected: false });
    setTimeout(this.saveStealthyIntegration, 300)
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadCoinsKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      coinsKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], coinsConnected: false });
    setTimeout(this.saveCoinsIntegration, 300)
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadNoteRiotKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      noteRiotKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], noteRiotConnected: false });
    setTimeout(this.saveNoteRiotIntegration, 300)
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadBlockusignKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      blockusignKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], blockusignConnected: false });
    setTimeout(this.saveBlockusignIntegration, 300)
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadKanstackKeyDisconnect() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      kanstackKey: response.data,
    })
  })
  .then(() => {
    this.setState({ docs: [], kanstackConnected: false });
    setTimeout(this.saveKanstackIntegration, 300)
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

export function connectBlockusign() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://blockusign.co'];
      if(!url) {
        window.Materialize.toast('Blockusign public key not found', 4000);
      }
      this.loadBlockusignKey();
  })
  .catch((error) => {
    console.log(error)
    window.Materialize.toast('Blockusign public key not found', 4000);
  })
}

export function connectCoins() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://use.coinsapp.co'];
      if(!url) {
        window.Materialize.toast('Coins public key not found', 4000);
      }
      this.loadCoinsKey();
  })
  .catch((error) => {
    console.log(error)
    window.Materialize.toast('Coins public key not found', 4000);
  })
}

export function connectNoteRiot() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://note.riot.ai'];
      if(!url) {
        window.Materialize.toast('Note Riot public key not found', 4000);
      }
      this.loadNoteRiotKey();
  })
  .catch((error) => {
    console.log(error)
    window.Materialize.toast('Note Riot public key not found', 4000);
  })
}

export function connectKanstack() {
  lookupProfile(loadUserData().username, "https://core.blockstack.org/v1/names")
  .then((profile) => {
      url = profile.apps['https://kanstack.com'];
      if(!url) {
        window.Materialize.toast('Kanstack public key not found', 4000);
      }
      this.loadKanstackKey();
  })
  .catch((error) => {
    console.log(error)
    window.Materialize.toast('Kanstack public key not found', 4000);
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

export function loadBlockusignKey() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      blockusignKey: response.data,
      blockusignConnected: true
    })
  })
  .then(() => {
    this.loadSharedDocs();
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadNoteRiotKey() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      noteRiotKey: response.data,
      noteRiotConnected: true
    })
  })
  .then(() => {
    this.loadSharedDocs();
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadKanstackKey() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      kanstackKey: response.data,
      kanstackConnected: true
    })
  })
  .then(() => {
    this.loadSharedDocs();
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadCoinsKey() {
  axios.get(url + 'pk.txt')
  .then((response) => {
    this.setState({
      coinsKey: response.data,
      coinsConnected: true
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
      this.saveStealthyIntegration();
    })
    // .then(() => {
    //   this.saveCoinsIntegration();
    // })
    .catch(error => {
      console.log(error);
    });
}

  export function saveStealthyIntegration() {
    console.log("saving stealthy")
    const data = this.state.docs;
    console.log(data);
    console.log(this.state.stealthyKey);
    const publicKey = this.state.stealthyKey;
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

export function saveBlockusignIntegration() {
  const data = this.state.docs;
  const publicKey = this.state.blockusignKey;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const fileName = 'blockusignIndex.json';
  putFile(fileName, encryptedData, {encrypt: false})
  .then(() => {
    if(window.location.pathname === "/integrations") {
      window.Materialize.toast('Blockusign integration updated', 4000);
      this.saveIntegrations();
    }
  })
  .catch(e => {
    console.log(e);
  });
}

export function saveCoinsIntegration() {
  const data = this.state.docs;
  const publicKey = this.state.coinsKey;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const fileName = 'coinsIndex.json';
  putFile(fileName, encryptedData, {encrypt: false})
  .then(() => {
    if(window.location.pathname === "/integrations") {
      window.Materialize.toast('Coins integration updated', 4000);
      this.saveIntegrations();
    }
  })
  .catch(e => {
    console.log(e);
  });
}

export function saveNoteRiotIntegration() {
  const data = this.state.docs;
  const publicKey = this.state.noteRiotKey;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const fileName = 'noteRiotIndex.json';
  putFile(fileName, encryptedData, {encrypt: false})
  .then(() => {
    if(window.location.pathname === "/integrations") {
      window.Materialize.toast('Note Riote integration updated', 4000);
      this.saveIntegrations();
    }
  })
  .catch(e => {
    console.log(e);
  });
}

export function saveKanstackIntegration() {
  const data = this.state.docs;
  const publicKey = this.state.kanstackKey;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const fileName = 'kanstackIndex.json';
  putFile(fileName, encryptedData, {encrypt: false})
  .then(() => {
    if(window.location.pathname === "/integrations") {
      window.Materialize.toast('Kanstack integration updated', 4000);
      this.saveIntegrations();
    }
  })
  .catch(e => {
    console.log(e);
  });
}
