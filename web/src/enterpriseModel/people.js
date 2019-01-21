import { getUserKey, connectToGaiaHub } from './shared';
import update from 'immutability-helper';
const blockstack = require("blockstack");
const gaiaHubUrl = 'https://hub.blockstack.org';
let scopes = [];
let rootKey;

export async function createMember(memberName, teamName) {
  //Need to first check if the teammate has generated a key by logging in before.
  let pubKey = await getUserKey(memberName);

  //Save to the central customer hub
  //This rquires a check to see who is logged in
  if(blockstack.loadUserData().username.split('.').length > 2) {
    //This is for non root users
  } else {
    //This is for the SysAdmin or manager of the root username
    //Check what team member is being added to.
    if(teamName === "Administrators") {
      //If root level, set scoped authorization appropriately
      scopes = [
        {
          scope: "putFilePrefix",
          domain: "Administrators"
        }
      ];
      const gaiaConfig = await connectToGaiaHub(
        gaiaHubUrl,
        blockstack.loadUserData().appPrivateKey,
        scopes
      );

      //Need to save the scoped authorization first.

      if (pubKey) {
        const data = gaiaConfig;
        const encryptedData = blockstack.encryptContent(JSON.stringify(data), {
          publicKey: pubKey
        });
        const folderPath = teamName;
        const file = `${folderPath}/${pubKey}.json`;
        await blockstack.putFile(file, encryptedData, { encrypt: false });
      } else {
        alert("User has not generated a key yet");
      }

      //Now, save the appropriate data using the teamKey.
      //Fetch the root key first.
      let fileName = 'keys/root/teamkey.json';
      await blockstack.getFile(fileName, {decrypt: true})
        .then((file) => {
          if(file) {
            //Check if the key has already been created.
            console.log("Root level team key found.")
            rootKey = blockstack.getPublicKeyFromPrivate(JSON.parse(file));
          } else {
            alert('Error fetching key');
          }
        })
        .then(() => {
          //Post data with the root key.
          //Need to look up the team in the team array.
          let teamId = window.location.href.split('teams/')[1];

          //Create an object with the new team member.
          const object = {
            name: memberName,
            isAdmin: false,
            keyPath: `${teamId}/teamKey.json` //Note: this is just specifying the path, need to make sure the key is generated still.
          };

          //Find the team in the teams array and find the index.
          let teams = this.state.teams;
          let thisTeam = teams.find(x => x.id === teamId);
          let teamIndex = teams.findIndex(x => x.id === teamId);

          //Update this team with the new member.
          thisTeam.members = [...thisTeam.members, object]
          const updatedTeam = update(this.state.teams, {$splice: [[teamIndex, 1, thisTeam]]});
          this.setState({
            teams: updatedTeam
          }, () => {
            //Call postData with the data and root level team key to encrypt the new team data.
            let data = this.state.teams;
            let file = "Administrators/teams.json";
            let scopesFile = "Administrators";
            this.postData(data, file, scopesFile, rootKey);
          })
        })
        .catch(error => console.log(error));

    } else {

    }
  }
}
