import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { getPublicKeyFromPrivate } = require('blockstack');
const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class EditorAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
        team: [],
        contacts: [],
        editorView: "",
        editorName: "",
        editorRoles: "",
        editorPermissions: "",
        editorIntegrations: "",
        editorPublish: "",
        journoView: "",
        journoName: "",
        journoRoles: "",
        journoPermissions: "",
        journoIntegrations: "",
        journoPublish: "",
        teamLength: 0,
        lastUpdated: 0,
        accountSettings: "",
        count: 0,
        file: [],
        teamMateMostRecent: "",
        pubKey: "",
        clients: [],
        deleteContact: "",
        integrationsModal: "hide",
        integrationUrl: "",
        integrationName: "",
        accountNameModal: "hide",
        accountPlanModal: "hide",
        updateTeammateModal: "hide",
        teammateModal: "hide",
        hideMain: "",
        confirmAdd: false,
        teammateName: "",
        newUserRole: "",
        updatedCheck: 0,
        mainAdminAdd: false,
        editing: false,
        confirmUpdate: false,
        deleteTeammateModal: "hide",
        index: "",
        selectedTeammate: "",
        updatedAccountName: "",
        integrations: [],
        deleteIntegration: "",
        deleteIntName: "",
        deleteIntegrationModal: "hide"
  	  },
    }
    this.combineFile = this.combineFile.bind(this);
    this.checkForLatest = this.checkForLatest.bind(this);
    this.saveToEveryone = this.saveToEveryone.bind(this);
    this.loadOther = this.loadOther.bind(this);
    this.loadMain = this.loadMain.bind(this);
    this.accountNameChange = this.accountNameChange.bind(this);
    this.addTeammate = this.addTeammate.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.delete = this.delete.bind(this);
    this.setLoadedFile = this.setLoadedFile.bind(this);
    this.updateTeammate = this.updateTeammate.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.saveToAdmin = this.saveToAdmin.bind(this);
    this.handleIntURL = this.handleIntURL.bind(this);
    this.handleIntName = this.handleIntName.bind(this);
    this.addInt = this.addInt.bind(this);
    this.deleteInt = this.deleteInt.bind(this);
  }

  componentDidUpdate() {

    if(this.state.confirmUpdate === true){
      this.updateTeammate();
    }

    if(this.state.confirmAdd === true) {
      const team = this.state.team;
      if(team.length > 0){
        let teamNames =  team.map(a => a.name);
        if(teamNames.includes(this.state.teammateName)){
          console.log("Nope");
          window.Materialize.toast('That person is already on your team.', 4000)
          this.setState({confirmAdd: false});

        } else {
          this.addTeammate();
        }
      } else {
          this.addTeammate();
      }
    }
  }

  componentDidMount() {
    //Loading Contacts List
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       let file = JSON.parse(fileContents || '{}');
       let contacts = file.contacts;
       if(contacts.length > 0) {
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         this.setState({ contacts: [] });
       }
     })
      .catch(error => {
        console.log(error);
      });
    //Setting initial state on some states for rendering
    this.setState({
      integrationsModal: "hide",
      accountNameModal: "hide",
      accountPlanModal: "hide",
      updateTeammateModal: "hide",
      teamMateMostRecent: "",
      teammateModal: "hide",
      teammateName: "",
      hideMain: "",
      count: 0,
      mainAdminAdd: true,
      editing: false,
      deleteContact: "",
      deleteTeammateModal: "hide",
      confirmUpdate: false,
      index: "",
      selectedTeammate: "",
      updatedAccountName: "",
      integrations: [],
      deleteIntegration: "",
      deleteIntegrationModal: "hide"
    });
    //Loading Main Clients List
    const user = 'admin.graphite';
    const options = { username: user, zoneFileLookupURL: 'https://core.blockstack.org/v1/names', decrypt: false}
    getFile('clientlist.json', options)
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ clients: JSON.parse(fileContents || '{}') });
          this.loadOther();
        } else {
          this.setState({ clients: [] });
          this.loadOther();
        }

      })
      .catch(error => {
        console.log(error);
      });

    }

    loadOther() {
    //Load File and set individual states
    getFile('journoFileTest.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          console.log("Found your file");
          console.log(JSON.parse(fileContents || '{}'));
          this.setState({
            team: JSON.parse(fileContents || '{}').team,
            integrations: JSON.parse(fileContents || '{}').integrations || [],
            editorView: JSON.parse(fileContents || '{}').editorView,
            editorName: JSON.parse(fileContents || '{}').editorName,
            editorRoles: JSON.parse(fileContents || '{}').editorRoles,
            editorPermissions: JSON.parse(fileContents || '{}').editorPermissions,
            editorIntegrations: JSON.parse(fileContents || '{}').editorIntegrations,
            editorPublish: JSON.parse(fileContents || '{}').editorPublish,
            journoView: JSON.parse(fileContents || '{}').journoView,
            journoName: JSON.parse(fileContents || '{}').journoName,
            journoRoles: JSON.parse(fileContents || '{}').journoRoles,
            journoPermissions: JSON.parse(fileContents || '{}').journoPermissions,
            journoIntegrations: JSON.parse(fileContents || '{}').journoIntegrations,
            journoPublish: JSON.parse(fileContents || '{}').journoPublish,
            accountSettings: JSON.parse(fileContents || '{}').accountSettings,
            lastUpdated: JSON.parse(fileContents || '{}').lastUpdated
          })
        } else {
          console.log("No file created yet");
          this.setState({
            team: [],
            integrations: [],
            editorView: false,
            editorName: false,
            editorRoles: false,
            editorPermissions: false,
            editorIntegrations: false,
            editorPublish: false,
            journoView: false,
            journoName: false,
            journoRoles: false,
            journoPermissions: false,
            journoIntegrations: false,
            journoPublish: false,
            accountSettings: "",
            lastUpdated: 0
          })
        }
      })
      .then(() => {
        if(this.state.team.length < 1) {
          console.log("loading main");
          this.loadMain();
        } else {
          console.log("combining");
          // this.combineFile();
          const object = {}
          object.team = this.state.team;
          object.integrations = this.state.integrations;
          object.lastUpdated = this.state.lastUpdated;
          if(this.state.updatedAccountName !== ""){
            object.accountSettings = this.state.updatedAccountName;
            // this.setState({ accountSettings: this.state.updatedAccountName });
          } else {
            object.accountSettings = this.state.accountSettings;
          }
          object.editorView = this.state.editorView;
          object.editorName = this.state.editorName;
          object.editorRoles = this.state.editorRoles;
          object.editorPermissions = this.state.editorPermissions;
          object.editorIntegrations = this.state.editorIntegrations;
          object.editorPublish = this.state.editorPublish;
          object.journoView = this.state.journoView;
          object.journoName = this.state.journoName;
          object.journoRoles = this.state.journoRoles;
          object.journoPermissions = this.state.journoPermissions;
          object.journoIntegrations = this.state.journoIntegrations;
          object.journoPublish = this.state.journoPublish;
          this.setState({ file: object})
        }
      })
      .then(() => {
        this.checkForLatest();
      })
      .catch(error => {
        console.log(error)
      })
      // this.refresh = setInterval(() => this.checkForLatest(), 10000);
      setTimeout(this.checkForLatest, 10000);
  }

  combineFile() {
    console.log("Starting the saving process...")
    this.setState({ hideMain: "", updateTeammateModal: "hide", teammateName: "", newUserRole: "" });
    //Take loaded states and combine them into a single file
    const object = {}
    object.team = this.state.team;
    object.integrations = this.state.integrations;
    object.lastUpdated = this.state.lastUpdated;
    if(this.state.updatedAccountName !== ""){
      object.accountSettings = this.state.updatedAccountName;
      this.setState({ accountSettings: this.state.updatedAccountName });
    } else {
      object.accountSettings = this.state.accountSettings;
    }
    object.editorView = this.state.editorView;
    object.editorName = this.state.editorName;
    object.editorRoles = this.state.editorRoles;
    object.editorPermissions = this.state.editorPermissions;
    object.editorIntegrations = this.state.editorIntegrations;
    object.editorPublish = this.state.editorPublish;
    object.journoView = this.state.journoView;
    object.journoName = this.state.journoName;
    object.journoRoles = this.state.journoRoles;
    object.journoPermissions = this.state.journoPermissions;
    object.journoIntegrations = this.state.journoIntegrations;
    object.journoPublish = this.state.journoPublish;
    this.setState({ file: object})
    //Start the process to check for the latest file among team members
    setTimeout(this.saveFile, 300);
    this.setState({ editing: false})
    console.log("Here's what's being saved: ");
    console.log(this.state.file);
  }

  loadMain() {
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const options = {username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
    const privateKey = loadUserData().appPrivateKey;
    getFile(getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json', options)
     .then((fileContents) => {
       if(fileContents) {
         console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
         this.setState({
           team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
           integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
           editorView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorView,
           editorName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorName,
           editorRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorRoles,
           editorPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPermissions,
           editorIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorIntegrations,
           editorPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPublish,
           journoView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoView,
           journoName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoName,
           journoRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoRoles,
           journoPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPermissions,
           journoIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoIntegrations,
           journoPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPublish,
           accountSettings: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountSettings,
           lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated
         })
       } else {
         this.setState({
           team: [],
           integrations: [],
           editorView: false,
           editorRoles: false,
           editorPermissions: false,
           editorIntegrations: false,
           editorPublish: false,
           journoView: false,
           journoRoles: false,
           journoPermissions: false,
           journoIntegrations: false,
           journoPublish: false,
           accountSettings: "",
           lastUpdated: 0
         })
       }
     })
      .then(() => {
        this.combineFile();
      })
      .catch(error => {
        this.combineFile();
        console.log(error);
      });
  }

  checkForLatest() {

    console.log("Polling teammates...")
    if(this.state.editing === false) {
      const { teamMateMostRecent, team, count } = this.state;
      console.log("Team length:");
      console.log(team.length);
      console.log("Current count:");
      console.log(count);
      console.log("Team length greater than count?");
      console.log(team.length > count);
      if(team.length > count) {
        let user = team[count].name;
        const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
        const privateKey = loadUserData().appPrivateKey;

        if(loadUserData().username !== user) {
          console.log("File name to load: ");
          console.log(getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json');
          console.log("Loading from: ");
          console.log(team[count].name);
          const file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json';
          getFile(file, options)
            .then((fileContents) => {
              if(fileContents){
                console.log('file loaded number ' + count);
                console.log("Last Updated: ");
                console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated);
                console.log("Compared to my last updated: ");
                console.log(this.state.lastUpdated);
                console.log("Teammate's file newer?");
                console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated + '>' + this.state.lastUpdated)
                console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated);
                if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated) {
                  console.log("Setting teammate with the most recent file: ");
                  console.log(user);
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
        const userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
        const options = { username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
        const file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json';
        const { teamMateMostRecent, team, count } = this.state;
        const privateKey = loadUserData().appPrivateKey;

        getFile(file, options)
          .then((fileContents) => {
            if(fileContents) {
              console.log("Loading root user's file");
              console.log("Last Updated: ");
              console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated);
              console.log("Compared to my last updated: ");
              console.log(this.state.lastUpdated);
              console.log("Root user's file newer?");
              console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated);

              if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated > this.state.lastUpdated) {
                console.log("Setting root user with the most recent file: ");
                console.log(userRoot);
                this.setState({
                  teamMateMostRecent: userRoot,
                });
                setTimeout(this.setLoadedFile, 300);
              } else {
                console.log("Not newer");
                setTimeout(this.setLoadedFile, 300);
              }
            } else {
              console.log("File not found");
              setTimeout(this.setLoadedFile, 300);
            }
          })
          .catch(error => {
            console.log(error);
            setTimeout(this.setLoadedFile, 300);
          })
      }
    } else {
      setTimeout(this.checkForLatest, 10000);
    }
  }

  setLoadedFile() {
    const { teamMateMostRecent, team, count } = this.state;
    console.log("No more teammates");
    this.setState({ count: 0 });
    console.log(teamMateMostRecent !== "");
    if(teamMateMostRecent !== "") {
      console.log("There is a more recent file from: ");
      console.log(teamMateMostRecent);
      let user = teamMateMostRecent;
      const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
      const privateKey = loadUserData().appPrivateKey;
      const file = getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json';
      getFile(file, options)
        .then((fileContents) => {
          if(fileContents){
            console.log("Loading file from: ");
            console.log(teamMateMostRecent);
            this.setState({
              team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
              integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).integrations,
              editorView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorView,
              editorName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorName,
              editorRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorRoles,
              editorPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPermissions,
              editorIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorIntegrations,
              editorPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPublish,
              journoView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoView,
              journoName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoName,
              journoRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoRoles,
              journoPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPermissions,
              journoIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoIntegrations,
              journoPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPublish,
              accountSettings: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountSettings,
              lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated
            })
            setTimeout(this.combineFile, 300);
          } else {
            console.log('No file found');
          }
        })
        .then(() => {
          console.log("All done!")
          setTimeout(this.checkForLatest, 10000);
        })
        .catch(error => {
          console.log(error);
        })
    } else {
      setTimeout(this.checkForLatest, 10000);
    }
  }

  saveFile() {
    console.log("Saving logged in user's file")
    this.setState({count: 0, updatedAccountName: "" });
    putFile('journoFileTest.json', JSON.stringify(this.state.file), {encrypt: true})
      .then(() => {
        console.log("file saved");
        this.setState({
          integrationsModal: "hide",
          accountNameModal: "hide",
          accountPlanModal: "hide",
          updateTeammateModal: "hide",
          teammateModal: "hide"
        });
        //Since this method will be reused for all saves made by the logged in user, it's helpful to always save to the other team members, so we start by loading their public keys
        this.saveToEveryone();
      })
      .catch(error => {
        console.log(error);
      })
  }

  saveToEveryone() {
    const { teamMateMostRecent, team, count } = this.state;
    if(team.length > count) {
      let user = team[count].name;
      let pubKey = team[count].key;
      console.log('Saving to ' + user);
      if(loadUserData().username !== user) {
        // const publicKey = this.state.pubKey;
        console.log("Here's the public key: ");
        console.log(team[count]);
        const data = this.state.file;
        const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
        const file = pubKey + '.json';
        console.log(file);
        putFile(file, encryptedData, {encrypt: false})
          .then(() => {
            console.log("Shared encrypted file ");
            this.setState({ count: count + 1 });
            setTimeout(this.saveToEveryone, 300)
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        console.log("Teammate is logged in user");
        this.setState({ count: count + 1 });
        setTimeout(this.saveToEveryone, 300)
      }
    } else {
      console.log("Loading main admin's pubKey");
      const user = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
      const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      getFile('key.json', options)
        .then((fileContents) => {
          if(fileContents) {
            this.setState({ pubKey: JSON.parse(fileContents || '{}')});
          } else {
            console.log("No key for main admin")
          }
        })
        .then(() => {
          this.setState({ count: 0 });
          this.saveToAdmin();
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  saveToAdmin() {
    console.log("Saving to main admin");
    console.log("Here's the public key: ");
    const pubKey = this.state.pubKey;
    console.log(pubKey);
    const data = this.state.file;
    const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
    const file = this.state.pubKey + '.json';
    console.log(file);
    putFile(file, encryptedData, {encrypt: false})
      .then(() => {
        console.log("Shared encrypted file to main admin");
        console.log("No more teammates");
        this.setState({ editing: false, count: 0})
      })
      .catch(error => {
        console.log(error);
        this.setState({ editing: false, count: 0})
      })
  }

  //Account Setting (Org Name)

  accountNameChange(e) {
    this.setState({ editing: true });
    this.setState({ updatedAccountName: e.target.value });
    this.setState({ lastUpdated: Date.now()});
  }

  //Team management
  addTeammate() {
    this.setState({ editing: true });
    this.setState({confirmAdd: false, hideMain: "", teammateModal: "hide" });
    const options = { username: this.state.teammateName, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    const file = 'key.json';
    getFile('key.json', options)
      .then((fileContents) => {
        console.log("Loading public key");
        if(fileContents) {
          this.setState({ pubKey: JSON.parse(fileContents || '{}') })
        } else {
          console.log("No key found");
          this.setState({ pubKey: "" });
        }
      })
      .then(() => {
        if(this.state.pubKey !== "") {
          const object = {};
          object.name = this.state.teammateName;
          object.role = this.state.newUserRole;
          object.added = getMonthDayYear();
          object.key = this.state.pubKey;
          this.setState({ team: [...this.state.team, object], lastUpdated: Date.now() });
          setTimeout(this.combineFile, 300);
        } else {
          window.Materialize.toast('This person must log into Graphite at least once before you can add them.', 4000)
          this.setState({ teammateName: "", newUserRole: "", teammateModal: "hide", editing: false})
        }

      })
      .catch(error => {
        console.log("Nope")
        console.log(error);
        window.Materialize.toast('This person must log into Graphite at least once before you can add them.', 4000)
        this.setState({ teammateName: "", newUserRole: "", teammateModal: "hide", editing: false})
      })
  }

  delete() {
    let deleteName = this.state.deleteContact;
    let team = this.state.team;
    let result = window.$.grep(team, function(e){
      return e.name != deleteName;
    });
    // window.$.each(team, function(i){
    //   if(team[i].name === deleteName) {
    //     console.log(team[i].name)
    //       team.splice(i,1);
    //
    //       let array = [];
    //       array = team;
    //       console.log(array);
    //       this.setState({ team: array, lastUpdated: Date.now()})
    //       // return false;
    //   }
    // }.bind(this));
    this.setState({
      team: result,
      lastUpdated: Date.now(),
      deleteTeammateModal: "hide",
      deleteContact: ""
    })
    setTimeout(this.combineFile, 300);
  }

  updateTeammate() {
    this.setState({confirmUpdate: false})
    let team = this.state.team;
    const thisMate= team.find((mate) => { return mate.name == this.state.selectedTeammate});
    let index = thisMate && thisMate.name;
    function findObjectIndex(mate) {
        return mate.name == index;
    }
    this.setState({index: team.findIndex(findObjectIndex)});
    setTimeout(this.updateRole, 500);
  }

  updateRole() {
    const object = {};
    const index = this.state.index;
    object.name = this.state.selectedTeammate;
    object.role = this.state.newUserRole;
    object.added = getMonthDayYear();
    object.key = this.state.team[index].key;

    const updatedTeam = update(this.state.team, {$splice: [[index, 1, object]]});
    this.setState({ team: updatedTeam, lastUpdated: Date.now() });
    setTimeout(this.combineFile, 300);
  }

  //Integrations
  handleIntURL(e) {
    this.setState({ integrationURL: e.target.value})
  }

  handleIntName(e) {
    this.setState({ integrationName: e.target.value})
  }

  addInt() {
    console.log("Integrations: ");
    console.log(this.state.integrations);
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.id = Date.now();
    object.name = this.state.integrationName;
    object.url = this.state.integrationURL;
    object.added = month + '/' + day + '/' + year;
    this.setState({integrations: [...this.state.integrations, object], lastUpdated: Date.now()})
    setTimeout(this.combineFile, 300);
  }

  deleteInt() {
    let deleteId = this.state.deleteIntegration;
    let integrations = this.state.integrations;
    window.$.each(integrations, function(i){
      if(integrations[i].id === deleteId) {
          integrations.splice(i,1);

          let array = [];
          array = integrations;
          this.setState({ integrations: array, lastUpdated: Date.now()})
          // return false;
      }
    }.bind(this));
    this.setState({
      deleteIntegrationModal: "hide",
      deleteIntegration: "",
    })
    setTimeout(this.combineFile, 300);
  }

  renderView() {
    console.log(this.state.team);
    const user = loadUserData().username;
    const { deleteIntegrationModal, deleteTeammateModal, integrationsModal, integrations, clients, accountNameModal, accountPlanModal, journoView, journoName, journoRoles, journoPermissions, journoIntegrations, journoPublish, editorView, editorName, editorRoles, editorPermissions, editorIntegrations, editorPublish, updateTeammateModal, selectedTeammate, teammateName, newUserRole, team, hideMain, teammateModal, contacts } = this.state;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    let clientList;
    if(clients) {
      clientList = clients;
    } else {
      clientList = [];
    }
    let clientIDs =  clientList.map(a => a.clientID);
    let teamList;
    if(team) {
      teamList = team;
    } else {
      teamList = [];
    }
    let integrationsList;
    integrations ? integrationsList = integrations : integrationsList = [];
    let contactsList;
    contacts ? contactsList = contacts : contactsList = [];

    //Temporarily removed view access to the account settings page. Only main admin can access
    // if(clientIDs.includes(userRoot) || clientIDs.includes(user)) {
    if(clientIDs.includes(user)) {
      return(
        <div>
        <div className="container blog-settings">
          {/*Main Page */}
          <div className={hideMain}>
            <h3 className="center-align">Manage your account</h3>
            <div className="row">

              <div className="col account-details center-align s12">
                <h5>Account Name</h5>
                <h6>{this.state.accountSettings} <a onClick={() => this.setState({ accountNameModal: "", editing: true })}><i className="tiny material-icons">edit</i></a></h6>
              </div>

              <div className="col s12">
                <h5>Your Team {clientIDs.includes(loadUserData().username) ? <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ editing: true, hideMain: "hide", teammateModal: "" })}><i role="Add new team member" className="material-icons white-text">add</i></button> : <span className="note"><a className="note-link" onClick={() => window.Materialize.toast('Your main account admin can add teammates.', 4000)}>?</a></span>}</h5>

                <table className="bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date Added</th>
                      <th>Role</th>
                      {clientIDs.includes(loadUserData().username) ? <th></th> : <div />}
                    </tr>
                  </thead>
                  <tbody>
                      {teamList.slice(0).reverse().map(mate => {
                          return (
                            <tr key={mate.name}>
                              <td><a onClick={() => this.setState({ selectedTeammate: mate.name, updateTeammateModal: "", hideMain: "hide", editing: true})}>{mate.name}</a></td>
                              <td>{mate.added}</td>
                              <td>{mate.role}</td>
                              {clientIDs.includes(loadUserData().username) ? <td><a onClick={() => this.setState({ deleteContact: mate.name, deleteTeammateModal: "" })} ><i className="material-icons red-text">delete</i></a></td> : <div />}
                            </tr>
                          )
                        })
                      }
                  </tbody>
                </table>
              </div>


              {/*Permissions*/}
              <div className="col permissions container s12">
                <div className="row">
                <h5>Permissions</h5>
                <table className="permissions">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Editor</th>
                      <th>Writer</th>
                    </tr>
                  </thead>
                  <tbody>
                  {/*View Settings*/}
                  <tr>
                    <td className="permission-types">View Settings</td>
                    <td>
                      <div className="switch">
                        <label>
                          Off
                          <input id="view-editor" checked={this.state.editorView} onChange={() => this.setState({editorView: !editorView, lastUpdated: Date.now(), editing: true })} type="checkbox" />
                          <span className="lever"></span>
                          On
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="switch">
                        <label>
                          Off
                          <input id="view-journalist" checked={this.state.journoView} onChange={() => this.setState({journoView: !journoView, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                          <span className="lever"></span>
                          On
                        </label>
                      </div>
                    </td>
                  </tr>

                  {/*Account Name*/}
                  <tr>
                    <td className="permission-types">Update Name</td>
                    <td>
                      <div className="switch">
                        <label>
                          Off
                          <input id="name-editor" checked={this.state.editorName} onChange={() => this.setState({editorName: !editorName, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                          <span className="lever"></span>
                          On
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="switch">
                        <label>
                          Off
                          <input id="name-journalist" checked={this.state.journoName} onChange={() => this.setState({journoName: !journoName, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                          <span className="lever"></span>
                          On
                        </label>
                      </div>
                    </td>
                  </tr>

                    {/*Roles*/}
                    <tr>
                      <td className="permission-types">Update Roles</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="roles-editor" checked={this.state.editorRoles} onChange={() => this.setState({editorRoles: !editorRoles, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="roles-journalist" checked={this.state.journoRoles} onChange={() => this.setState({journoRoles: !journoRoles, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>

                    {/*Permissions*/}
                    <tr>
                      <td className="permission-types">Update Permissions</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="permissions-editor" checked={this.state.editorPermissions} onChange={() => this.setState({editorPermissions: !editorPermissions, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="permissions-journalist" checked={this.state.journoPermissions} onChange={() => this.setState({journoPermissions: !journoPermissions, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>

                    {/*Integrations*/}
                    <tr>
                      <td className="permission-types">Edit Integrations</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="integrations-editor" checked={this.state.editorIntegrations} onChange={() => this.setState({editorIntegrations: !editorIntegrations, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="integrations-journalist" checked={this.state.journoIntegrations} onChange={() => this.setState({journoIntegrations: !journoIntegrations, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>

                    {/*Publish*/}
                    <tr>
                      <td className="permission-types">Publish Articles</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="publish-Editor" checked={this.state.editorPublish} onChange={() => this.setState({editorPublish: !editorPublish, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="publish-journalist" checked={this.state.journoPublish} onChange={() => this.setState({journoPublish: !journoPublish, lastUpdated: Date.now(), editing: true})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={this.combineFile} className="save-permissions btn">Save</button>
                </div>
              </div>
                {/*End Permissions*/}

                {/* Integrations */}
                <div className="col permissions container s12">
                  <div className="row">
                  <h5>Integrations <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ integrationsModal: "", editing: true })}><i role="Add new blog team member" className="material-icons white-text">add</i></button></h5>
                  <table className="permissions">
                    <thead>
                      <tr>
                        <th>Integration Name</th>
                        <th>Date Added</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                    {integrationsList.slice(0).reverse().map(int => {
                        return (
                          <tr key={int.id}>
                            <td>{int.name}</td>
                            <td>{int.added}</td>
                            <td><a onClick={() => this.setState({ deleteIntegration: int.id, deleteIntName: int.name, deleteIntegrationModal: "" })} ><i className="material-icons red-text">delete</i></a></td>
                          </tr>
                        )
                      })
                    }
                    </tbody>
                  </table>

                  </div>
                </div>
                {/* End Integrations */}


            </div>
          </div>
          {/* End Main Page */}

          {/* Add Integration Modal */}
          <div className={integrationsModal}>
            <div id="modal1" className="project-page-modal modal">
              <div className="modal-content">
                <h4>Add Webhook Integration</h4>
                <label>Integration Name</label>
                <input type="text" value={this.state.integrationName} onChange={this.handleIntName} />
                <label>Webhook URL</label>
                <input type="text" value={this.state.integrationURL} onChange={this.handleIntURL} />
              </div>
              <div className="modal-footer">
                <a onClick={this.addInt} className="modal-action modal-close btn-flat">Add</a>
                <a onClick={() => this.setState({ integrationsModal: "hide", integrationName: "", integrationURL: "", editing: false})} className="modal-action modal-close btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Add Integration Modal */}

          {/* Delete Integration Modal */}
          <div className={deleteIntegrationModal}>
            <div className="project-page-modal modal">
              <div className="modal-content">
                <div className="container">
                  <h4>Are you sure you want to delete {this.state.deleteIntName}</h4>
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={this.deleteInt} className="modal-action modal-close btn-flat">Delete</a>
                <a onClick={() => this.setState({ deleteIntegrationModal: "hide", editing: false, deleteIntegration: "" })} className="modal-action modal-close btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Delete Integration Modal */}

          {/*Account Name Modal */}
          <div className={accountNameModal}>
            <div className="project-page-modal modal">
              <div className="modal-content">
                <div className="container">
                  <h4>Update Account Name</h4>
                  <p>Current account name: <strong>{this.state.accountSettings}</strong></p>
                  <input type="text" placeholder="New account name" value={this.state.updatedAccountName} onChange={this.accountNameChange} />
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={this.combineFile} className="modal-action modal-close btn-flat">Save</a>
                <a onClick={() => this.setState({ accountNameModal: "hide", editing: false, updatedAccountName: "" })} className="modal-action modal-close btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/*End Account Name Modal */}


          {/*Teammate Modal */}
          <div className={teammateModal}>
            <div id="modal1" className=" project-page-modal modal">
              <div className="modal-content">
                <h4>Add a Teammate From Your Contacts</h4>
                <p>Need to <a href="/contacts">add a new contact</a>?</p>
                <div>
                  <select value={this.state.teammateName} onChange={(event) => this.setState({ teammateName: event.target.value})}>
                    <option value="" disabled>Select a teammate</option>
                  {contactsList.slice(0).reverse().map(contact => {
                      return (
                        <option key={contact.contact} value={contact.contact}>{contact.contact}</option>
                      )
                    })
                  }
                  </select>
                  <form value="">
                    <p>
                      <input checked={this.state.newUserRole === 'Administrator'} className="with-gap" name="admin" value="role-admin" onChange={() => this.setState({ newUserRole: "Administrator"})} type="radio" id="role-admin"  />
                      <label htmlFor="role-admin">Administrator</label>
                    </p>
                    <p>
                      <input checked={this.state.newUserRole === 'Editor'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Editor"})} id="role-editor"  />
                      <label htmlFor="role-editor">Editor</label>
                    </p>
                    <p>
                      <input checked={this.state.newUserRole === 'Journalist'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Journalist"})} id="role-journo"  />
                      <label htmlFor="role-journo">Journalist</label>
                    </p>
                  </form>
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={() => this.setState({ confirmAdd: true, lastUpdated: Date.now() })} className="modal-action modal-close waves-effect waves-green btn-flat"><strong>Add</strong></a>
                <a onClick={() => this.setState({ editing: false, teammateModal: "hide", hideMain: "", newUserRole: "", teammateName: "" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Teammate Modal */}

          {/* Delete Teammate Modal */}
          <div className={deleteTeammateModal}>
            <div className="project-page-modal modal">
              <div className="modal-content">
                <div className="container">
                  <h4>Are you sure you want to delete {this.state.deleteContact}</h4>
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={this.delete} className="modal-action modal-close btn-flat">Delete</a>
                <a onClick={() => this.setState({ deleteTeammateModal: "hide", editing: false, deleteContact: "" })} className="modal-action modal-close btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Delete Teammate Modal */}

          {/*Update Teammate Modal */}
          <div className={updateTeammateModal}>
            <div id="modal1" className=" project-page-modal modal">
              <div className="modal-content">
                <h4 className="center-align">Update {this.state.selectedTeammate}'s {/*'s*/} Role</h4>
                <p className="center-align">Select new role</p>
                <div className="container">
                <form value="">
                  <p>
                    <input checked={this.state.newUserRole === 'Administrator'} className="with-gap" name="admin" value="role-admin" onChange={() => this.setState({ newUserRole: "Administrator"})} type="radio" id="role-admin"  />
                    <label htmlFor="role-admin">Administrator</label>
                  </p>
                  <p>
                    <input checked={this.state.newUserRole === 'Editor'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Editor"})} id="role-editor"  />
                    <label htmlFor="role-editor">Editor</label>
                  </p>
                  <p>
                    <input checked={this.state.newUserRole === 'Journalist'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Journalist"})} id="role-journo"  />
                    <label htmlFor="role-journo">Journalist</label>
                  </p>
                </form>
                </div>
              <div className="modal-footer">
                <a onClick={() => this.setState({ confirmUpdate: true })} className="modal-action modal-close waves-effect waves-green btn-flat"><strong>Update</strong></a>
                <a onClick={() => this.setState({ updateTeammateModal: "hide", hideMain: "", editing: false })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Update Teammate Modal */}
        </div>
        </div>
        </div>
      );
    } else {
      return(
        <div className="docs">
          <h5 className="center-align">You do not have access to this page.</h5>
          <p className="center-align"><a href="/">Go home</a></p>
        </div>
      );
    }

  }

  render(){

    const user = loadUserData().username;

      return(
        <div>
        {/* Nav */}
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/journalism" className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>
                <ul className="left toolbar-menu">
                  <li><a className="small-menu">Account Settings</a></li>
                </ul>
            </div>
          </nav>
        </div>
        {/* End Nav */}
          {this.renderView()}
        </div>
      )
  }
  }
