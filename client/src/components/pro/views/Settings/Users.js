import React, { Component } from 'reactn';
import { Grid, Container } from 'semantic-ui-react';

class Users extends Component {
  render() {
      const { proOrgInfo } = this.global;
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
                    </div>
                </div>
          </Container>
        </div>
       );
  }
}

export default Users;
