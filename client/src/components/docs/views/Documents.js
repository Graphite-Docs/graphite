import React, { Component, setGlobal } from 'reactn';
import { Container, Input, Grid, Button, Table, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Loading from '../../shared/views/Loading';
import Skeleton from './Skeleteon';
import Nav from '../../shared/views/Nav';
const gdocs = require('../helpers/documents');
const share = require('../helpers/docsCollectionShare')
const colTags = require('../helpers/docsCollectionTags');

class Documents extends Component {
    constructor(props) {
        super(props);
        this.state = {
          contactToShareWith: "",
          open: false,
          visible: false,
          doc: {},
          run: false,
          onboarding: false
        }
    }


    dateFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.dateFilter(props)
        })
    }

    tagFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.tagFilter(props)
        })
    }

    collabFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.collabFilter(props)
        })
    }

    handleDelete = () => {
        const {selectedDoc} = this.global;
        gdocs.deleteDoc(selectedDoc)
    }

    shareDoc = (contact) => {
        const { selectedDoc } = this.global;
        share.sharedInfo({contact: contact, doc: selectedDoc});
    }

    handleTagModal = (doc) => {
        setGlobal({tagModalOpen: true})
        colTags.loadSingleDoc(doc)
    }
  render() {
    const { visible } = this.state;
    const { deleteModalOpen, selectedDoc, tagModalOpen, shareModalOpen, results, filteredDocs, appliedFilter, singleDocTags, contacts, currentPage, docsPerPage, loading, tag } = this.global;
    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = filteredDocs.sort((a, b) => parseFloat(b.lastUpdate) - parseFloat(a.lastUpdate));
    // const currentDocs = filteredDocs.sort(function(a,b){return new Date(b.lastUpdate) - new Date(a.lastUpdate)});
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
    for (let i = 1; i <= Math.ceil(filteredDocs.length / docsPerPage); i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => {
            return (
                <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => gdocs.handlePageChange(number)} />
            );
            });

      if(loading) {
          return (
              <Skeleton />
          )
      } else {
        return (
            <div>
                <Nav />
                <Container className='margin-top-65'>
                    <Grid stackable columns={2}>
                        <Grid.Column>
                        <h2>Documents ({filteredDocs.length})
                            {/* <Button onClick={this.handleaddItem} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button> */}
                            <Link to={`/documents/new/${Date.now()}`}><Button style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button></Link>
                            {appliedFilter === false ? <span className="filter"><button className='link-button' onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer", color: "#4183c4"}}>Filter<Icon name='caret down' /></button></span> : <span className="hide"><button className='link-button' style={{color: "#4183c4"}}>Filter</button></span>}
                            {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={gdocs.clearFilter}>Clear</Label></span> : <div />}
                        </h2>
                        </Grid.Column>
                        <Grid.Column>
                            <Input className='search-box' onChange={gdocs.filterList} icon='search' placeholder='Search...' />
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
                                <Table.Cell><Link to={'/documents/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <Icon name='globe' /> : <Icon name='lock' />}</span></Link></Table.Cell>
                                <Table.Cell>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</Table.Cell>
                                <Table.Cell>{doc.updated}</Table.Cell>
                                <Table.Cell>{tags === "" ? tags : tags.join(', ')}</Table.Cell>
                                <Table.Cell>
                                <Dropdown icon='ellipsis vertical' className='actions'>
                                    <Dropdown.Menu>
                                    <Dropdown.Item>
                                        <Modal 
                                        open={shareModalOpen}
                                        onClose={() => setGlobal({shareModalOpen: false})} 
                                        closeIcon style={{borderRadius: "0"}} 
                                        trigger={<button className='link-button' onClick={() => setGlobal({shareModalOpen: true, selectedDoc: doc})} style={{color: "#282828"}}><Icon name='share alternate'/>Share</button>}>
                                        <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Document</Modal.Header>
                                        <Modal.Content>
                                            <Modal.Description>
                                            <h3>Search for a contact</h3><span className='float-right'>Working with a team? <Link to={'/trial'}>Try Graphite Pro free for 30 days</Link></span>
                                            <Input icon='users' iconPosition='left' placeholder='Search users...' onChange={gdocs.handleNewContact} />
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
                                                    <Item className="contact-search" onClick={() => this.shareDoc(result.fullyQualifiedName)} key={result.username}>
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
                                                <Item className="contact-search" onClick={() => this.shareDoc(contact)} key={contact.contact}>
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
                                        <Modal 
                                        closeIcon 
                                        open={tagModalOpen}
                                        onClose={() => setGlobal({tagModalOpen: false})} 
                                        trigger={<button className='link-button' onClick={() => this.handleTagModal(doc)} style={{color: "#282828"}}><Icon name='tag'/>Tag</button>}>
                                        <Modal.Header>Manage Tags</Modal.Header>
                                        <Modal.Content>
                                            <Modal.Description>
                                            <Input id='tag-input' placeholder='Type a tag...' value={tag} onKeyUp={colTags.checkKey} onChange={colTags.handleTagChange} />
                                            <Button onClick={colTags.addTagManual} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                                            {
                                            singleDocTags.slice(0).reverse().map(tag => {
                                                return (
                                                <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                                    {tag}
                                                    <Icon onClick={() => colTags.deleteTag(tag)} name='delete' />
                                                </Label>
                                                )
                                            })
                                            }
                                            <div>
                                            <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={colTags.saveTags}>Save Tags</Button>
                                            </div>
                                            </Modal.Description>
                                        </Modal.Content>
                                        </Modal>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item>
                                        <Modal 
                                        trigger={
                                        <button className='link-button' onClick={() => setGlobal({ deleteModalOpen: true, selectedDoc: doc })} to={'/documents'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</button>
                                        } 
                                        basic 
                                        size='small'
                                        open={deleteModalOpen}
                                        onClose={() => setGlobal({deleteModalOpen: false})} 
                                        >
                                        <SemanticHeader icon='trash alternate outline' content={selectedDoc.title ? 'Delete ' + selectedDoc.title + '?' : 'Delete document?'} />
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
                                                <Button onClick={() => setGlobal({ deleteModalOpen: false })} basic color='red' inverted>
                                                   No
                                                </Button>
                                                <Button onClick={this.handleDelete} color='red' inverted>
                                                     Delete
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
                    {
                        pageNumbers.length > 0 ?
                        <div style={{textAlign: "center"}}>
                        <Menu pagination>
                        {renderPageNumbers}
                        </Menu>
                        </div> :
                        <div />
                    }
                    <div style={{float: "right", marginBottom: "25px"}}>
                      <label>Docs per page</label>
                      <span className="custom-dropdown small">
                      <select className="ui selection dropdown custom-dropdown" value={this.global.docsPerPage} onChange={gdocs.setDocsPerPage}>
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
                    </span>
                    </div>
                  
                </Container>
            </div>
           );
      }
  }
}

export default Documents;
