import React, { Component } from "react";
import Loading from '../Loading';
import { Container, Button, Grid, Input, Table } from 'semantic-ui-react';

export default class GDocs extends Component {

  render(){
    const { filteredGDocs, importAll } = this.props
    return(
      <Container style={{marginTop: "45px"}}>
      {
        importAll ?
        <div>
          <h3>Please wait while your Google Docs are imported...</h3>
          <Loading />
        </div> :
        <div>
        <Grid stackable columns={2}>
          <Grid.Column>
            <h2>Your Google Docs ({filteredGDocs.length})</h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={this.props.filterGDocsList} icon='search' placeholder='Search...' />
          </Grid.Column>
        </Grid>

          <Button style={{borderRadius: "0", background: "green", color: "#fff", marginTop: "20px"}} onClick={this.props.importAllGDocs} className="btn green">Import All</Button>
          <Table celled fixed singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Tile</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
            {
              filteredGDocs.map(doc => {
                return(
                <Table.Row key={doc.id}>
                  <Table.Cell>{doc.name}</Table.Cell>
                  <Table.Cell><Button onClick={() => this.props.singleGDoc(doc)} style={{borderRadius: "0", background: "blue", color: "#fff"}}>Import Doc</Button></Table.Cell>
                </Table.Row>
                )
              })
            }
            </Table.Body>
          </Table>
          </div>
      }
      </Container>
    )
  }
}
