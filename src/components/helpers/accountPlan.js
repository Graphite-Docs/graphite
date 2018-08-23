import {
  putFile,
  getFile,
  loadUserData
} from 'blockstack';
import axios from 'axios';
const object = {};
const teamObject = {};

export function savePlan(props) {
  axios.get('http://worldclockapi.com/api/json/est/now')
    .then((response) => {
      console.log(props);
      teamObject.name = this.state.ownerName || loadUserData().username;
      teamObject.role = "Owner";
      teamObject.email = props.email;
      teamObject.blockstackId = loadUserData().username;
      object.accountOwner = loadUserData().username;
      object.planType = props.planType;
      object.lastPaymentDate = response.data.currentDateTime;
      object.graphitePro = true;
      object.lastUpdated = response.data.currentDateTime;
      object.team = [...this.state.team, teamObject];
      object.audits = [];
    })
    .then(() => {
      console.log(object);
      this.savePlanFile();
    })
    .catch(error => {
      console.log(error)
    })
}

export function accountDetails() {
  console.log(this.state.audits);
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
  putFile('accountPlan.json', JSON.stringify(object), {encrypt: true})
    .then(() => {
      if(window.location.pathname === '/success') {
        window.location.replace('/');
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
  getFile('accountPlan.json', {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({
          accountOwner: JSON.parse(fileContents || '{}').accountOwner,
          planType: JSON.parse(fileContents || '{}').planType,
          lastPaymentDate: JSON.parse(fileContents || '{}').lastPaymentDate,
          team: JSON.parse(fileContents || '{}').team,
          graphitePro: JSON.parse(fileContents || '{}').graphitePro,
          lastUpdated: JSON.parse(fileContents || '{}').lastUpdated,
          audits: JSON.parse(fileContents || '{}').audits,
          loadingBar: "hide",
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
    })
}

export function testingDeleteAll() {
  putFile('accountPlan.json', JSON.stringify({}), {encrypt: true})
    .catch(error => {
      console.log(error);
    })
}
