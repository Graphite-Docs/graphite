import React, { Component } from 'reactn';
import { Grid, Container, Table } from 'semantic-ui-react';
import { deleteFromOrg } from '../../helpers/account';

class Users extends Component {
  render() {
      const { proOrgInfo, userSession } = this.global;
      let userList;
      if(proOrgInfo.users) {
        userList = proOrgInfo.users;
      } else {
        userList = [];
      }
      return (
        <div>
          <Container>
                <div className="padding-top-30">
                    <div className="table-container">
                        <Grid stackable columns={2}>
                            <Grid.Column>
                              <h2>Users ({userList.length})</h2>
                            </Grid.Column>
                        </Grid>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Username</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    userList.map(user => {
                                        return (
                                            <Table.Row key={user.id}>
                                                <Table.Cell>{user.name}</Table.Cell>
                                                <Table.Cell>{user.username}</Table.Cell>
                                                <Table.Cell>{user.username !== userSession.loadUserData().username ? <button onClick={() => deleteFromOrg(user)} className="link-button" style={{color: "red"}}>Delete</button> : ""}</Table.Cell>
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

export default Users;
