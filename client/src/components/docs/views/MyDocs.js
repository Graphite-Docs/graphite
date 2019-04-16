import React, { Component, setGlobal } from 'reactn';
import { Input, Button, Table, Icon, Dropdown, Modal, Menu, Label, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ToastsStore} from 'react-toasts';
const gdocs = require('../helpers/documents');
const share = require('../helpers/docsCollectionShare')
const colTags = require('../helpers/docsCollectionTags');

class MyDocs extends Component {
shareDoc = (contact) => {
    const { selectedDoc } = this.global;
    share.sharedInfo({contact: contact, doc: selectedDoc});
}

handleDelete = () => {
    const {selectedDoc} = this.global;
    gdocs.deleteDoc(selectedDoc)
}

handleTagModal = (doc) => {
    setGlobal({tagModalOpen: true})
    colTags.loadSingleDoc(doc)
}

copyLink = () => {
    /* Get the text field */
    var copyText = document.getElementById("copyLink");
    console.log(copyText)
    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    ToastsStore.success(`Link copied`)
  }

  render() {
      const { currentDocs, indexOfFirstDoc, indexOfLastDoc, shareModalOpen, results, contacts, tagModalOpen, tag, singleDocTags, deleteModalOpen, selectedDoc, renderPageNumbers, pageNumbers} = this.props;
      const { userSession } = this.global;
      return (
        <div>
        <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
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
                    <Table.Cell>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')} 
                    {uniqueCollaborators.length > 0 ? 
                    <Modal trigger={
                        <span style={{marginLeft: "5px"}}><Icon style={{color: "#4183c4", cursor: "pointer"}} name="linkify" /></span>
                      }
                        size='small'
                        closeIcon
                      >
                        <Modal.Content>
                          <Modal.Description className='link-modal'>
                            <p>Provide your collaborators this link for quick access:</p>
                            <Input readOnly id="copyLink" value={`${window.location.origin}/documents/docInfo&user=${userSession.loadUserData().username}&id=${doc.id}`} />
                            <p className="margin-top-10"><Button onClick={this.copyLink} secondary>Copy Link</Button><Icon onClick={this.copyLink} style={{cursor: "pointer", marginLeft: "10px"}} name="copy" /></p>
                          </Modal.Description>
                        </Modal.Content>
                    </Modal> :
                    <span className="hide"></span>
                    }
                    </Table.Cell>
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
                                    <div>
                                    <Button onClick={() => setGlobal({ deleteModalOpen: false })} basic color='red' inverted>
                                        No
                                    </Button>
                                    <Button onClick={this.handleDelete} color='red' inverted>
                                            Delete
                                    </Button>
                                    </div>
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
        </div>
       );
  }
}

export default MyDocs;