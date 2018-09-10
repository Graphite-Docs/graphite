import {
  loadUserData,
  putFile,
  getFile
} from 'blockstack';
const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES } = require('blockstack/lib/encryption');
const { decryptECIES } = require('blockstack/lib/encryption');


export function loadAccount() {
  this.setState({ editing: false, count: 0 });
  getFile("account.json", {decrypt: true})
    .then((fileContents) => {
      if(fileContents){
        console.log(JSON.parse(fileContents || '{}'))
        this.setState({
          team: JSON.parse(fileContents || '{}').team || [],
          integrations: JSON.parse(fileContents || '{}').integrations || [],
          lastUpdated: JSON.parse(fileContents || '{}').lastUpdated
        })
      } else {
        this.setState({
          team: [],
          integrations: [],
          lastUpdated: ""
        });
      }
    })
    .then(() => {
      if(this.state.team.length < 1 || this.state.team === undefined) {
        console.log("loading invite status");
        this.loadInviteStatus();
      }
    })
    .catch(error => {
      console.log(error);
    })
}

export function checkForLatest() {
  this.setState({ checking: true });
  console.log("Polling teammates...")
      const { team, count } = this.state;
      console.log("Team length greater than count?");
      console.log(team.length > count);
      if(team.length > count) {
        let user = team[count].blockstackId;
        const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
        const privateKey = loadUserData().appPrivateKey;
        if(loadUserData().username !== user) {
          console.log('Checking file from: ' + team[count].name);
          const file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json';
          getFile(file, options)
            .then((fileContents) => {
              if(fileContents){
                console.log('Newer file? ' + JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated);
                if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated) {
                  console.log('Setting teammate with the most recent file: ' + user);
                  this.setState({
                    teamMateMostRecent: user,
                    count: this.state.count + 1
                  });
                  setTimeout(this.checkForLatest, 300);
                } else {
                  this.setState({ count: this.state.count + 1 });
                  setTimeout(this.checkForLatest, 300);
                }
              } else {
                console.log('No file found');
                this.setState({ count: this.state.count + 1 });
                setTimeout(this.checkForLatest, 300);
              }
            })
            .catch(error => {
              console.log(error);
              this.setState({ count: this.state.count + 1 });
              setTimeout(this.checkForLatest, 300);
            })
        } else {
          console.log("Teammate to be loaded is logged in user");
          this.setState({ count: this.state.count + 1 });
          setTimeout(this.checkForLatest, 300);
        }
      } else {
        if(this.state.inviter === "" || this.state.inviter === undefined) {
          let teamIds = this.state.team.map(a => a.blockstackId);
          console.log(teamIds)
          if(teamIds.includes(loadUserData().username)) {
            this.setLoadedFile();
          } else {
            this.loadInviteStatus();
          }
        } else {
          console.log("All done.")
          this.setLoadedFile();
        }
      }
}

export function setLoadedFile() {
  if(this.state.graphitePro === true) {
    this.setState({ settingsOnboarding: "hide", settingsMain: "" })
  } else {
    this.setState({settingsOnboarding: "", settingsMain: "hide" });
  }
  // const { teamMateMostRecent } = this.state;
  // this.setState({ count: 0 });
  // if(teamMateMostRecent !== "") {
  //   console.log('There is a more recent file from: ' + teamMateMostRecent);
  //   let user = teamMateMostRecent;
  //   const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
  //   const privateKey = loadUserData().appPrivateKey;
  //   const file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json';
  //   getFile(file, options)
  //     .then((fileContents) => {
  //       if(fileContents){
  //         console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
  //         this.setState({
  //           ownerBlockstackId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).ownerBlockstackId,
  //           ownerEmail: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).ownerEmail,
  //           accountId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountId,
  //           signUpDate: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).signUpDate,
  //           trialPeriod: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).trialPeriod,
  //           accountType: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountType,
  //           paymentDue: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).paymentDue,
  //           onboardingComplete: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).onboardingComplete,
  //           logo: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).logo,
  //           newDomain: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).newDomain,
  //           team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team || [],
  //           integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).integrations || [],
  //           lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated,
  //           checking: false,
  //         })
  //         setTimeout(this.saveAll, 300);
  //       } else {
  //         console.log('No file found');
  //       }
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // } else {
  //   this.setState({ checking: false })
  //   setTimeout(this.saveAll, 300)
  // }
}

export function saveToTeam() {
  const { team, count } = this.state;
    if(team.length > count) {
      let user = team[count].name;
      let pubKey = team[count].key;
      console.log('Saving to ' + user);
      if(loadUserData().username !== user) {
        if(pubKey) {
          console.log("Here's the public key: ");
          console.log(team[count].key);
          const data = this.state.accountDetails;
          const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
          const file = pubKey + '0.json';
          console.log(file);
          putFile(file, encryptedData, {encrypt: false})
            .then(() => {
              console.log("Shared encrypted file ");
              this.setState({ count: count + 1 });
              setTimeout(this.saveToTeam, 300)
            })
            .catch(error => {
              console.log(error)
            })
        } else {
          console.log("No key yet");
          this.setState({ count: count + 1 });
          setTimeout(this.saveToTeam, 300)
        }
      } else {
        console.log("Teammate is logged in user");
        this.setState({ count: count + 1 });
        setTimeout(this.saveToTeam, 300)
      }
    } else {
      console.log("Everyone synced.");
      this.setState({ count: 0, newTeammateId: "", newTeammateKey: "", newTeammateName: "", newTeammateRole: "", newTeammateEmail: "", newTeammateBlockstackId: "" });
      if(window.location.pathname.includes('acceptances')) {
          window.location.replace('/settings');
      }
    }
}

export function saveToMainAdmin() {
    const ADMIN_ADDRESS = this.state.adminAddress;
    const ADMIN_AUTH_TOKEN = this.state.authToken;

    const gaiaConfigJSON = localStorage.getItem('blockstack-gaia-hub-config')
    const gaiaConfig = JSON.parse(gaiaConfigJSON)
    gaiaConfig.address = ADMIN_ADDRESS
    gaiaConfig.token = ADMIN_AUTH_TOKEN
    localStorage.setItem('blockstack-gaia-hub-config', JSON.stringify(gaiaConfig))
    const object = {};
    object.accountOwner = this.state.accountOwner;
    object.planType = this.state.planType;
    object.graphitePro = true;
    object.lastPaymentDate = this.state.lastPaymentDate;
    object.team = this.state.team;
    object.integrations = this.state.integrations;
    object.lastUpdated = Date.now();
    object.audits = this.state.audits;
    object.teamDocs = this.state.teamDocs;
    object.adminAddress = this.state.adminAddress;
    object.adminToken = this.state.authToken;
    object.privateKey = this.state.privateKey;
    object.pubKey = this.state.pubKey;
    this.setState({accountDetails: object});
    setTimeout(this.saveMainAccount, 300)

}

export function saveAll() {
  const object = {};
  object.accountOwner = this.state.accountOwner;
  object.planType = this.state.planType;
  object.graphitePro = true;
  object.lastPaymentDate = this.state.lastPaymentDate;
  object.team = this.state.team;
  object.integrations = this.state.integrations;
  object.lastUpdated = Date.now();
  object.audits = this.state.audits;
  object.teamDocs = this.state.teamDocs;
  object.adminAddress = this.state.adminAddress;
  object.adminToken = this.state.adminToken;
  object.privateKey = this.state.privateKey;
  object.pubKey = this.state.pubKey;
  this.setState({accountDetails: object});
  setTimeout(this.saveAccount, 300)
}

export function saveMainAccount() {
  this.setState({ newTeammateId: "", newTeammateName: "", newTeammateEmail: "", newTeammateRole: "" })
  if(loadUserData().username !== this.state.accountOwner) {
    const object = {};
    object.CURRENT_ADDRESS = JSON.parse(localStorage.getItem('blockstack-gaia-hub-config')).address;
    object.CURRENT_AUTH_TOKEN = JSON.parse(localStorage.getItem('blockstack-gaia-hub-config')).token;
    this.setState({ originalConfig: object });
    const ADMIN_ADDRESS = this.state.adminAddress;
    const ADMIN_AUTH_TOKEN = this.state.adminToken;
    const gaiaConfigJSON = localStorage.getItem('blockstack-gaia-hub-config');
    const gaiaConfig = JSON.parse(gaiaConfigJSON)
    gaiaConfig.address = ADMIN_ADDRESS
    gaiaConfig.token = ADMIN_AUTH_TOKEN
    localStorage.setItem('blockstack-gaia-hub-config', JSON.stringify(gaiaConfig));
    const data = this.state.accountDetails;
    const encryptedData = JSON.stringify(encryptECIES(this.state.pubKey.data, JSON.stringify(data)));
    const file = 'accountdetailsMain.json';
    putFile(file, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Saved encrypted file ");
        if(window.location.href.includes('acceptances')) {
          this.setState({ count: 0 });
          this.saveToTeam();
        }
      })
      .then(() => {
        this.saveOriginalConfig();
      })
      .catch(error => {
        console.log(error)
      })
  } else {
    const data = this.state.accountDetails;
    const encryptedData = JSON.stringify(encryptECIES(this.state.pubKey.data, JSON.stringify(data)));
    const file = 'accountdetailsMain.json';
    putFile(file, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Saved encrypted file ");
        if(window.location.href.includes('acceptances')) {
          this.setState({ count: 0})
          this.saveToTeam();
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  // const data = this.state.accountDetails;
  // const encryptedData = JSON.stringify(encryptECIES(this.state.pubKey.data, JSON.stringify(data)));
  // const file = 'accountPlanMain.json';
  // putFile(file, encryptedData, {encrypt: false})
  //   .then(() => {
  //     console.log("Saved encrypted file ");
  //     if(window.location.href.includes('acceptances')) {
  //       this.saveToTeam();
  //     }
  //   })
  //   .catch(error => {
  //     console.log(error)
  //   })
}

export function saveOriginalConfig() {
  const data = this.state.originalConfig;
  const encryptedData = JSON.stringify(encryptECIES(this.state.pubKey.data, JSON.stringify(data)));
  const file = 'originalConfig.json';
  putFile(file, encryptedData, {encrypt: false})
    .then(() => {
      this.loadOriginalConfig()
    })
    .catch(error => {
      console.log(error);
    })
}

export function loadOriginalConfig() {
  const privateKey = this.state.privateKey.data;
  const options = { username: this.state.accountOwner, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
  getFile("originalConfig.json", options)
    .then((fileContents) => {
      const gaiaConfigJSON = localStorage.getItem('blockstack-gaia-hub-config');
      const gaiaConfig = JSON.parse(gaiaConfigJSON)
      gaiaConfig.address = JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).CURRENT_ADDRESS;
      gaiaConfig.token = JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).CURRENT_AUTH_TOKEN;
      localStorage.setItem('blockstack-gaia-hub-config', JSON.stringify(gaiaConfig));
    })
    .then(() => {
      console.log("config file reset");
      if(window.location.href.includes('acceptances')) {
        this.saveToTeam();
      }

    })
    .catch(error => {
      console.log(error);
      this.postToLog();
    })
}

export function saveAccount() {
  this.setState({ newTeammateId: "", newTeammateName: "", newTeammateEmail: "", newTeammateRole: "" })
  let fileName = 'accountdetails.json';
  putFile(fileName, JSON.stringify(this.state.accountDetails), {encrypt: true})
    .then(() => {
      this.saveMainAccount();
    })
    .catch(error => {
      console.log(error)
      this.saveMainAccount();
    })
}
