import React, { Component } from "react";
import {
  isSignInPending,
  getFile,
  putFile,
  handlePendingSignIn,
} from "blockstack";
import update from 'immutability-helper';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { encryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class AccountSettings extends Component {
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
      teamMine: [],
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
      devView: false,
      devTeam: false,
      devPayment: false,
      devManage: false,
      managerView: false,
      manageTeam: false,
      managePayment: false,
      managerManage: false,
      permissions: {},
      accountName: "",
      accountPlan: "",
      accountNameModal: "hide",
      accountPlanModal: "hide",
      updatedAccountName: "",
      updatedAccountPlan: "",
      accountDetails: {},
      teamLength: 0,
      count: 0,
      lastUpdated: 0,
      mainTeam: [],
      mateToLoad: "",
    }
    this.delete = this.delete.bind(this);
    this.saveTeam = this.saveTeam.bind(this);
    this.addTeammate = this.addTeammate.bind(this);
    this.updateTeammate = this.updateTeammate.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.setPermissions = this.setPermissions.bind(this);
    this.savePermissions = this.savePermissions.bind(this);
    this.getTeamMemberKey = this.getTeamMemberKey.bind(this);
    this.saveToTeamMember = this.saveToTeamMember.bind(this);
    this.mapTeam = this.mapTeam.bind(this);
    this.checkTeam = this.checkTeam.bind(this);
    this.loadMain = this.loadMain.bind(this);
    this.loadTeam = this.loadTeam.bind(this);
    this.loadNewFile = this.loadNewFile.bind(this);
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
      let team = this.state.teamMine;
      window.$.each(team, function(i){
        if(team[i].name === deleteName) {
            let updated = Date.now();
            team.splice(i,1);
            this.setState({ team: [...this.state.teamMine, team.splice(i, 1)], lastUpdated: updated})
            return false;
        }
      });
      setTimeout(this.delete, 500);
    }
  }

  componentDidMount() {

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

     getFile("permissions.json", {decrypt: false})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}')){
         this.setState({ permissions: JSON.parse(fileContents || '{}') });
         this.setState({
           devView: JSON.parse(fileContents || '{}').devView,
           devManage: JSON.parse(fileContents || '{}').devManage,
           devPayment: JSON.parse(fileContents || '{}').devPayment,
           devTeam: JSON.parse(fileContents || '{}').devTeam,
           managerView: JSON.parse(fileContents || '{}').managerView,
           managerManage: JSON.parse(fileContents || '{}').managerManage,
           managePayment: JSON.parse(fileContents || '{}').managePayment,
           manageTeam: JSON.parse(fileContents || '{}').manageTeam
         });
       } else {
         console.log("Permissions not set yet")
       }
     })
      .catch(error => {
        console.log(error);
      });

      this.loadTeam();

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
       console.log(JSON.parse(fileContents || '{}'));
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
    const name = 'admin.graphite';
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
              console.log("winner winner")
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

  mapTeam() {

  }

  addTeammate() {
    this.setState({confirmAdd: false, hideMain: "", teammateModal: "hide" });
    const object = {};
    object.name = this.state.teammateName;
    object.role = this.state.newUserRole;
    object.added = getMonthDayYear();
    let updated = Date.now();
    this.setState({ teamMine: [...this.state.teamMine, object], lastUpdated: updated });
    setTimeout(this.saveTeam, 500);
  }

  delete() {
    this.setState({team: this.state.teamMine, deleteContact: "" })
    this.saveTeam();
  }

  saveTeam() {
      //TODO remember to set encryption back to true
    putFile('team.json', JSON.stringify(this.state.teamMine), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        this.toggle();
        this.getTeamMemberKey();
      })
      .catch(e => {
        console.log(e);
      });
    putFile('teamUpdated.json', JSON.stringify(this.state.lastUpdated), {encrypt: false})
      .then(() => {
        console.log("saved")
      })
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
        window.Materialize.toast('Teammate added', 4000);
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
    console.log(index);
    function findObjectIndex(mate) {
        return mate.name == index;
    }
    this.setState({index: team.findIndex(findObjectIndex)});
    setTimeout(this.updateRole, 500);
  }

  updateRole() {
    const object = {};
    object.name = this.state.selectedTeammate;
    object.role = this.state.newUserRole;
    object.added = getMonthDayYear();
    const index = this.state.index;
    const updatedTeam = update(this.state.team, {$splice: [[index, 1, object]]});
    this.setState({ team: updatedTeam });
    setTimeout(this.saveTeam, 500);
  }

  setPermissions() {
    const object = {};
    object.devView = this.state.devView;
    object.devManage = this.state.devManage;
    object.devPayment = this.state.devPayment;
    object.devTeam = this.state.devTeam;
    object.managerView = this.state.managerView;
    object.managerManage = this.state.managerManage;
    object.managePayment = this.state.managePayment;
    object.manageTeam = this.state.manageTeam;
    this.setState({ permissions: object });
    setTimeout(this.savePermissions, 500);
  }

  savePermissions() {
      //TODO remember to set encryption back to true
    putFile('permissions.json', JSON.stringify(this.state.permissions), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        window.Materialize.toast('Permissions saved.', 4000);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render(){
    console.log(this.state.lastUpdated);
    const { devView, teamMine, managerManage, managerView, managePayment, manageTeam, devManage, devPayment, devTeam, updateTeammateModal, hideMain, teammateModal, contacts } = this.state;

      return(
        <div>
        {/* Nav */}
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/admin" className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>
                <ul className="left toolbar-menu">
                  <li><a className="small-menu">Account Settings</a></li>
                </ul>
            </div>
          </nav>
        </div>
        {/* End Nav */}
        <div className="container blog-settings">
          {/*Main Page */}
          <div className={hideMain}>
            <h3 className="center-align">Manage your account</h3>
            <div className="row">

              <div className="col s12">
                <h5>Your Team <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ hideMain: "hide", teammateModal: "" })}><i aria-labelledby="Add new blog team member" className="material-icons white-text">add</i></button></h5>

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
                      {teamMine.slice(0).reverse().map(mate => {
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
                <h5>Permissions</h5>
                <table className="permissions">
                  <thead>
                    <tr className="permissions-header">
                      <th></th>
                      <th>Developer</th>
                      <th>Account Manager</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="permission-types">Manage Clients</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="manage-developer" checked={this.state.devManage} onChange={() => this.setState({devManage: !devManage})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="manage-manager" checked={this.state.managerManage} onChange={() => this.setState({managerManage: !managerManage})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="permission-types">View Clients</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="view-developer" checked={this.state.devView} onChange={() => this.setState({devView: !devView})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="view-manager" checked={this.state.managerView} onChange={() => this.setState({managerView: !managerView})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="permission-types">Accept Payments</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="payment-developer" checked={this.state.devPayment} onChange={() => this.setState({devPayment: !devPayment})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="payment-manager" checked={this.state.managePayment} onChange={() => this.setState({managePayment: !managePayment})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="permission-types">Manage Team</td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="team-developer" checked={this.state.devTeam} onChange={() => this.setState({devTeam: !devTeam})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="switch">
                          <label>
                            Off
                            <input id="team-manager" checked={this.state.manageTeam} onChange={() => this.setState({manageTeam: !manageTeam})} type="checkbox" />
                            <span className="lever"></span>
                            On
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={this.setPermissions} className="btn">Save</button>
                {/*End Permissions*/}

              </div>
            </div>
            </div>
          </div>
          {/* End Main Page */}


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
                      <input checked={this.state.newUserRole === 'Developer'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Developer"})} id="role-dev"  />
                      <label htmlFor="role-editor">Developer</label>
                    </p>
                    <p>
                      <input checked={this.state.newUserRole === 'Account Manager'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newUserRole: "Account Manager"})} id="role-manager"  />
                      <label htmlFor="role-journo">Account Management</label>
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
      )
  }
}
