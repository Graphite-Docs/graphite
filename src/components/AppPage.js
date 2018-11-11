import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Signin from "./Signin";
import Header from "./Header";
import {
  isUserSignedIn,
  redirectToSignIn,
  signUserOut
} from "blockstack";
import { Grid, Icon, Container, Card, Table } from 'semantic-ui-react'

export default class AppPage extends Component {

  componentDidMount() {

  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin;
    redirectToSignIn(origin, origin + "/manifest.json", [
      "store_write",
      "publish_data"
    ])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    const { value, sheets, files, contacts, graphitePro } = this.props;
    let merged = sheets.reverse().concat(value.reverse());
    let recentWithDate = merged.filter(x => x.lastUpdate && x.updated);
    let recentFiles = recentWithDate.sort(function(a, b){return a.lastUpdate - b.lastUpdate}).slice(0,15);
    console.log(recentFiles);
    //Docs variables

    let docTags = value.map(a => a.tags);
    let newDocTags = docTags.filter(function(n){ return n !== undefined });
    let mergedDocTags = [].concat.apply([], newDocTags).length;
    let docCollabs = value.map(a => a.sharedWith)
    let newDocCollabs = docCollabs.filter(function(n){ return n !== undefined });
    let mergedDocCollabs = [].concat.apply([], newDocCollabs).length;
    //Sheets variables
    let sheetsTags = sheets.map(a => a.tags);
    let newSheetsTags = sheetsTags.filter(function(n){ return n !== undefined });
    let mergedSheetsTags = [].concat.apply([], newSheetsTags).length;
    let sheetsCollabs = sheets.map(a => a.sharedWith);
    let newSheetsCollabs = sheetsCollabs.filter(function(n){ return n !== undefined });
    let mergedSheetsCollabs = [].concat.apply([], newSheetsCollabs).length;
    //Files variables
    let filesTags = files.map(a => a.tags);
    let newFilesTags = filesTags.filter(function(n){ return n !== undefined });
    let mergedFilesTags = [].concat.apply([], newFilesTags).length;
    let filesCollabs = files.map(a => a.sharedWith);
    let newFilesCollabs = filesCollabs.filter(function(n){ return n !== undefined });
    let mergedFilesCollabs = [].concat.apply([], newFilesCollabs).length;
    window.$.extend({
      countUnique : function(fileTypes) {
        var result = [];
        window.$.each(fileTypes, function(i,v) {
          if(window.$.inArray(v, result) === -1) {
            result.push(v);
          }
        });
        return result.length;
      }
    });

    //Contacts variables
    let contactsTypes = contacts.map(a => a.types);
    let newContactsTypes = contactsTypes.filter(function(n){ return n !== undefined });
    let mergedContactsTypes = [].concat.apply([], newContactsTypes).length;


    return (
      <div>
        <Header
          graphitePro={graphitePro}
        />
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            {!isUserSignedIn() ? (
              <Signin
                handleSignIn={this.handleSignIn}
              />
            ) : (
            <Container>
            <Grid style={{ marginTop: "65px" , marginBottom: "35px"}} stackable columns={4}>
              <Grid.Row>
              <Card.Group centered>
              <Grid.Column>
                <Link to={'/documents'} style={{color:"#282828"}}>
                <Card className='appPageCard'>
                  <Card.Content>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <h2>Documents <br/>({value.length})</h2>
                        </Grid.Column>
                        <Grid.Column>
                          <Icon name='file alternate outline' className="appPageIcon" size='large' />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <p>Tags</p>
                        </Grid.Column>
                        <Grid.Column>
                          <p>Collaborators</p>
                        </Grid.Column>
                        <Grid.Column>
                          {mergedDocTags}
                        </Grid.Column>
                        <Grid.Column>
                          {mergedDocCollabs}
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Card.Content>
                </Card>
                </Link>
                </Grid.Column>
                <Grid.Column>
                <Link to={'/sheets'} style={{color:"#282828"}}>
                <Card className='appPageCard'>
                  <Card.Content>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <h2>Sheets <br/>({sheets.length})</h2>
                        </Grid.Column>
                        <Grid.Column>
                          <Icon name='table' size='large' className="appPageIcon" />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <p>Tags</p>
                        </Grid.Column>
                        <Grid.Column>
                          <p>Collaborators</p>
                        </Grid.Column>
                        <Grid.Column>
                          {mergedSheetsTags}
                        </Grid.Column>
                        <Grid.Column>
                          {mergedSheetsCollabs}
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Card.Content>
                </Card>
                </Link>
                </Grid.Column>
                <Grid.Column>
                <Link to={'/vault'} style={{color:"#282828"}}>
                <Card className='appPageCard'>
                  <Card.Content>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <h2>Vault <br/>({files.length})</h2>
                        </Grid.Column>
                        <Grid.Column>
                          <Icon name='shield alternate' size='large' className="appPageIcon" />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <p>Tags</p>
                        </Grid.Column>
                        <Grid.Column>
                          <p>Collaborators</p>
                        </Grid.Column>
                        <Grid.Column>
                          {mergedFilesTags}
                        </Grid.Column>
                        <Grid.Column>
                          {mergedFilesCollabs}
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Card.Content>
                </Card>
                </Link>
                </Grid.Column>
                <Grid.Column>
                <Link to={'/contacts'} style={{color:"#282828"}}>
                <Card className='appPageCard'>
                  <Card.Content>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <h2>Contacts <br/>({contacts.length})</h2>
                        </Grid.Column>
                        <Grid.Column>
                          <Icon name='address book outline' size='large' className="appPageIcon" />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <Grid columns={2}>
                      <Grid.Row>
                        <Grid.Column>
                          <p>Types</p>
                        </Grid.Column>
                        <Grid.Column>
                          <p>Notes</p>
                        </Grid.Column>
                        <Grid.Column>
                          {mergedContactsTypes}
                        </Grid.Column>
                        <Grid.Column>
                          0
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Card.Content>
                </Card>
                </Link>
                </Grid.Column>
              </Card.Group>
              </Grid.Row>
            </Grid>

            <h4 style={{fontFamily: 'Muli, san-serif', fontWeight: "200"}}>Opened Recently ({recentFiles.length})</h4>
            <Table unstackable style={{borderRadius: "0", marginBottom: "45px"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Name</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
              {
                recentFiles.map(merge => {
                    var link;
                    var name;
                    var date;
                    if(merge.title) {
                      name = merge.title;
                    } else {
                      name = merge.name;
                    }
                    if(merge.updated) {
                      date = merge.updated;
                    } else {
                      date = merge.uploaded;
                    }
                    if(merge.fileType === "documents") {
                      link = '/documents/doc/' + merge.id;
                    } else if(merge.fileType === "sheets") {
                      link = '/sheets/sheet/' + merge.id;
                    } else if(merge.fileType === "vault") {
                      link = '/vault/' + merge.id;
                    } else if(merge.fileType === undefined || merge.fileType === null) {
                      link = '/';
                    } else {
                      link = '/';
                    }
                  return(
                    <Table.Row key={merge.id}>
                      <Table.Cell><Link to={link}>{name}</Link></Table.Cell>
                      <Table.Cell>{date}</Table.Cell>
                    </Table.Row>
                  );
                  })
              }

              </Table.Body>
            </Table>
            </Container>
            )}
          </div>
        </div>
      </div>
    );
  }
}
