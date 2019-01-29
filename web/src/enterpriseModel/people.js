import { getUserKey, connectToGaiaHub } from './shared';
import update from 'immutability-helper';
const blockstack = require("blockstack");
const gaiaHubUrl = 'https://hub.blockstack.org'; //This needs to be dynamic.
let scopes = [];
let rootKey;

export async function createMember(memberDetails, teamName) {
  //Need to first check if the teammate has generated a key by logging in before.
  let pubKey = await getUserKey('key.json', memberDetails.memberName);

  //Save to the central customer hub
  //This rquires a check to see who is logged in
  if(blockstack.loadUserData().username.split('.').length > 2) {
    //This is for non root users
    //First, get the appropriate config file and save it for later use.

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
            const encryptedKey = blockstack.encryptContent(file, {
              publicKey: pubKey
            });
            blockstack.putFile(`${pubKey}/${fileName}`, encryptedKey, {encrypt: false})
            rootKey = blockstack.getPublicKeyFromPrivate(JSON.parse(file));
          } else {
            alert('Error fetching key');
          }
        })
        .then(() => {
          //Post data with the root key.
          //Create an object with the new team member.
          let teamId = window.location.href.split('teams/')[1].split('/')[1];
          const memberObject = {
            name: memberDetails.memberName,
            isAdmin: memberDetails.memberRole === "admin" ? true : false,
            keyPath: teamId ? `${teamId}/${teamName}/teamKey.json` : '1/Administrators/teamKey.json' //Note: this is just specifying the path, need to make sure the key is generated still.
          };

          //Need to look up the team in the team array.
          //Find the team in the teams array and find the index.

          let teams = this.state.teams;
          let thisTeam = teams.find(x => x.id === teamId);
          // let teamIndex = teams.findIndex(x => x.id === teamId);

          //Since the Admin team isn't saved anywhere initially, need to check for its existence.
          if(teamName === "Administrators" && !thisTeam) {
            const object = {
              name: "Administrators",
              id: 1,
              teamPath: "Administrators",
              members: []
            }
            this.setState({teams: [...this.state.teams, object]}, () => {
              thisTeam = object;
              teamId = object.id;
              let teamIndex = teams.findIndex(x => x.id === teamId);

              //Update this team with the new member.
              thisTeam.members = [...thisTeam.members, memberObject]
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
          } else {
            let teamIndex = teams.findIndex(x => x.id === teamId);

            //Update this team with the new member.
            thisTeam.members = [...thisTeam.members, memberObject]
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
          }
        })
        .catch(error => console.log(error));

    } else {
      //If we're not at the root level, need to save the subfolder config
      scopes = [
        {
          scope: "putFilePrefix",
          domain: `Administrators/${teamName}`
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
          let teamId = window.location.href.split('teams/')[1].split('/')[1];

          //Create an object with the new team member.
          const object = {
            name: memberDetails.memberName,
            isAdmin: memberDetails.memberRole === "admin" ? true : false,
            keyPath: teamId ? `${teamId}/${teamName}/teamKey.json` : '1/Administrators/teamKey.json' //Note: this is just specifying the path, need to make sure the key is generated still.
          };

          //Find the team in the teams array and find the index.
          let teams = this.state.teams;
          let thisTeam = teams.find(x => x.id === teamId);
          console.log(teamName)
          //Since the Admin team isn't saved anywhere initially, need to check for its existence.
          if(teamName === "Administrators" && thisTeam === "undefined") {
            const object = {
              name: "Administrators",
              id: 1,
              teamPath: "Teams/Administrators",
              members: []
            }
            this.setState({teams: [...this.state.teams, object]}, () => {
              thisTeam = object;
              teamId = object.id;
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
          } else {
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
          }
        })
        .catch(error => console.log(error));

    }
  }
}
