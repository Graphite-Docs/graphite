import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Onboarding from './Onboarding';
import Loading from './Loading';
import RoleTable from './RoleTable';
import { Table, Dropdown, Container, Icon, Grid, Modal, Button, Input } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import Logs from './Logs';
import {
  loadUserData
} from 'blockstack';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mateInfo: "",
      modalOpen: false
    }
  }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = (props) => this.setState({ modalOpen: false }, () => {
    if(props === 'cancel') {
      this.props.clearNewTeammate();
    } else if(props === 'save') {
      this.props.addTeammate();
    }

  })

  copyLink = (link) => {
    /* Get the text field */
    var copyText = document.getElementById("inviteLink");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    alert(copyText.value);

  }

  render() {
    // this.state.mateInfo !=="" ? window.$('#modal4').modal('open') : window.$('#modal4').modal('close');
    const { loading, userRole, audits, team, newTeammateName, newTeammateRole, newTeammateEmail, settingsOnboarding, settingsMain } = this.props;
    let teamList;
    team === undefined ? teamList = [] : teamList = team;
      if(!loading) {
        return (
          <div>
            <div className={settingsOnboarding}>
              <Onboarding />
            </div>

          <div className={settingsMain}>
          <Header
            handleSignOut={this.props.handleSignOut}
           />
          <Container style={{marginTop: "45px"}}>
            <div className="center-align">
              <div className="row account-settings">
                <h1>Team Management</h1>
                {
                  window.location.origin === "http://localhost:3000" ? <button className="btn red" onClick={this.props.testingDeleteAll}>Blow it away</button> : <div className="hide" />
                }
                <Grid stackable columns={2} style={{marginBottom: "15px"}}>
                  <Grid.Column>
                    <h2>Your Team
                      <Modal
                        closeIcon
                        style={{borderRadius: "0"}}
                        open={this.state.modalOpen}
                        onClose={this.handleClose}
                        trigger={<Button onClick={this.handleOpen} style={{borderRadius: "0", marginLeft: "10px"}} secondary>Add</Button>}
                        >
                        <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Add a Teammate</Modal.Header>
                        <Modal.Content>
                          <Modal.Description style={{maxWidth: "75%", margin: "auto"}}>
                          <div style={{marginBottom: "10px"}}>
                            <Input style={{marginRight: "15px"}} value={newTeammateName} onChange={this.props.handleTeammateName} placeholder="Johnny Cash" />
                            <label className="active">Teammate Name<span className="red-text">*</span></label>
                          </div>
                          <div style={{marginBottom: "10px"}}>
                            <Input style={{marginRight: "15px"}} value={newTeammateEmail} onChange={this.props.handleTeammateEmail} placeholder="johnny@cash.com" />
                            <label className="active">Teammate Email<span className="red-text">*</span></label>
                          </div>
                          <div style={{marginBottom: "10px"}}>
                            <select style={{marginRight: "15px"}} className='roleDrop' value={newTeammateRole} onChange={this.props.handleTeammateRole}>
                              <option value="" disabled>Select Role</option>
                              <option value="Admin">Administrator</option>
                              <option value="Manager">Manager</option>
                              <option value="User">User</option>
                            </select>
                            <label>Role<span className="red-text">*</span></label>
                          </div>
                          <Button secondary style={{borderRadius: "0"}} onClick={() => this.handleClose('save')}>Add Teammate</Button>
                          <Button style={{borderRadius: "0"}} onClick={() => this.handleClose('cancel')}>Cancel</Button>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                    </h2>
                  </Grid.Column>
                </Grid>
                <div className="col s12">
                <div className="col s12 account-settings-section">

                <Table unstackable style={{borderRadius: "0"}}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Name</Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>ID</Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Role

                      <Modal closeIcon trigger={<a style={{cursor: "pointer", marginLeft: "5px"}}><Icon name='info' /></a>}>
                        <Modal.Header>Roles and Access</Modal.Header>
                        <Modal.Content>
                          <Modal.Description>
                            <RoleTable />
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                      </Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {
                      teamList.slice(0).map(mate => {
                        let url;
                        if(window.location.href.includes('localhost')) {
                          url = 'http://localhost:3000';
                        } else if(window.location.href.includes('serene')) {
                          url = 'https://serene-hamilton-56e88e.netlify.com';
                        } else {
                          url = 'https://app.graphitedocs.com'
                        }
                        let link = url + '/invites/?' + loadUserData().username + '?' + mate.id;
                      return(
                        <Table.Row key={mate.name} style={{ marginTop: "35px"}}>
                          {
                            mate.invitedAccepted === false ?
                            <Table.Cell>
                              <Modal closeIcon trigger={<a style={{cursor: "pointer"}}>{mate.name}</a>}>
                                <Modal.Header>Update Role for {mate.name}</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>
                                    <select defaultValue="select" className='roleDrop' onChange={this.props.handleTeammateRole}>
                                      <option value="select" disabled>Select Role</option>
                                      <option value="Admin">Administrator</option>
                                      <option value="Manager">Manager</option>
                                      <option value="User">User</option>
                                    </select>
                                    <label style={{marginRight: "15px"}}>Role</label>
                                    <div>
                                    <Button secondary style={{borderRadius: "0"}} onClick={() => this.props.updateTeammate(mate)}>Update</Button>
                                    </div>
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal>
                            </Table.Cell>
                            :
                            <Table.Cell>
                              <Modal closeIcon trigger={userRole !== "Manager" && mate.blockstackId !== loadUserData().username ? <a style={{cursor: "pointer"}} onClick={() => this.setState({ mateInfo: mate })}>{mate.name}</a> : <a style={{cursor: "pointer"}}>{mate.name}</a>}>
                                <Modal.Header>Update Role for {mate.name}</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>
                                    <select defaultValue="select" className='roleDrop' onChange={this.props.handleTeammateRole}>
                                      <option value="select" disabled>Select Role</option>
                                      <option value="Admin">Administrator</option>
                                      <option value="Manager">Manager</option>
                                      <option value="User">User</option>
                                    </select>
                                    <label style={{marginRight: "15px"}}>Role</label>
                                    <div>
                                    <Button secondary style={{borderRadius: "0"}} onClick={() => this.props.updateTeammate(mate)}>Update</Button>
                                    </div>
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal>
                            </Table.Cell>
                          }
                          <Table.Cell>{mate.blockstackId}</Table.Cell>
                          <Table.Cell>{mate.role.charAt(0).toUpperCase() + mate.role.slice(1)}</Table.Cell>
                          <Table.Cell>
                            <Dropdown icon='ellipsis vertical' className='actions'>
                              <Dropdown.Menu>
                                <Dropdown.Item>
                                  <Modal closeIcon trigger={<Link to={'/settings'} style={{color: "#282828"}}><Icon name='linkify'/>Invite Link</Link>}>
                                    <Modal.Header>Manage Tags</Modal.Header>
                                    <Modal.Content>
                                      <Modal.Description>
                                        <h3><Input value={link} id='inviteLink' /> <a onClick={this.copyLink}><Icon name='copy outline' /></a></h3>
                                      </Modal.Description>
                                    </Modal.Content>
                                  </Modal>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item>
                                  <Modal open={this.state.open} trigger={
                                    <a style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                                  } basic size='small'>
                                    <SemanticHeader icon='trash alternate outline' content={mate.name ? 'Delete ' + mate.name + '?' : 'Delete teammate?'} />
                                    <Modal.Content>
                                      <p>
                                        Deleting a teammate removes access to your team account.
                                      </p>
                                    </Modal.Content>
                                    <Modal.Actions>
                                      <div>
                                        {
                                          this.state.loading ?
                                          <Loading style={{bottom: "0"}} /> :
                                          <div>
                                            <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
                                              <Icon name='remove' /> No
                                            </Button>
                                            <Button onClick={() => this.props.teammateToDelete(mate)} color='red' inverted>
                                              <Icon name='checkmark' /> Delete
                                            </Button>
                                          </div>
                                        }
                                      </div>
                                    </Modal.Actions>
                                  </Modal>
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Table.Cell>
                        </Table.Row>
                      );
                      })
                    }
                  </Table.Body>
                </Table>
                </div>


                    {userRole !== "Manager" ?
                    <div style={{textAlign: "center", marginTop: "35px"}}>
                      <h1>Audits</h1>
                      <Modal closeIcon trigger={<Button secondary style={{borderRadius: "0"}}>Search Logs</Button>}>
                        <Modal.Header>Team Audits</Modal.Header>
                        <Modal.Content>
                          <Modal.Description>
                          <Logs
                            audits={audits}
                          />
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                    </div> :
                    null
                    }
                </div>
              </div>
            </div>
          </Container>
          </div>

          </div>
        );
      } else {
        return (
          <div>
            <Loading />
          </div>
        );
      }
  }
}
