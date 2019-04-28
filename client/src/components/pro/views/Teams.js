import React, { Component } from 'reactn';
import { Container, Table, Grid, Input } from 'semantic-ui-react';

class Teams extends Component {
  render() {
      const { filteredTeams } = this.global;
      let teamList = filteredTeams.length > 0 ? filteredTeams : [];
      console.log(teamList);
      return (
        <div>
            <Container>
                <div className="padding-top-30">
                    <div className="table-container">
                        <Grid stackable columns={2}>
                            <Grid.Column>
                            <h2>Teams ({teamList.length})
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
                                        return (
                                            <Table.Row key={team.teamId}>
                                                <Table.Cell>{team.name}</Table.Cell>
                                                <Table.Cell>{team.users.length}</Table.Cell>
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
