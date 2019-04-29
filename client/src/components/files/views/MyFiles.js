import React, { Component, setGlobal } from 'reactn';
import { Input, Button, Table, Icon, Dropdown, Modal, Menu, Label, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ToastsStore} from 'react-toasts';
const vault = require('../helpers/vault');
const share = require('../helpers/vaultShare');
const fileTags = require('../helpers/vaultTags');

class MyFiles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            open: false,
            file: {},
            onboarding: false,
            run: false
        }
    }

    tagModal = (file) => {
        setGlobal({tagModalOpen: true})
        fileTags.loadSingleVaultTags(file)
    }

    handleDelete = () => {
      this.setState({ open: false });
      let file = this.state.file;
      vault.handleDeleteVaultItem(file)
    }

    handleShare = (file) => {
      setGlobal({sharefileModalOpen: true});
      this.setState({ file: file});
    }

    copyLink = () => {
      /* Get the text field */
      var copyText = document.getElementById("copyLink");
      /* Select the text field */
      copyText.select();
  
      /* Copy the text inside the text field */
      document.execCommand("copy");
      ToastsStore.success(`Link copied`)
    }

  render() {
      const { currentFiles, indexOfFirstFile, indexOfLastFile, contacts, pageNumbers, renderPageNumbers } = this.props;
      const { tag, tags, tagModalOpen, sharefileModalOpen, userSession } = this.global;
      let vaultTags;
      if(tags) {
          vaultTags = tags;
      } else {
          vaultTags = [];
      }

      return (
        <div>
         <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared With</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Uploaded</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              currentFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
                var tags;
                var collabs;
                var uniqueCollaborators;
                if(file.tags) {
                  tags = Array.prototype.slice.call(file.tags);
                } else {
                  tags = [];
                }
                if(file.sharedWithSingle) {
                  collabs = Array.prototype.slice.call(file.sharedWithSingle);
                  uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index);
                } else {
                  collabs = [];
                  uniqueCollaborators = [];
                }

              return(
                <Table.Row key={file.id} style={{ marginTop: "35px"}}>
                  <Table.Cell><Link to={'/files/' + file.id}>{file.name ? file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name : "Untitled"}</Link></Table.Cell>
                  <Table.Cell>
                    {uniqueCollaborators === [] ? uniqueCollaborators : uniqueCollaborators.join(', ')}
                    {uniqueCollaborators.length > 0 ?
                    <Modal trigger={
                        <span style={{marginLeft: "5px"}}><Icon style={{color: "#4183c4", cursor: "pointer"}} name="linkify" /></span>
                      }
                        size='small'
                        closeIcon
                      >
                        <Modal.Content>
                          <Modal.Description className='link-modal'>
                            <p>Provide your contact this link for quick access:</p>
                            <Input readOnly id="copyLink" value={`${window.location.origin}/shared/files/fileInfo&user=${userSession.loadUserData().username}&id=${file.id}`} />
                            <p className="margin-top-10"><Button onClick={this.copyLink} secondary>Copy Link</Button><Icon onClick={this.copyLink} style={{cursor: "pointer", marginLeft: "10px"}} name="copy" /></p>
                          </Modal.Description>
                        </Modal.Content>
                    </Modal> :
                    <span className="hide"></span>
                    }
                  </Table.Cell>
                  <Table.Cell>{file.uploaded}</Table.Cell>
                  <Table.Cell>{tags === [] ? tags : tags.join(', ')}</Table.Cell>
                  <Table.Cell>
                    <Dropdown icon='ellipsis vertical' className='actions'>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <Modal 
                          closeIcon 
                          style={{borderRadius: "0"}} 
                          trigger={<button onClick={() => this.handleShare(file)} className="link-button" style={{color: "#282828"}}><Icon name='share alternate'/>Share</button>}
                          open={sharefileModalOpen}
                          onClose={() => setGlobal({ sharefileModalOpen: false})}
                          >
                            <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share File</Modal.Header>
                            <Modal.Content>
                              <Modal.Description>
                                <Item.Group divided>
                                <h4>Your Contacts</h4>
                                {contacts.slice(0).reverse().map(contact => {
                                  return (
                                    <Item key={contact.id || contact.contact} className="contact-search" onClick={() => share.sharedVaultInfo(contact, this.state.file)}>
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
                            trigger={<button className="link-button" onClick={() => this.tagModal(file)} style={{color: "#282828"}}><Icon name='tag'/>Tag</button>}
                            open={tagModalOpen}
                            onClose={() => setGlobal({tagModalOpen: false})}
                            >
                            <Modal.Header>Manage Tags</Modal.Header>
                            <Modal.Content>
                              <Modal.Description>
                              <Input placeholder='Type a tag...' value={tag} onKeyUp={fileTags.checkKey} onChange={fileTags.setVaultTags} />
                              <Button onClick={() => fileTags.addVaultTagManual(file, 'vault')} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                              {
                                vaultTags.slice(0).reverse().map(tag => {
                                  return (
                                    <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                      {tag}
                                      <Icon onClick={() => fileTags.deleteVaultTag(tag, 'vault')} name='delete' />
                                    </Label>
                                  )
                                })
                              }
                              <div>
                                <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => fileTags.saveTags(file)}>Save Tags</Button>
                              </div>
                              </Modal.Description>
                            </Modal.Content>
                          </Modal>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>
                          <Modal open={this.state.open} trigger={
                            <button className="link-button" onClick={() => this.setState({ open: true, file: file })} to={'/vault'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</button>
                          } basic size='small'>
                            <SemanticHeader icon='trash alternate outline' content={this.state.file.name ? 'Delete ' + this.state.file.name + '?' : 'Delete file?'} />
                            <Modal.Content>
                              <p>
                                The file cannot be restored.
                              </p>
                            </Modal.Content>
                            <Modal.Actions>
                              <div>
                                <div>
                                  <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
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
          <div>
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
              <label>Files per page</label>
              <span className="custom-dropdown small">
              <select className="ui selection dropdown custom-dropdown" onChange={vault.setVaultPages}>
              <option value={10}>
              10
              </option>
              <option value={20}>
              20
              </option>
              <option  value={50}>
              50
              </option>
          </select>
          </span>
          </div>
          </div>
        </div>
       );
  }
}

export default MyFiles;
