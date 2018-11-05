import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Signin from "./Signin";
import Header from "./Header";
import {
  isUserSignedIn,
  redirectToSignIn,
  signUserOut
} from "blockstack";
import {Doughnut} from 'react-chartjs-2';
import { Grid, Icon, Segment, Container, Card, Table } from 'semantic-ui-react'

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

    let sheetsData={
        labels: [
          'Sheets',
          'Tags',
          'Collaborators'
        ],
        datasets: [{
          data: [sheets.length, mergedSheetsTags, mergedSheetsCollabs],
          backgroundColor: [
          '#308502',
          '#18b003',
          '#1cd903'
          ],
          hoverBackgroundColor: [
            '#308502',
            '#18b003',
            '#1cd903'
          ]
        }]
      }

      let sheetsDataEmptyState={
          labels: [
            'Sheets',
            'Tags',
            'Collaborators'
          ],
          datasets: [{
            data: [20, 10, 8],
            backgroundColor: [
            '#b9b7b7',
            '#b9b7b7',
            '#b9b7b7'
            ],

          }]
        }

        let docsDataEmptyState={
            labels: [
              'Documents',
              'Tags',
              'Collaborators'
            ],
            datasets: [{
              data: [20, 10, 8],
              backgroundColor: [
              '#b9b7b7',
              '#b9b7b7',
              '#b9b7b7'
              ],

            }]
          }

      let docsData={
          labels: [
            'Documents',
            'Tags',
            'Collaborators'
          ],
          datasets: [{
            data: [value.length, mergedDocTags, mergedDocCollabs],
            backgroundColor: [
            '#023cc4',
            '#2a38fc',
            '#4141fa'
            ],
            hoverBackgroundColor: [
              '#023cc4',
              '#2a38fc',
              '#4141fa'
            ]
          }]
        }

        let FilesDataEmptyState={
            labels: [
              'Files',
              'Tags',
              'Collaborators'
            ],
            datasets: [{
              data: [20, 10, 8],
              backgroundColor: [
              '#b9b7b7',
              '#b9b7b7',
              '#b9b7b7'
              ],

            }]
          }

        let filesData={
            labels: [
              'Files',
              'Tags',
              'Collaborators'
            ],
            datasets: [{
              data: [files.length, mergedFilesTags, mergedFilesCollabs],
              backgroundColor: [
              '#ff6384',
              '#e6879c',
              '#f090e6'
              ],
              hoverBackgroundColor: [
                '#ff6384',
                '#e6879c',
                '#f090e6'
              ]
            }]
          }

          let contactsDataEmptyState={
              labels: [
                'Contacts',
                'Types',
                'Notes'
              ],
              datasets: [{
                data: [20, 10, 8],
                backgroundColor: [
                '#b9b7b7',
                '#b9b7b7',
                '#b9b7b7'
                ],

              }]
            }

        let contactsData={
            labels: [
              'Contacts',
              'Types',
              'Notes'
            ],
            datasets: [{
              data: [contacts.length, mergedContactsTypes, 0],
              backgroundColor: [
              '#c012eb',
              '#944da1',
              '#8a0b84'
              ],
              hoverBackgroundColor: [
                '#c012eb',
                '#944da1',
                '#8a0b84'
              ]
            }]
          }

    return (
      <div>
        <Header
          graphitePro={graphitePro}
        />
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            {!isUserSignedIn() ? (
              <Signin handleSignIn={this.handleSignIn} />
            ) : (
            <Container>
            <Grid style={{ marginTop: "25px" }} stackable columns={2}>
              <Grid.Column>
                <Link to={'/documents'} style={{color:"#282828"}}><Segment className='appPageCard'>
                <Card.Content>
                  <Icon style={{ float: "right"}} size='large' name='file alternate outline' />
                  <h2>Documents ({value.length})</h2>
                  {
                    docsData.datasets[0].data.some(a => a > 0) ? <Doughnut data={docsData} /> : <Doughnut data={docsDataEmptyState} />
                  }
                </Card.Content>
                </Segment></Link>
              </Grid.Column>
              <Grid.Column>
                <Link to={'/sheets'} style={{color:"#282828"}}><Segment className='appPageCard'>
                  <Card.Content>
                  <Icon style={{ float: "right"}} size='large' name='table' />
                  <h2>Sheets ({sheets.length})</h2>
                  {
                    sheetsData.datasets[0].data.some(a => a > 0) ? <Doughnut data={sheetsData} /> : <Doughnut data={sheetsDataEmptyState} />
                  }
                  </Card.Content>
                </Segment></Link>
              </Grid.Column>
              <Grid.Column>
                <Link to={'/vault'} style={{color:"#282828"}}><Segment className='appPageCard'>
                <Card.Content>
                <Icon style={{ float: "right"}} size='large' name='shield alternate' />
                <h2>Vault ({files.length})</h2>
                {
                  filesData.datasets[0].data.some(a => a > 0) ? <Doughnut data={filesData} /> : <Doughnut data={FilesDataEmptyState} />
                }
                </Card.Content>
                </Segment></Link>
              </Grid.Column>
              <Grid.Column>
                <Link to={'/contacts'} style={{color:"#282828"}}><Segment className='appPageCard'>
                  <Card.Content>
                  <Icon style={{ float: "right"}} size='large' name='address book outline' />
                  <h2>Contacts ({contacts.length})</h2>
                  {
                    contactsData.datasets[0].data.some(a => a > 0) ? <Doughnut data={contactsData} /> : <Doughnut data={contactsDataEmptyState} />
                  }
                  </Card.Content>
                </Segment></Link>
              </Grid.Column>
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
