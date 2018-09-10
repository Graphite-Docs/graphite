import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Onboarding from './Onboarding';
import LoadingBar from './LoadingBar';
import RoleTable from './RoleTable';
import Logs from './Logs';
import {
  loadUserData
} from 'blockstack';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mateInfo: ""
    }
  }

  componentDidMount() {
    window.$('.modal').modal();
    window.$('.tooltipped').tooltip();
    // window.$('select').material_select();
  }

  render() {
    this.state.mateInfo !=="" ? window.$('#modal4').modal('open') : window.$('#modal4').modal('close');
    const { userRole, audits, team, newTeammateName, newTeammateRole, newTeammateEmail, settingsOnboarding, settingsMain, loadingBar } = this.props;
    let teamList;
    team === undefined ? teamList = [] : teamList = team;
      if(userRole !== "User") {
        return (
          <div>
            <div className={loadingBar}>
              <Header />
              <div className="container account-settings">
                <LoadingBar />
              </div>
            </div>

            <div className={settingsOnboarding}>
              <Onboarding />
            </div>

          <div className={settingsMain}>
          <Header
            handleSignOut={this.props.handleSignOut}
           />
          <div className="container">
            <div className="center-align">
              <div className="row account-settings">
                <h3 className="center-align">Account Settings</h3>
                {
                  window.location.origin === "http://localhost:3000" ? <button className="btn red" onClick={this.props.testingDeleteAll}>Blow it away</button> : <div className="hide" />
                }
                <div className="col s12">
                <div className="col s12 account-settings-section">
                  <h5 className="left">Your Team {(1+1 === 2) ? <button className="btn-floating btn-small black modal-trigger" data-target="addTeammateModal"><i className="material-icons white-text">add</i></button> : <span className="note"><a className="note-link" onClick={() => window.Materialize.toast('Your main account admin can add teammates.', 4000)}>?</a></span>}</h5>

                  <table className="bordered">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Role <span><a className="info modal-trigger" href="#roleInfoModal"><i className="material-icons">info_outline</i></a></span></th>
                        {(1+1 === 2) ? <th></th> : <div />}
                      </tr>
                    </thead>
                    <tbody>
                        {teamList.slice(0).map(mate => {
                            return (
                              <tr key={mate.name}>

                              <td id="shareLinkModal" className="modal">
                                <div className="modal-content">
                                  <h4>Share Invite Link</h4>
                                  <input type="text" defaultValue={mate.inviteLink} id="copy" /><span><a onClick={this.props.copyLink}><i className="material-icons tiny">content_copy</i></a></span>
                                </div>
                              </td>

                                {
                                  mate.invitedAccepted === false ?
                                  <td><a data-target="modal4" className="modal-trigger">{mate.name}</a><span><a data-target="shareLinkModal" className="modal-trigger"><i className="material-icons tiny link">link</i></a></span></td>
                                  :
                                  <td>{userRole !== "Manager" && mate.blockstackId !== loadUserData().username ? <a onClick={() => this.setState({ mateInfo: mate })}>{mate.name}</a> : <a>{mate.name}</a>}</td>
                                }
                                <td>{mate.blockstackId}</td>
                                <td>{mate.role.charAt(0).toUpperCase() + mate.role.slice(1)}</td>
                                {(mate.blockstackId !== loadUserData().username && mate.role !== "Owner" && userRole !== "Manager") ? <td><a onClick={() => this.props.teammateToDelete(mate)} ><i className="material-icons red-text">delete</i></a></td> : <td></td>}
                              </tr>
                            )
                          })
                        }
                    </tbody>
                  </table>
                </div>

                    {/*Add Teammate*/}
                    <div id="addTeammateModal" className="modal modal-fixed-footer">
                      <div className="modal-content addteammate">
                        <h4>Add Teammate</h4>
                        <div className="input-field col s12 m6">
                          <input value={newTeammateName} onChange={this.props.handleTeammateName} type="text" placeholder="Johnny Cash" />
                          <label className="active">Teammate Name<span className="red-text">*</span></label>
                        </div>
                        <div className="input-field col s12 m6">
                          <input value={newTeammateEmail} onChange={this.props.handleTeammateEmail} type="text" placeholder="johnny@cash.com" />
                          <label className="active">Teammate Email<span className="red-text">*</span></label>
                        </div>
                        <div className="col s12">
                          <select value={newTeammateRole} onChange={this.props.handleTeammateRole}>
                            <option value="" disabled>Select Role</option>
                            <option value="Admin">Administrator</option>
                            <option value="Manager">Manager</option>
                            <option value="User">User</option>
                          </select>
                          <label>Role<span className="red-text">*</span></label>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <a onClick={this.props.clearNewTeammate} className="modal-close waves-effect waves-green btn-flat">Cancel</a>
                        <a onClick={this.props.addTeammate} className="modal-close waves-effect waves-green btn black">Add Teammate</a>
                      </div>
                    </div>
                    {/*End Add Teammate*/}

                    {/*Update Teammate */}
                    <div id="modal4" className="modal center-align modal-fixed-footer">
                      <div className="modal-content">
                        <h4>Update Role for {this.state.mateInfo.name}</h4>
                        <div className="col s12">
                          <select defaultValue="select" onChange={this.props.handleTeammateRole}>
                            <option value="select" disabled>Select Role</option>
                            <option value="Admin">Administrator</option>
                            <option value="Manager">Manager</option>
                            <option value="User">User</option>
                          </select>
                          <label>Role</label>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <a className="modal-close waves-effect waves-green btn-flat">Cancel</a>
                        <a onClick={() => this.props.updateTeammate(this.state.mateInfo)} className="modal-close waves-effect waves-green btn black">Update</a>
                      </div>
                    </div>
                    {/*End Update Teammate */}

                    {/*Role Info Modal */}
                    <div id="roleInfoModal" className="modal">
                      <div className="modal-content">
                        <h4>Roles and Access</h4>
                        <RoleTable />
                      </div>
                      <div className="modal-footer">
                        <a href="#!" className="modal-close waves-effect waves-green btn-flat">Got it</a>
                      </div>
                    </div>
                    {/*End Role Info Modal */}

                    {/*<div className="col s12">
                      <h3>Security Policy</h3>

                    </div>*/}

                    {userRole !== "Manager" ?
                    <div className="col s12">
                      <h3>Audits</h3>
                      <button data-target="logModal" className="btn black modal-trigger">Search Logs</button>

                      <div id="logModal" className="modal">
                        <Logs
                          audits={audits}
                        />
                      </div>
                    </div> :
                    <div className="hide" />
                    }
                    {
                      userRole !=="User" ?
                      <div className="col s12">
                      <h3>Integrations</h3>
                        <Link to={'/integrations'}><button className="btn black">Configure Integrations</button></Link>
                      </div>:
                      <div className="hide" />
                    }

                </div>
              </div>
            </div>
          </div>
          </div>

          </div>
        );
      } else {
        return (
          <div>
          <div className={loadingBar}>
            <Header />
            <div className="container account-settings">
              <LoadingBar />
            </div>
          </div>

          <div className={settingsOnboarding}>
            <Onboarding />
          </div>

        <div className={settingsMain}>
        <Header
          handleSignOut={this.props.handleSignOut}
         />
        <div className="container center-align">
          <h3>You do not have access to this page.</h3>
          <a href="/">Go back</a>
        </div>
          </div>
          </div>
        );
      }
  }
}
