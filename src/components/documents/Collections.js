import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Loading from '../Loading';
import { Container, Input, Grid, Button, Table, Message, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import {
  isSignInPending,
  handlePendingSignIn,
  putFile,
  getFile
} from 'blockstack';
import Header from '../Header';
import Joyride from "react-joyride";

export default class Collections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      teamView: false,
      open: false,
      visible: false,
      doc: {},
      run: false,
      onboarding: false
    }
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {

    getFile('docPageOnboarding.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ onboarding: JSON.parse(fileContents)})
        } else {
          this.setState({ onboarding: false });
        }
      })
      .then(() => {
        this.checkFiles();
      })
  }

  checkFiles = () => {
    if(this.props.value < 1) {
      if(!this.state.onboarding) {
        this.setState({ run: true, onboarding: true }, () => {
          putFile('docPageOnboarding.json', JSON.stringify(this.state.onboarding), {encrypt: true})
        });
      }
    } else {
      this.setState({ onboardingComplete: true }, () => {
        putFile('docPageOnboarding.json', JSON.stringify(this.state.onboarding), {encrypt: true})
      });
    }
  }

  handleDeleteDoc = (props) => {
    this.props.handleDeleteDoc(props);
    this.setState({ loading: true })
  }

  dateFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.dateFilter(props)
    })
  }

  tagFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.tagFilter(props)
    })
  }

  collabFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.collabFilter(props)
    })
  }

  handleDelete = () => {
    console.log(this.state.doc)
    this.setState({ open: false }, () => {
      this.props.handleDeleteDoc(this.state.doc)
    })
  }

  render() {
    const steps = [
      {
        content: <h2>This is where you will create and manage your documents.</h2>,
        placement: "center",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "body"
      },
      {
        content: <p>This is the document grid. Your existing documents will be displayed here and can be accessed by clicking the document title.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "table.table"
      },
      {
        content: <p>By clicking new, you will create a new document and be redirected into that document.</p>,
        placement: "top",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".column button.secondary"
      },
      {
        content: <p>You can filter by the creation date of your documents, tags you have applied to your documents, or the people you have shared with.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".filter a"
      },
      {
        content: <p>The search box lets you search across all your documents. Just start typing the title you are looking for.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".input input"
      }
    ]

    const { displayMessage, results, docs, graphitePro, filteredValue, appliedFilter, singleDocTags, contacts, currentPage, docsPerPage, loading } = this.props;
    const teamView = this.state.teamView;
    const {visible} = this.state;
    const link = '/documents/doc/' + this.props.tempDocId;
    if (this.props.redirect) {
      return <Redirect push to={link} />;
    }
    let teamDocs = docs.filter(doc => doc.teamDoc === true);

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    // const currentDocs = filteredValue.slice(0).reverse();
    const currentDocs = filteredValue.sort(function(a,b){return new Date(b.updated) - new Date(a.updated)});
    let shared = currentDocs.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentDocs.map(a => a.singleDocTags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentDocs.map(a => a.updated);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })


    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(filteredValue.length / docsPerPage); i++) {
     pageNumbers.push(i);
   }

   const pageNumbersTeam = [];
   for (let i = 1; i <= Math.ceil(teamDocs.length / docsPerPage); i++) {
     pageNumbersTeam.push(i);
   }

   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.props.currentPage.toString() === number.toString()} onClick={() => this.props.handlePageChange(number)} />
          );
        });

        const renderTeamPageNumbers = pageNumbersTeam.map(number => {
               return (
                 <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.props.currentPage.toString() === number.toString()} onClick={() => this.props.handlePageChange(number)} />
               );
             });
    if(teamView && !loading) {
      return (

        <div>
          <Header
            graphitePro={graphitePro}
          />
          <Container style={{marginTop:"65px"}}>

            <Grid stackable columns={2}>
              <Grid.Column>
                <h2>Team Documents ({teamDocs.length})</h2>
              </Grid.Column>
              <Grid.Column>
                <Input onChange={this.props.filterList} icon='search' placeholder='Search...' />
              </Grid.Column>
            </Grid>

            {graphitePro ? <Icon className="teamButton" onClick={() => this.setState({ teamView: !this.state.teamView })} name='group' style={{ float: "right", margin: "10px"}} /> : null}
            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Static File</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {
                  teamDocs.slice(indexOfFirstDoc, indexOfLastDoc).reverse().map(doc => {
                  return(
                    <Table.Row key={doc.id}>
                      <Table.Cell><Link to={'/documents/single/shared/'+ doc.user + '/' + doc.id}>{doc.title ? doc.title : "Untitled"}</Link></Table.Cell>
                      <Table.Cell>{this.state.user}</Table.Cell>
                      <Table.Cell>{doc.rtc === true ? "False" : "True"}</Table.Cell>
                      <Table.Cell>{doc.shared}</Table.Cell>
                    </Table.Row>
                  );
                  })
                }
              </Table.Body>
            </Table>
            <div>
            {
              pageNumbersTeam.length > 0 ?
              <div style={{maxWidth: "50%", margin:"auto"}}>
                <Menu pagination>
                {renderTeamPageNumbers}
                </Menu>
              </div> :
              <div />
            }
              <div style={{float: "right", marginBottom: "25px"}}>
                <label>Docs per page</label>
                <select value={this.props.docsPerPage} onChange={this.props.setDocsPerPage}>
                  <option value={10}>
                  10
                  </option>
                  <option value={20}>
                  20
                  </option>
                  <option value={50}>
                  50
                  </option>
                </select>
              </div>
            </div>

          </Container>
        </div>
      );
    } else if(!loading) {
      return (
        <div>
          <Header
            graphitePro={graphitePro}
          />
          <Container style={{marginTop:"65px"}}>
          <Joyride
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            run={this.state.run}
            steps={steps}
            callback={this.handleJoyrideCallback}
          />
            <Grid stackable columns={2}>
              <Grid.Column>
                <h2>Documents ({filteredValue.length})
                  <Button onClick={this.props.handleaddItem} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>
                  {appliedFilter === false ? <span className="filter"><a onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer"}}>Filter<Icon name='caret down' /></a></span> : <span className="hide"><a>Filter</a></span>}
                  {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={this.props.clearFilter}>Clear</Label></span> : <div />}
                </h2>
              </Grid.Column>
              <Grid.Column>
                <Input onChange={this.props.filterList} icon='search' placeholder='Search...' />
              </Grid.Column>
            </Grid>

              <Sidebar
                as={Menu}
                animation='overlay'
                icon='labeled'
                inverted
                onHide={() => this.setState({ visible: false })}
                vertical
                visible={visible}
                width='thin'
                style={{width: "250px"}}
              >


                <Menu.Item as='a'>
                  Tags
                  <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
                    <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
                    {
                      uniqueTags.map(tag => {
                        return (
                          <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.tagFilter(tag)} />
                        )
                      })
                    }
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
                <Menu.Item as='a'>
                  Collaborators
                  <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
                    <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
                    {
                      uniqueCollabs.map(collab => {
                        return (
                          <Dropdown.Item key={Math.random()} text={collab} onClick={() => this.collabFilter(collab)} />
                        )
                      })

                    }
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
                <Menu.Item as='a'>
                  Date
                  <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
                    <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
                    {
                      uniqueDate.map(date => {
                        return (
                          <Dropdown.Item key={Math.random()} text={date} onClick={() => this.dateFilter(date)} />
                        )
                      })

                    }
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
              </Sidebar>

            {graphitePro ? <Icon className="teamButton" onClick={() => this.setState({ teamView: !this.state.teamView })} name='group' style={{ float: "right", margin: "10px"}} /> : null}
            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Collaborators</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {
                  currentDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
                    var tags;
                    var collabs;
                    let uniqueCollaborators;
                    if(doc.tags) {
                      tags = Array.prototype.slice.call(doc.tags);
                    } else if(doc.singleDocTags) {
                      tags = Array.prototype.slice.call(doc.singleDocTags);
                    } else {
                      tags = [];
                    }
                    if(doc.sharedWith) {
                      collabs = Array.prototype.slice.call(doc.sharedWith);
                      uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index)
                    } else {
                      collabs = [];
                      uniqueCollaborators = [];
                    }

                  return(
                    <Table.Row key={doc.id}>
                      <Table.Cell><Link to={'/documents/doc/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <Icon name='globe' /> : <Icon name='lock' />}</span></Link></Table.Cell>
                      <Table.Cell>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</Table.Cell>
                      <Table.Cell>{doc.updated}</Table.Cell>
                      <Table.Cell>{tags === "" ? tags : tags.join(', ')}</Table.Cell>
                      <Table.Cell>
                        <Dropdown icon='ellipsis vertical' className='actions'>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <Modal closeIcon style={{borderRadius: "0"}} trigger={<Link to={'/documents'} style={{color: "#282828"}}><Icon name='share alternate'/>Share</Link>}>
                                <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Document</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>
                                    <h3>Search for a contact</h3>
                                    <Input icon='users' iconPosition='left' placeholder='Search users...' onChange={this.props.handleNewContact} />
                                    <Item.Group divided>
                                    {results.map(result => {
                                      let profile = result.profile;
                                      let image = profile.image;
                                      let imageLink;
                                      if(image !=null) {
                                        if(image[0]){
                                          imageLink = image[0].contentUrl;
                                        } else {
                                          imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                                        }
                                      } else {
                                        imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                                      }

                                        return (
                                            <Item className="contact-search" onClick={() => this.props.sharedInfo(result.fullyQualifiedName, doc)} key={result.username}>
                                            <Item.Image size='tiny' src={imageLink} />
                                            <Item.Content verticalAlign='middle'>{result.username}</Item.Content>
                                            </Item>
                                            )
                                          }
                                        )
                                    }
                                    </Item.Group>
                                    <hr />
                                    <Item.Group divided>
                                    <h4>Your Contacts</h4>
                                    {contacts.slice(0).reverse().map(contact => {
                                      return (
                                        <Item className="contact-search" onClick={() => this.props.sharedInfo(contact.contact, doc)} key={contact.contact}>
                                          <Item.Image size='tiny' src={contact.img} />
                                          <Item.Content verticalAlign='middle'>{contact.contact}</Item.Content>
                                        </Item>
                                      )
                                    })
                                  }
                                  </Item.Group>
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Modal closeIcon trigger={<Link onClick={() => this.props.loadSingleTags(doc)} to={'/documents'} style={{color: "#282828"}}><Icon name='tag'/>Tag</Link>}>
                                <Modal.Header>Manage Tags</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>
                                  <Input placeholder='Type a tag...' value={this.props.tag} onChange={this.props.handleTagChange} />
                                  <Button onClick={() => this.props.addTagManual(doc, 'document')} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                                  {
                                    singleDocTags.slice(0).reverse().map(tag => {
                                      return (
                                        <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                          {tag}
                                          <Icon onClick={() => this.props.deleteTag(tag, 'document')} name='delete' />
                                        </Label>
                                      )
                                    })
                                  }
                                  <div>
                                    <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => this.props.saveNewTags(doc)}>Save Tags</Button>
                                  </div>
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item>
                              <Modal open={this.state.open} trigger={
                                <a onClick={() => this.setState({ open: true, doc: doc })} to={'/documents'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                              } basic size='small'>
                                <SemanticHeader icon='trash alternate outline' content={this.state.doc.title ? 'Delete ' + this.state.doc.title + '?' : 'Delete document?'} />
                                <Modal.Content>
                                  <p>
                                    The document cannot be restored.
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
                                        <Button onClick={this.handleDelete} color='red' inverted>
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
            <div>
            {
              pageNumbers.length > 0 ?
              <div style={{maxWidth: "50%", margin:"auto"}}>
                <Menu pagination>
                {renderPageNumbers}
                </Menu>
              </div> :
              <div />
            }
              <div style={{float: "right", marginBottom: "25px"}}>
                <label>Docs per page</label>
                <select value={this.props.docsPerPage} onChange={this.props.setDocsPerPage}>
                  <option value={10}>
                  10
                  </option>
                  <option value={20}>
                  20
                  </option>
                  <option value={50}>
                  50
                  </option>
                </select>
              </div>
            </div>
            {displayMessage ?
              <Message
                style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
                header='This user has not yet logged into Graphite'
                content='Ask them to log in first so that you can share encrypted files.'
              /> :
              null
            }

          </Container>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }


  }
}
