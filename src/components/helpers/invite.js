import {
  getFile,
  loadUserData,
  putFile
} from 'blockstack'
import axios from 'axios';
const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES } = require('blockstack/lib/encryption');
const { decryptECIES } = require('blockstack/lib/encryption');

export function loadInviteStatus() {
    console.log("Loading Invite Status")
    getFile('inviteStatus.json', {decrypt: true})
      .then((fileContents) => {
        console.log(JSON.parse(fileContents));
        if(fileContents) {
          this.setState({
            inviteAccepted: JSON.parse(fileContents || '{}').inviteAccepted,
            accountName: JSON.parse(fileContents || '{}').accountName,
            inviter: JSON.parse(fileContents || '{}').inviter,
            ownerEmail: JSON.parse(fileContents || '{}').ownerEmail
          })
        } else {
          this.setState({
            inviteAccepted: false,
            accountName: "",
            inviter: ""
          })
        }
      })
      .then(() => {
        if(this.state.inviteAccepted === false) {
          this.loadInvite();
        } else {
          if(this.state.inviter !== "" && this.state.inviter !== undefined){
            this.loadBasicInviteInfo();
          } else {
            this.setLoadedFile();
          }
        }
      })
      .catch(error => {
        console.log(error);
      })
}

export function loadInvite() {
  console.log("loading invite")
  let mainLink = window.location.href;
  let userToLoadFrom = mainLink.split('?')[1];
  let fileRoot = mainLink.split('?')[2];
  const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile(fileRoot + '.json', options)
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
      this.setState({
        invite: JSON.parse(fileContents),
        inviterKey: JSON.parse(fileContents || '{}').inviterKey,
        inviteDate: JSON.parse(fileContents || '{}').inviteDate,
        inviter: JSON.parse(fileContents || '{}').inviter,
        accountName: JSON.parse(fileContents || '{}').accountName,
        inviteeEmail: JSON.parse(fileContents || '{}').inviteeEmail,
        inviteeBlockstackId: loadUserData().username,
        inviteeName: JSON.parse(fileContents || '{}').inviteeName,
        inviteeRole: JSON.parse(fileContents || '{}').inviteeRole,
        inviteeId: JSON.parse(fileContents || '{}').inviteeId,
        inviteeKey: getPublicKeyFromPrivate(loadUserData().appPrivateKey),
        inviterEmail: JSON.parse(fileContents || '{}').inviterEmail,
        inviteAccepted: JSON.parse(fileContents || '{}').inviteAccepted
      })
    })
    .then(() => {
      this.saveBasicInviteInfo();
    })
    .catch(error => {
      console.log(error);
    })
}

export function saveBasicInviteInfo() {
  putFile('inviter.json', JSON.stringify(this.state.inviter), {encrypt: true})
    .then(() => {
      this.setState({ loadingIndicator: false })
    })
    .catch(error => {
      console.log(error);
    })
}

export function inviteInfo() {
  getFile('inviter.json', {decrypt: true})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({ inviter: JSON.parse(fileContents || '{}')});
        setTimeout(this.loadBasicInviteInfo, 300)
      } else {
        this.setLoadedFile();
      }

    })
    .catch(error => {
      console.log(error);
    })
}

export function acceptInvite() {
  const object = {};
  object.inviteAccepted = true;
  object.inviteDate = this.state.invite.inviteDate;
  object.inviter = this.state.invite.inviter;
  object.inviteeEmail = this.state.invite.inviteeEmail;
  object.inviteeBlockstackId = loadUserData().username;
  object.inviteeName = this.state.invite.inviteeName;
  object.inviteeRole = this.state.invite.inviteeRole;
  object.inviteeId = this.state.invite.inviteeId;
  object.inviteeKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
  this.setState({ inviteDetails: object });
  // setTimeout(this.saveToInviter, 300)

  putFile('inviteStatus.json', JSON.stringify(object), {encrypt: true})
    .then(() => {
      this.saveToInviter();
    })
    .catch(error => {
      console.log(error);
    })
}

export function saveToInviter() {
  let publicKey = this.state.inviterKey;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(this.state.inviteDetails)));
  if(this.state.inviterKey !== "" || this.state.inviterKey !== undefined) {
    putFile(this.state.inviteeId + '/inviteaccepted.json', encryptedData, {encrypt: false})
      .then(() => {
        this.sendToInviter();
      })
      .catch(error => {
        console.log(error);
      })
  } else {
    window.Materialize.toast('Error with inviter public key');
  }
}

export function sendToInviter() {
  let id = this.state.inviteeId;
  let acceptanceLink = window.location.origin + '/acceptances/?' + loadUserData().username + '?' + id;
  const object = {};
  object.from_email = "contact@graphitedocs.com";
  object.to_email = this.state.inviterEmail;
  object.subject = loadUserData().username + ' has accepted your invite';
  object.content = "<div style='text-align:center;'><div style='background:#282828;width:100%;height:auto;margin-bottom:40px;'><h3 style='color:#ffffff;'>Graphite Pro</h3></div><h3>Your invite to " + loadUserData().username + " has been accepted!</h3><p>Confirm the acceptance by clicking the below link:</p><p><a href=" + acceptanceLink + ">" + acceptanceLink + "</a></p></div>"
  this.setState({ sendToInviter: object });
  setTimeout(this.sendAcceptEmail, 300);
}

export function sendAcceptEmail() {
  axios.post("https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/accept-invite", this.state.sendToInviter)
    .then(function (response) {
      window.location.replace('/');
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function loadBasicInviteInfo() {
  console.log("Loading Basic Info");
  console.log(getPublicKeyFromPrivate(loadUserData().appPrivateKey));
  let privateKey = loadUserData().appPrivateKey;
  console.log(privateKey)
  let file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '0.json';
  const options = { username: this.state.inviter, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile(file, options)
    .then((fileContents) => {
      console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
      this.setState({
        accountInfo: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))),
        accountOwner: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountOwner,
        ownerBlockstackId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).ownerBlockstackId,
        ownerEmail: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).ownerEmail,
        accountId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountId,
        signUpDate: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).signUpDate,
        trialPeriod: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).trialPeriod,
        accountType: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountType,
        paymentDue: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).paymentDue,
        onboardingComplete: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).onboardingComplete,
        logo: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).logo,
        newDomain: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).newDomain,
        team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team || [],
        integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).integrations || [],
        lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated,
        graphitePro: true,
        adminAddress: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).adminAddress,
        authToken: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).authToken,
        privateKey: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).privateKey,
        pubKey: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).pubKey
      })
    })
    .then(() => {
      this.saveInfo();
    })
    .catch(error => {
      console.log(error);
      this.setState({ loadingIndicator: false})
    })
}

export function saveInfo() {
  this.setState({ newTeammateId: "", newTeammateName: "", newTeammateEmail: "", newTeammateRole: "" })
  let fileName = 'accountdetails.json';
  putFile(fileName, JSON.stringify(this.state.accountDetails), {encrypt: true})
    .then(() => {
      this.loadMainAccount();
    })
    .catch(error => {
      console.log(error)
    })
}
