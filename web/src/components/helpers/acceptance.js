import {
  getFile,
  loadUserData
} from 'blockstack';
const { decryptECIES } = require('blockstack/lib/encryption');

export function confirmAcceptance() {
  let mainLink = window.location.href;
  let userToLoadFrom = mainLink.split('?')[1];
  let fileRoot = mainLink.split('?')[2];
  let privateKey = loadUserData().appPrivateKey;

  const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile(fileRoot + '/inviteaccepted.json', options)
    .then((fileContents) => {
      console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))))
      this.setState({
        newTeammateId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeId,
        newTeammateName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeName,
        newTeammateRole: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeRole,
        newTeammateEmail: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeEmail,
        newTeammateKey: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeKey,
        newTeammateBlockstackId: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteeBlockstackId,
        inviteDate: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteDate,
        inviter: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviter,
        inviteAccepted: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).inviteAccepted
      })
    })
    .then(() => {
      let team = this.state.team;
      const thisMate= team.find((mate) => { return mate.id === this.state.newTeammateId});
      let index = thisMate && thisMate.id;
      function findObjectIndex(mate) {
          return mate.id === index;
      }
      this.setState({
        teammateIndex: team.findIndex(findObjectIndex)
      });
    })
    .then(() => {
      this.updateRoleAfterConfirmation();
    })
    .catch(error => {
      console.log(error);
    })
}
