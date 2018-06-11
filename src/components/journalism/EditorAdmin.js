import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
  handlePendingSignIn,
} from "blockstack";
import update from 'immutability-helper';
import axios from 'axios';
const { encryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
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
  	  },
      contacts: [],
      team: [],
      hideMain: "",
      teammateModal: "hide",
      teammateName: "",
      deleteContact: "",
      contact: "",
      index: "",
      confirmAdd: false,
      confirmUpdate: false,
      newUserRole: "",
      checkboxState: true,
      selectedTeammate: "",
      updateTeammateModal: "hide",
      index: "",
      editorShare: false,
      editorPublish: false,
      editorComment: false,
      editorAssign: false,
      journoShare: false,
      journoPublish: false,
      journoComment: false,
      journoAssign: false,
      permissions: {},
      accountName: "",
      accountPlan: "",
      accountNameModal: "hide",
      accountPlanModal: "hide",
      updatedAccountName: "",
      updatedAccountPlan: "",
      accountDetails: {},
      clients: [],
      pubKey: "",
      teamUpdated: 0,
      otherTeamUpdated: 0,
      permissionsUpdate: 0,
      otherPermissionsUpdate: 0,
      accountDetailsUpdate: 0,
      otherAccountDetailsUpdate: 0,
      integrations: [],
      deleteIntegration: "",
      integrationsModal: "hide",
      integrationURL: "",
      integrationName: ""
    }
    this.delete = this.delete.bind(this);
    this.saveTeam = this.saveTeam.bind(this);
    this.addTeammate = this.addTeammate.bind(this);
    this.updateTeammate = this.updateTeammate.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.setPermissions = this.setPermissions.bind(this);
    this.savePermissions = this.savePermissions.bind(this);
    this.accountNameChange = this.accountNameChange.bind(this);
    this.saveAccountDetails = this.saveAccountDetails.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.getTeamMemberKey = this.getTeamMemberKey.bind(this);
    this.saveToTeamMember = this.saveToTeamMember.bind(this);
    this.saveTeamUpdateFile = this.saveTeamUpdateFile.bind(this);
    this.savePermissionsUpdateFile = this.savePermissionsUpdateFile.bind(this);
    this.handleIntName = this.handleIntName.bind(this);
    this.handleIntURL = this.handleIntURL.bind(this);
    this.addInt = this.addInt.bind(this);
    this.saveInt = this.saveInt.bind(this);
    this.deleteInt = this.deleteInt.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.loadMainAccountDetails = this.loadMainAccountDetails.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      const team = this.state.team;
      if(team.length > 0){
        if(team.includes(this.state.teammateName)){
          console.log("Nope");
          window.Materialize.toast('That person is already on your team.', 4000)
        } else {
          this.addTeammate();
        }
      } else {
          this.addTeammate();
      }
    }

    if(this.state.confirmUpdate === true){
      this.updateTeammate();
    }

    if(this.state.deleteContact !== "") {
      let deleteName = this.state.deleteContact;
      let team = this.state.team;
      window.$.each(team, function(i){
        if(team[i].name === deleteName) {
            team.splice(i,1);
            return false;
            this.setState({ team: [...this.state.team, team.splice(i, 1)]})
        }
      });
      setTimeout(this.delete, 500);
    }

    if(this.state.deleteIntegration !== "") {
      let deleteId = this.state.deleteIntegration;
      let integrations = this.state.integrations;
      window.$.each(integrations, function(i){
        if(integrations[i].id === deleteId) {
            integrations.splice(i,1);
            return false;
            this.setState({ integrations: [...this.state.integrations, integrations.splice(i, 1)]})
        }
      });
      setTimeout(this.deleteInt, 500);
    }
  }

  componentDidMount() {

    //Loading Main Clients List
    const user = 'admin.graphite';
    const options = { username: 'admin.graphite', zoneFileLookupURL: 'https://core.blockstack.org/v1/names', decrypt: false}
    getFile('clientlist.json', options)
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ clients: JSON.parse(fileContents || '{}') });
          this.loadSettings();
        } else {
          this.setState({ clients: [] });
          this.loadSettings();
        }

      })
      .catch(error => {
        console.log(error);
      });

    }

    loadSettings() {

    //Loading Account Specific Account Details File
     getFile("accountdetails.json", {decrypt: false})
     .then((fileContents) => {
       if(fileContents){
         this.setState({ accountName: JSON.parse(fileContents || '{}').accountName, accountPlan: JSON.parse(fileContents || '{}').accountPlan });
       } else {
         //If the logged in user has never saved an account details file, we are going to load the main admin's file.
         console.log("No account details yet");
         this.loadMainAccountDetails();
       }
     })
      .catch(error => {
        console.log(error);
      });

    //Loading account-specific Integrations
    getFile('integrations.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ integrations: JSON.parse(fileContents || '{}') });
        } else {
          this.setState({ integrations: [] });
        }
      })

    //Loading Account Specific Contacts
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

    //Loading Account Specific Team
    getFile("team.json", {decrypt: true})
    .then((fileContents) => {
      if(JSON.parse(fileContents || '{}').length > 0){
        this.setState({ team: JSON.parse(fileContents || '{}') });
      } else {
        console.log("No team yet")
      }
    })
     .catch(error => {
       console.log(error);
     });

     //Loading Account Specific Update File
     getFile("teamUpdate.json", {decrypt: false})
     .then((fileContents) => {
       if(fileContents){
         this.setState({ teamUpdated: JSON.parse(fileContents || '{}') });
       } else {
         this.setState({ teamUpdated: 0 });
       }
     })
      .catch(error => {
        console.log(error);
      });

      //Loading Account Specific Account Details Update File
      getFile("accountdetailsUpdate.json", {decrypt: false})
      .then((fileContents) => {
        if(fileContents){
          this.setState({ accountDetailsUpdate: JSON.parse(fileContents || '{}') });
        } else {
          this.setState({ accountDetailsUpdate: 0 });
        }
      })
       .catch(error => {
         console.log(error);
       });

    //Loading Account Specific Permissions File
     getFile("permissions.json", {decrypt: false})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}')){
         this.setState({ permissions: JSON.parse(fileContents || '{}') });
         this.setState({
           editorShare: JSON.parse(fileContents || '{}').editorShare,
           editorAssign: JSON.parse(fileContents || '{}').editorAssign,
           editorComment: JSON.parse(fileContents || '{}').editorComment,
           editorPublish: JSON.parse(fileContents || '{}').editorPublish,
           journoShare: JSON.parse(fileContents || '{}').journoShare,
           journoAssign: JSON.parse(fileContents || '{}').journoAssign,
           journoComment: JSON.parse(fileContents || '{}').journoComment,
           journoPublish: JSON.parse(fileContents || '{}').journoPublish
         });
       } else {
         console.log("Permissions not set yet")
       }
     })
      .catch(error => {
        console.log(error);
      });

      //Loading Account Specific Permissions Update File
      getFile("permissionsUpdate.json", {decrypt: true})
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}')){
          this.setState({ permissionsUpdate: JSON.parse(fileContents || '{}')})
        } else {
          this.setState({ permissionsUpdate: 0})
        }
      })
       .catch(error => {
         console.log(error);
       });

       this.loadTeam();

   }

   loadMainAccountDetails() {
     //TODO continue work here
   }

   loadNewFile() {
     const name = this.state.mateToLoad;
     const options = { username: name, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
     getFile('team.json', options)
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ teamMine: JSON.parse(fileContents || '{}'), teamLength: JSON.parse(fileContents || '{}').length })
        } else {
          this.setState({ teamMine: [] })
        }
      })
       .catch(error => {
         console.log(error);
       });
   }

   loadTeam() {
     getFile("team.json", {decrypt: false})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').length > 0){
         this.setState({
           teamMine: JSON.parse(fileContents || '{}'),
           teamLength: JSON.parse(fileContents || '{}').length
           });
       } else {
         this.loadMain();
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile("teamUpdated.json", {decrypt: false})
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}')){
          this.setState({
            lastUpdated: JSON.parse(fileContents || '{}')
            });
        } else {
          console.log("No team yet")
        }
      })
      .then(() => {
        this.checkTeam();
      })
       .catch(error => {
         console.log(error);
       });
   }

   loadMain() {
     const userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
     const name = 'admin.graphite';
     const options = { username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
       getFile('team.json', options)
        .then((fileContents) => {
          if(JSON.parse(fileContents || '{}').length > 0) {
            this.setState({ teamMine: JSON.parse(fileContents || '{}'), teamLength: JSON.parse(fileContents || '{}').length })
          } else {
            this.setState({ teamMine: [] })
          }
        })
         .catch(error => {
           console.log(error);
         });
   }

   checkTeam() {
     const team = this.state.teamMine;
     if(team[this.state.count]) {
       const user = team[this.state.count].name;
       console.log(user);
       //TODO keep working here

       const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

       getFile('teamUpdated.json', options)
         .then((file) => {
           if(file) {
             if(JSON.parse(file || '{}') > this.state.lastUpdated) {
               //set lastUpdated to this person's last updated
               this.setState({ lastUpdated: JSON.parse(file || '{}'), mateToLoad: user});
               this.loadNewFile();
             } else {
               if(this.state.count < this.state.teamLength) {
                 this.setState({ count: this.state.count + 1});
                 this.checkTeam();
               } else {
                 console.log("done");
               }
             }
           } else {
             if(this.state.count < this.state.teamLength) {
               this.setState({ count: this.state.count + 1});
               this.checkTeam();
             } else {
               console.log("done");
             }
           }
         })
           .catch(error => {
             console.log(error);
             this.setState({ count: this.state.count + 1});
             this.checkTeam();
           });
     } else {
       console.log("No more teammates");
     }
   }

  addTeammate() {
    this.setState({confirmAdd: false, hideMain: "", teammateModal: "hide" });
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.name = this.state.teammateName;
    object.role = this.state.newUserRole;
    object.added = month + "/" + day + "/" + year;
    this.setState({ team: [...this.state.team, object] });
    this.setState({ teamUpdated: Date.now() });
    setTimeout(this.saveTeam, 500);
  }

  delete() {
    this.setState({team: this.state.team, deleteContact: "" })
    this.setState({ teamUpdated: Date.now() })
    this.saveTeam();
  }

  deleteInt() {
    this.setState({integrations: this.state.integrations, deleteIntegration: "" })
    // this.setState({ teamUpdated: Date.now() })
    this.saveInt();
  }

  saveTeam() {
    this.setState({updateTeammateModal: "hide"});

    putFile('team.json', JSON.stringify(this.state.team), {encrypt: true})
    .then(() => {
        console.log("Saved!");
        this.toggle();
        this.getTeamMemberKey();
        this.saveTeamUpdateFile();
        this.savePermissions();
      })
      .catch(e => {
        console.log(e);
      });
  }

  saveTeamUpdateFile() {
    putFile('teamUpdate.json', JSON.stringify(this.state.teamUpdated), {encrypt: true})
    .then(() => {
        console.log("Saved!");
      })
      .catch(e => {
        console.log(e);
      });
  }

  savePermissionsUpdateFile() {
    putFile('permissionsUpdate.json', JSON.stringify(this.state.permissionsUpdate), {encrypt: true})
    .then(() => {
        console.log("Saved!");
      })
      .catch(e => {
        console.log(e);
      });
  }

  saveAccountDetailsUpdateFile() {
    putFile('accountdetailsUpdate.json', JSON.stringify(this.state.accountDetailsUpdate), {encrypt: true})
    .then(() => {
        console.log("Saved!");
      })
      .catch(e => {
        console.log(e);
      });
  }

  getTeamMemberKey() {
    const user = this.state.teammateName;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        if(file) {
          this.setState({ pubKey: JSON.parse(file)})
          this.saveToTeamMember();
        } else {
          window.Materialize.toast(this.state.teammateName + " has not logged into Graphite yet. Ask them to log in.", 4000);
          this.setState({index: "", newUserRole: "", teammateName: "", selectedTeammate: "", hideMain: "", updateTeammateModal: "hide"});
        }
      })
        .catch(error => {
          console.log("No key: " + error);
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
        });
  }

  saveToTeamMember() {
    const publicKey = this.state.pubKey;
    const data = this.state.team;
    const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
    const directory = 'sharedTeamFile.json';
    putFile(directory, encryptedData, {encrypt: false})
      .then(() => {
        this.setState({index: "", newUserRole: "", teammateName: "", selectedTeammate: "", hideMain: "", updateTeammateModal: "hide"});
        window.Materialize.toast('Saved', 4000);
      })
      .catch(e => {
        console.log(e);
      });
  }

  toggle(event) {
    if(event) {
      this.setState({
        checkboxState: !this.state.checkboxState,
        selectedTeammate: event.target.value
      });
    } else {
      this.setState({
        checkboxState: !this.state.checkboxState
      });
    }

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
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    object.name = this.state.selectedTeammate;
    object.role = this.state.newUserRole;
    object.added = month + "/" + day + "/" + year;
    object.updated = Date.now()
    const index = this.state.index;
    const updatedTeam = update(this.state.team, {$splice: [[index, 1, object]]});
    this.setState({ team: updatedTeam });
    this.setState({ teamUpdated: Date.now() })
    setTimeout(this.saveTeam, 500);
  }

  setPermissions() {
    const object = {};
    object.editorShare = this.state.editorShare;
    object.editorAssign = this.state.editorAssign;
    object.editorComment = this.state.editorComment;
    object.editorPublish = this.state.editorPublish;
    object.journoShare = this.state.journoShare;
    object.journoAssign = this.state.journoAssign;
    object.journoComment = this.state.journoComment;
    object.journoPublish = this.state.journoPublish;
    this.setState({ permissionsUpdate: Date.now() })
    this.setState({ permissions: object });
    setTimeout(this.savePermissions, 500);
  }

  savePermissions() {
      //TODO remember to set encryption back to true
    putFile('permissions.json', JSON.stringify(this.state.permissions), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        window.Materialize.toast('Permissions saved.', 4000);
        this.savePermissionsUpdateFile();
      })
      .catch(e => {
        console.log(e);
      });
  }

  accountNameChange(e) {
    this.setState({ updatedAccountName: e.target.value });
    this.setState({ accountDetailsUpdate: Date.now()})
  }

  updateAccount() {
    const object = {};
    object.accountName = this.state.updatedAccountName;
    object.accountPlan = this.state.accountPlan;
    this.setState({ accountDetails: object });
    setTimeout(this.saveAccountDetails, 500);
  }

  saveAccountDetails() {
    //TODO remember to set encryption back to true
    putFile('accountdetails.json', JSON.stringify(this.state.accountDetails), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        window.Materialize.toast('Account updated.', 4000);
        this.setState({ accountName: this.state.updatedAccountName, accountNameModal: "hide", accountPlanModal: "hide", updatedAccountName: "", updatedAccountPlan: "" })
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleIntURL(e) {
    this.setState({ integrationURL: e.target.value})
  }

  handleIntName(e) {
    this.setState({ integrationName: e.target.value})
  }

  addInt() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.id = Date.now();
    object.name = this.state.integrationName;
    object.url = this.state.integrationURL;
    object.added = month + '/' + day + '/' + year;
    this.setState({integrations: [...this.state.integrations, object]})
    setTimeout(this.saveInt, 300);
  }

  saveInt() {
    putFile('integrations.json', JSON.stringify(this.state.integrations), {encrypt: true})
      .then(() => {
        console.log("Saved");
        this.setState({ integrationURL: "", integrationName: "", integrationsModal: "hide"})
      })
  }

  renderView() {
    const user = loadUserData().username;
    const { integrationsModal, integrations, clients, accountNameModal, accountPlanModal, journoAssign, journoShare, journoComment, journoPublish, editorAssign, editorShare, editorComment, editorPublish, updateTeammateModal, selectedTeammate, ammateName, newUserRole, team, hideMain, teammateModal, contacts } = this.state;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const clientIDs =  clients.map(a => a.clientID);
    console.log(user);
    if(clientIDs.includes(userRoot) || clientIDs.includes(user)) {
      return(
        <div>
        <div className="container blog-settings">
          {/*Main Page */}
          <div className={hideMain}>
            <h3 className="center-align">Manage your account</h3>
            <div className="row">

              <div className="col account-details center-align s12">
                <h5>Account Name</h5>
                <h6>{this.state.accountName} <a onClick={() => this.setState({ accountNameModal: "" })}><i className="tiny material-icons">edit</i></a></h6>
              </div>

              <div className="col s12">
                <h5>Your Team <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ hideMain: "hide", teammateModal: "" })}><i role="Add new blog team member" className="material-icons white-text">add</i></button></h5>

                <table className="bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date Added</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                      {team.slice(0).reverse().map(mate => {
                          return (
                            <tr key={mate.name}>
                              <td><a onClick={() => this.setState({ selectedTeammate: mate.name, updateTeammateModal: "", hideMain: "hide"})}>{mate.name}</a></td>
                              <td>{mate.added}</td>
                              <td>{mate.role}</td>
                              <td><a onClick={() => this.setState({ deleteContact: mate.name })} ><i className="material-icons red-text">delete</i></a></td>
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
                <h5>Permissions <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ hideMain: "hide", teammateModal: "" })}><i role="Add new blog team member" className="material-icons white-text">add</i></button></h5>
                <table className="permissions">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Editor</th>
                      <th>Journalist</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="permission-types">Submit</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="assign-editor" checked={this.state.editorAssign} onChange={() => this.setState({editorAssign: !editorAssign})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="assign-journalist" checked={this.state.journoAssign} onChange={() => this.setState({journoAssign: !journoAssign})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="permission-types">Comment</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="comment-editor" checked={this.state.editorComment} onChange={() => this.setState({editorComment: !editorComment})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="comment-journalist" checked={this.state.journoComment} onChange={() => this.setState({journoComment: !journoComment})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="permission-types">Publish</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="publish-Editor" checked={this.state.editorPublish} onChange={() => this.setState({editorPublish: !editorPublish})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="publish-journalist" checked={this.state.journoPublish} onChange={() => this.setState({journoPublish: !journoPublish})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={this.setPermissions} className="save-permissions btn">Save</button>
                </div>
              </div>
                {/*End Permissions*/}

                {/* Integrations */}
                <div className="col permissions container s12">
                  <div className="row">
                  <h5>Integrations <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ integrationsModal: "" })}><i role="Add new blog team member" className="material-icons white-text">add</i></button></h5>
                  <table className="permissions">
                    <thead>
                      <tr>
                        <th>Integration Name</th>
                        <th>Date Added</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                    {integrations.slice(0).reverse().map(int => {
                        return (
                          <tr key={int.id}>
                            <td>{int.name}</td>
                            <td>{int.added}</td>
                            <td><a onClick={() => this.setState({ deleteIntegration: int.id })} ><i className="material-icons red-text">delete</i></a></td>
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
                <label>Integration URL</label>
                <input type="text" value={this.state.integrationURL} onChange={this.handleIntURL} />
              </div>
              <div className="modal-footer">
                <a onClick={this.addInt} className="modal-action modal-close btn-flat">Add</a>
                <a onClick={() => this.setState({ integrationsModal: "hide", integrationName: "", integrationURL: ""})} className="modal-action modal-close btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Add Integration Modal */}

          {/*Account Name Modal */}
          <div className={accountNameModal}>
            <div className="project-page-modal modal">
              <div className="modal-content">
                <div className="container">
                  <h4>Update Account Name</h4>
                  <p>Current account name: <strong>{this.state.accountName}</strong></p>
                  <input type="text" placeholder="New account name" value={this.state.updatedAccountName} onChange={this.accountNameChange} />
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={this.updateAccount} className="modal-action modal-close btn-flat">Save</a>
                <a onClick={() => this.setState({ accountNameModal: "hide" })} className="modal-action modal-close btn-flat">Cancel</a>
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
                  {contacts.slice(0).reverse().map(contact => {
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
                <a onClick={() => this.setState({ confirmAdd: true })} className="modal-action modal-close waves-effect waves-green btn-flat"><strong>Add</strong></a>
                <a onClick={() => this.setState({ teammateModal: "hide", hideMain: "" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Teammate Modal */}

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
                <a onClick={() => this.setState({ updateTeammateModal: "hide", hideMain: "" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
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
    const { clients, accountNameModal, accountPlanModal, journoAssign, journoShare, journoComment, journoPublish, editorAssign, editorShare, editorComment, editorPublish, updateTeammateModal, selectedTeammate, ammateName, newUserRole, team, hideMain, teammateModal, contacts } = this.state;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const clientIDs =  clients.map(a => a.clientID);
    clientIDs.includes(userRoot) ? console.log(true) : console.log(false);
    console.log(clients);

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
