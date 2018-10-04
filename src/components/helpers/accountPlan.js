import {
  putFile,
  getFile,
  loadUserData
} from 'blockstack';
import axios from 'axios';
const object = {};
const teamObject = {};
const { decryptECIES } = require('blockstack/lib/encryption');
// const { encryptECIES } = require('blockstack/lib/encryption');
var crypto = require("crypto");
var eccrypto = require("eccrypto");

export function savePlan(props) {
    teamObject.name = this.state.ownerName || loadUserData().username;
    teamObject.role = "Owner";
    teamObject.email = props.email;
    teamObject.blockstackId = loadUserData().username;
    object.accountOwner = loadUserData().username;
    object.planType = props.planType;
    object.lastPaymentDate = new Date();
    object.graphitePro = true;
    object.lastUpdated = new Date();
    object.team = [...this.state.team, teamObject];
    object.audits = [];
    object.privateKey = crypto.randomBytes(32);
    object.pubKey = eccrypto.getPublic(object.privateKey);
    object.adminAddress = JSON.parse(localStorage.getItem('blockstack-gaia-hub-config')).address;
    object.adminToken = JSON.parse(localStorage.getItem('blockstack-gaia-hub-config')).token;
    object.tokenRefreshDate = new Date().setMonth(new Date().getMonth() + 4);

    setTimeout(this.savePlanFile, 300);
}

export function accountDetails() {
  axios.get('http://worldclockapi.com/api/json/est/now')
    .then((response) => {
      object.accountOwner = this.state.accountOwner;
      object.planType = this.state.planType;
      object.lastPaymentDate = this.state.lastPaymentDate;
      object.graphitePro = this.state.graphitePro;
      object.lastUpdated = response.data.currentDateTime;
      object.team = this.state.team;
      object.audits = this.state.audits;
    })
    .then(() => {
      this.savePlanFile();
    })
    .catch(error => {
      console.log(error)
    })
}

export function savePlanFile() {
  putFile('accountdetails.json', JSON.stringify(object), {encrypt: true})
    .then(() => {
      if(window.location.pathname === '/success') {
        window.location.replace('/settings');
      } else if(this.state.deleteDoc === true) {
        this.setState({deleteDoc: false});
        window.location.replace('/documents');
      }
    })
    .catch(error => {
      console.log(error);
    })
}

export function loadAccountPlan() {
  getFile('accountdetails.json', {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        console.log(JSON.parse(fileContents))
        this.setState({
          accountInfo: JSON.parse(fileContents),
          accountOwner: JSON.parse(fileContents || '{}').accountOwner,
          planType: JSON.parse(fileContents || '{}').planType,
          lastPaymentDate: JSON.parse(fileContents || '{}').lastPaymentDate,
          team: JSON.parse(fileContents || '{}').team,
          graphitePro: JSON.parse(fileContents || '{}').graphitePro,
          lastUpdated: JSON.parse(fileContents || '{}').lastUpdated,
          audits: JSON.parse(fileContents || '{}').audits,
          loadingBar: "hide",
          privateKey: JSON.parse(fileContents || '{}').privateKey,
          pubKey: JSON.parse(fileContents || '{}').pubKey,
          adminAddress: JSON.parse(fileContents || '{}').adminAddress,
          adminToken: JSON.parse(fileContents || '{}').adminToken,
          tokenRefreshDate: JSON.parse(fileContents || '{}').tokenRefreshDate
        })
      } else {
        this.setState({
          planType: "none",
          lastPaymentDate: "none",
          team: [],
          audits: [],
          graphitePro: false,
          lastUpdated: 0,
          loadingBar: "hide"
        })
      }
    })
    .then(() => {
      if(this.state.team === undefined) {
        this.loadInviteStatus();
      } else if(this.state.team.length < 1) {
        this.loadInviteStatus();
      } else if(this.state.team.length > 1) {
        this.loadMainAccount();
      }
    })
    .then(() => {
      if(this.state.graphitePro === true) {
        this.setState({ settingsOnboarding: "hide", settingsMain: "" })
      } else {
        this.setState({settingsOnboarding: "", settingsMain: "hide" });
      }

      if(this.state.audits === undefined || this.state.audits.length < 1) {
        this.setState({ audits: [] });
      }
    })
    .catch(error => {
      console.log('Account Plan loading error: ' + error);

      this.setState({
        planType: "none",
        lastPaymentDate: "none",
        team: [],
        audits: [],
        graphitePro: false,
        lastUpdated: 0,
        loadingBar: "hide"
      })
      // if(this.state.graphitePro === true) {
      //   this.setState({ settingsOnboarding: "hide", settingsMain: "" })
      // } else {
      //   this.setState({settingsOnboarding: "", settingsMain: "hide" });
      // }

      if(this.state.audits === undefined || this.state.audits.length < 1) {
        this.setState({ audits: [] });
      }
      this.loadInviteStatus();
    })
}

export function loadMainAccount() {
  console.log("Loading Main Account");
  const privateKey = this.state.privateKey.data;
  const options = { username: this.state.accountOwner, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile('accountdetailsMain.json', options)
     .then((fileContents) => {
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))))
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team.map(a => a.blockstackId).includes(loadUserData().username))
       if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team.map(a => a.blockstackId).includes(loadUserData().username) === false) {
         this.setState({ graphitePro: false });
       } else {
         this.setState({
           userRole: Object.values(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team.find((a) => a.blockstackId === loadUserData().username))[1],
           accountOwner: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountOwner,
           planType: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).planType,
           lastPaymentDate: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastPaymentDate,
           team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
           graphitePro: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).graphitePro,
           lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated,
           audits: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).audits,
           loadingBar: "hide",
           privateKey: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).privateKey,
           pubKey: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).pubKey,
           adminAddress: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).adminAddress,
           adminToken: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).adminToken,
           tokenRefreshDate: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).tokenRefreshDate
         })
       }

        // if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team.map(a => a.blockstackId).includes(loadUserData().username)) {
        //   this.setState({ graphitePro: false })
        // } else {
        //   this.setState({ userRole: Object.values(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team.find((a) => a.blockstackId === loadUserData().username))[1]})
        // }
  })
  .then(() => {
    if(this.state.graphitePro === true) {
      this.setState({ settingsOnboarding: "hide", settingsMain: "" })
      this.loadTeamDocs();
    } else {
      this.setState({settingsOnboarding: "", settingsMain: "hide", loadingIndicator: false });
    }

    if(this.state.audits === undefined || this.state.audits.length < 1) {
      this.setState({ audits: [] });
    }
  })
  .catch(error => {
    console.log(error);
    this.setState({settingsOnboarding: "", settingsMain: "hide", loadingIndicator: false });
  });
}

export function testingDeleteAll() {
  putFile('accountdetails.json', JSON.stringify({}), {encryot: true})
    .catch(error => {
      console.log(error);
    })

  putFile('inviter.json', JSON.stringify({}), {encrypt: true})
    .catch(error => {
      console.log(error);
    });


  putFile('inviteStatus.json', JSON.stringify({}), {encrypt: true})
    .catch(error => {
      console.log(error);
    })

  putFile("accountdetailsMain.json", JSON.stringify({}), {encrypt: false})
    .catch(error => {
      console.log(error)
    })
}
