import React, { Component, setGlobal } from 'reactn';
import { Container, Grid, Icon, Table, Modal, Button, Input, Radio, Popup } from 'semantic-ui-react';
const team = require('../../helpers/team');
const invites = require('../../helpers/invites');

class SelectedTeam extends Component {
  constructor(props) {
      super(props);
      this.state = {
          role: "User",
          email: "",
          name: ""
      }
  }

  componentDidMount() {
      team.fetchTeamKey();
  }

  handleRoleChange = (e, {value}) => {
    this.setState({ role: value });
  }

  saveNewTeammate = () => {
      const { email, role, name } = this.state;
      const { selectedTeam } = this.global;
      const teammateInfo = {
          role, 
          email, 
          name, 
          selectedTeam
      }
      team.saveNewTeammate(teammateInfo);
  }

  render() {
      const { filteredTeams, selectedTeam, newTeamMateModalOpen, userSession } = this.global;
      const { role } = this.state;
      const thisTeam = filteredTeams.filter(team => team.id === selectedTeam)[0];
      const userList = Object.keys(thisTeam.users).map(function(key) {
        return thisTeam.users[key];
     });
     const thisUser = userList.filter(user => user.username === userSession.loadUserData().username)[0];
     const canDelete = thisUser.role === "Admin" || thisUser.role === "Manager";

      return (
        <div>
            <Container>
                <div className="padding-top-30">
                    <div className="table-container">
                        <button onClick={() => setGlobal({ selectedTeam: "", settingsNav: "teams"})} className="link-button"><Icon name="arrow left" /> Back to Teams</button>
                        <Grid className="margin-top-25" stackable columns={1}>
                            <Grid.Column>
                                <h2>{thisTeam.name} ({userList.length}) 
                                <Modal 
                                closeIcon
                                open={newTeamMateModalOpen}
                                onClose={() => setGlobal({ newTeamMateModalOpen: false})}
                                trigger={<Button onClick={() => setGlobal({ newTeamMateModalOpen: true})} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>}>
                                    <Modal.Content>
                                    <Modal.Description>
                                        <Container>
                                            <h3>Add New Team Member</h3>
                                            <p>Enter the person's name and email address to send an invite.</p>
                                            <div className="margin-top-10">
                                                <Input placeholder="Johnny Cash" label="Name" onChange={(e) => this.setState({ name: e.target.value})}/>
                                            </div>
                                            <div className="margin-top-10">
                                                <Input placeholder="johnnycash@ringoffire.com" label="Email" onChange={(e) => this.setState({ email: e.target.value})}/>
                                            </div>
                                            <div>
                                            <p className="margin-top-10">Select a user role 
                                            <Modal closeIcon trigger={<Icon style={{cursor: "pointer", color: "rgb(65, 131, 196)"}} name="info" size="small" />}>
                                                <Modal.Content >
                                                <Modal.Description>
                                                    <h3>What can each user role do?</h3>
                                                    <p>Role Table Here</p>
                                                </Modal.Description>
                                                </Modal.Content>
                                            </Modal>
                                            </p>
                                            <Radio
                                                label='Admin'
                                                name='radioGroup'
                                                value='Admin'
                                                checked={role === 'Admin'}
                                                onChange={this.handleRoleChange}
                                            /> <br />
                                            <Radio
                                                className="margin-top-10"
                                                label='Manager'
                                                name='radioGroup'
                                                value='Manager'
                                                checked={role === 'Manager'}
                                                onChange={this.handleRoleChange}
                                            /> <br/>
                                            <Radio
                                                className="margin-top-10"
                                                label='User'
                                                name='radioGroup'
                                                value='User'
                                                checked={role === 'User'}
                                                onChange={this.handleRoleChange}
                                            /> <br />
                                            </div>
                                        </Container>
                                    </Modal.Description>
                                    <Button onClick={this.saveNewTeammate} className="margin-top-25" secondary>Send Invite</Button>
                                    </Modal.Content>
                                </Modal>
                                </h2>
                            </Grid.Column>
                        </Grid>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Username</Table.HeaderCell>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Role</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    userList.map(user => {
                                        return (
                                            <Table.Row key={user.username || user.email}>
                                                <Table.Cell>{user.name}</Table.Cell>
                                                <Table.Cell>{user.username ? user.username : <span><span style={{color: "#ffae42"}}>Invite Pending</span><span style={{marginLeft: "5px"}}>  <Popup trigger={<Icon onClick={() => invites.resendInvite(user, selectedTeam)} style={{cursor: "pointer", color: "rgb(65, 131, 196)", paddingTop: "2px"}} name="mail" />} content="Re-send invite email." basic /></span></span>}</Table.Cell>
                                                <Table.Cell>{user.email}</Table.Cell>
                                                <Table.Cell>{user.role}</Table.Cell>
                                                <Table.Cell>{canDelete && user.username !== userSession.loadUserData().username ? <button onClick={() => team.deleteUser({team: selectedTeam, user: user})} className="link-button" style={{color: "red"}}>Delete</button> : ""}</Table.Cell>
                                            </Table.Row>
                                        )
                                    })
                                }
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            </Container>
        </div>
       );
  }
}

export default SelectedTeam;
