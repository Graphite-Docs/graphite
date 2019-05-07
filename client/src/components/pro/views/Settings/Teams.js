import React, { Component, setGlobal } from 'reactn';
import { Container, Table, Grid, Input, Modal, Button } from 'semantic-ui-react';
const team = require('../../helpers/team');

class Teams extends Component {
  render() {
      const { filteredTeams, newTeamModalOpen, userSession } = this.global;
      let teamList = filteredTeams.length > 0 ? filteredTeams : [];

      return (
        <div>
            <Container>
                <div className="padding-top-30">
                    <div className="table-container">
                        <Grid stackable columns={2}>
                            <Grid.Column>
                            <h2>Teams ({teamList.length}) 
                            <Modal 
                            open={newTeamModalOpen}
                            closeIcon
                            onClose={() => setGlobal({ newTeamModalOpen: false})}
                            trigger={<Button onClick={() => setGlobal({ newTeamModalOpen: true})} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>}>
                                <Modal.Content>
                                <Modal.Description>
                                    <Container>
                                        <h3>Create New Team</h3>
                                        <Input placeholder="My team" label="Name" onChange={team.handleTeamName}/>
                                    </Container>
                                </Modal.Description>
                                <Button onClick={() => team.saveNewTeam()} className="margin-top-10" secondary>Save</Button>
                                </Modal.Content>
                            </Modal>
                            </h2>
                            </Grid.Column>
                            <Grid.Column>
                                <Input className='search-box' onChange={this.filterList} icon='search' placeholder='Search...' />
                            </Grid.Column>
                        </Grid>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Team Name</Table.HeaderCell>
                                    <Table.HeaderCell>Member Count</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    teamList.map(team => {
                                        const myUserAccount = team.users.filter(user => user.username === userSession.loadUserData().username)[0];
                                        const canDelete = (myUserAccount.role === "Admin" || myUserAccount.role === "Manager") && team.name !== "Admins" ? true : false;
                                        return (
                                            <Table.Row key={team.id}>
                                                <Table.Cell><button onClick={() => setGlobal({ selectedTeam: team.id})} className="link-button" style={{color: "#4183c4"}}>{team.name}</button></Table.Cell>
                                                <Table.Cell>{Object.keys(team.users).length}</Table.Cell>
                                                <Table.Cell>{canDelete ? <button className="link-button" style={{color: "red"}}>Delete</button> : ""}</Table.Cell>
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

export default Teams;
