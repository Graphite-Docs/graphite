import {
  loadUserData,
  putFile
} from 'blockstack';
import { getMonthDayYear } from './getMonthDayYear';

import axios from 'axios';
import update from 'immutability-helper';
const uuidv4 = require('uuid/v4');
const { getPublicKeyFromPrivate } = require('blockstack');

export function handleTeammateName(e) {
  this.setState({ editing: true, newTeammateName: e.target.value });
}

export function handleTeammateId(e) {
  this.setState({ newTeammateBlockstackId: e.target.value });
}

export function handleTeammateEmail(e) {
  this.setState({ editing: true, newTeammateEmail: e.target.value });
}

export function handleTeammateRole(e) {
  this.setState({ editing: true, newTeammateRole: e.target.value });
}

export function clearNewTeammate() {
  this.setState({ editing: false, newTeammateName: "", newTeammateEmail: ""});
}

export function addTeammate() {
  if(this.state.newTeammateName !== "" && this.state.newTeammateRole !== "" && this.state.newTeammateEmail !== "") {
    let re = /\S+@\S+\.\S+/;
    if(re.test(this.state.newTeammateEmail) === true) {
      const object = {};
      object.name = this.state.newTeammateName;
      object.email = this.state.newTeammateEmail;
      object.blockstackId = this.state.newTeammateId;
      object.role = this.state.newTeammateRole;
      object.id = uuidv4();
      object.added = getMonthDayYear();
      object.key = "";
      object.inviteAccepted = false;
      object.inviteLink = 'https://app.graphitedocs.com/invites/?' + loadUserData().username + '?' + object.id;
      object.privateKey = this.state.privateKey;
      object.pubKey = this.state.pubKey;
      object.adminAddress = this.state.adminAddress;
      object.authToken = this.state.adminToken;
      object.tokenRefreshDate = this.state.tokenRefreshDate;
      this.setState({ team: [...this.state.team, object], newTeammateId: object.id, action: "Added teammate: " + this.state.newTeammateName });
      window.Materialize.toast('Teammate added', 4000);
      setTimeout(this.saveInvite, 300);
    } else {
      window.Materialize.toast('Please enter a valid email address.', 4000);
    }
  } else {
    window.Materialize.toast('Please make sure you have entered the required information.', 4000);
  }
}

export function teammateToDelete(props) {
    this.setState({ action: "Deleted teammate: " + props.name});
    let team = this.state.team;
    let result = window.$.grep(team, function(e){
      return e.id !== props.id;
    });
    this.setState({
      team: result,
    })
    window.Materialize.toast('Teammate deleted', 4000);
    this.postToLog();
    setTimeout(this.saveAll, 800);

}

export function updateTeammate(props) {
    let team = this.state.team;
    const thisMate= team.find((mate) => { return mate.id === props.id});
    let index = thisMate && thisMate.id;
    function findObjectIndex(mate) {
        return mate.id === index;
    }
    this.setState({
      teammateIndex: team.findIndex(findObjectIndex),
      newTeammateName: thisMate && thisMate.name,
      inviteAccepted: thisMate && thisMate.inviteAccepted,
      newTeammateEmail: thisMate && thisMate.email,
      inviteDate: thisMate && thisMate.added,
      newTeammateBlockstackId: thisMate && thisMate.blockstackId,
      newTeammateKey: thisMate && thisMate.key,
      newTeammateId: thisMate && thisMate.id,
      inviter: thisMate && thisMate.inviter,
      action: "Updated role for " + props.name
    });
    setTimeout(this.updateRole, 700);
}

export function updateRoleAfterConfirmation() {
  const object = {};
  const index = this.state.teammateIndex;
  object.name = this.state.newTeammateName;
  object.role = this.state.newTeammateRole;
  object.inviteAccepted = this.state.inviteAccepted;
  object.email = this.state.newTeammateEmail;
  object.added = this.state.inviteDate;
  object.blockstackId = this.state.newTeammateBlockstackId;
  object.key = this.state.newTeammateKey;
  object.id = this.state.newTeammateId;
  object.inviter = this.state.inviter;
  object.audits = this.state.audits;
  object.privateKey = this.state.privateKey;
  object.pubKey = this.state.pubKey;
  object.adminAddress = this.state.adminAddress;
  object.adminToken = this.state.adminToken;
  const updatedTeam = update(this.state.team, {$splice: [[index, 1, object]]});
  this.setState({ team: updatedTeam });
  window.Materialize.toast('Teammate updated', 4000);
  setTimeout(this.saveAll, 300);
}

export function updateRole() {
    const object = {};
    const index = this.state.teammateIndex;
    object.name = this.state.newTeammateName;
    object.role = this.state.newTeammateRole;
    object.inviteAccepted = this.state.inviteAccepted;
    object.email = this.state.newTeammateEmail;
    object.added = this.state.inviteDate;
    object.blockstackId = this.state.newTeammateBlockstackId;
    object.key = this.state.newTeammateKey;
    object.id = this.state.newTeammateId;
    object.inviter = this.state.inviter;
    object.audits = this.state.audits;
    object.privateKey = this.state.privateKey;
    object.pubKey = this.state.pubKey;
    object.adminAddress = this.state.adminAddress;
    object.adminToken = this.state.adminToken;
    const updatedTeam = update(this.state.team, {$splice: [[index, 1, object]]});
    this.setState({ team: updatedTeam });
    window.Materialize.toast('Teammate updated', 4000);
    setTimeout(this.postToLog, 300);
}

export function sendInvite() {
  this.postToLog();
  let inviteLink = window.location.origin + '/invites/?' + loadUserData().username + '?' + this.state.newTeammateId;
  const object = {};
  object.from_email = "contact@graphitedocs.com";
  object.to_email = this.state.newTeammateEmail;
  object.subject = 'Join ' + loadUserData().username + ' on Graphite Pro';
  object.name = this.state.newTeammateName;
  object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3>Graphite Pro</h3></div><h3>You've been invited to join " + loadUserData().username + "'s team!</h3><p>Accept the invite by clicking the below link:</p><br><a href=" + inviteLink + ">" + inviteLink + "</a></div>"
  if(this.state.newTeammateEmail) {
    axios.post("https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/teammate-invite", object)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
      setTimeout(this.saveAll, 500);
  } else {
    window.Materialize.toast('Since the teammate does not have an email, but sure to send the invite link.', 4000)
    setTimeout(this.saveAll, 500);
  }
}

export function saveInvite() {
  const inviteFile = {};
  inviteFile.inviter = loadUserData().username;
  inviteFile.inviterKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
  inviteFile.inviteDate = Date.now();
  let index = this.state.team.findIndex(x => x.blockstackId === loadUserData().username);
  inviteFile.inviterEmail = this.state.team[index].email;
  inviteFile.inviteeName = this.state.newTeammateName;
  inviteFile.inviteeEmail = this.state.newTeammateEmail;
  inviteFile.inviteeBlockstackId = this.state.newTeammateBlockstackId;
  inviteFile.inviteeRole = this.state.newTeammateRole;
  inviteFile.inviteeId = this.state.newTeammateId;
  inviteFile.inviteeKey = "";
  inviteFile.inviteAccepted = false;
  putFile(this.state.newTeammateId + '.json', JSON.stringify(inviteFile), {encrypt: false})
    .then(() => {
      this.sendInvite();
    })
    .catch(error => {
      console.log(error);
    })
}
