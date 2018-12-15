import React, { Component } from "react";
import { Modal, Input, Button, Item } from 'semantic-ui-react';
import { loadUserData } from 'blockstack';

export default class Menu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    }
  }

  doCommand = (props) => {
    if(props === 'undo') {
      window.document.execCommand('undo')
    } else if(props === 'redo') {
      window.document.execCommand('redo')
    } else if(props === 'copy') {
      console.log('copy')
      window.document.execCommand('copy')
    }
  }

  handleShare = (props) => {
    this.props.sharedInfoSingleDocRTC(props);
    this.setState({modalOpen: false})
  }

  render() {

    const { title, results, contacts, teamList, gaiaLink, singleDocIsPublic, readOnly } = this.props;

    return (

              <div className="cm-e-menu">
                  <ul>
                      <li className="topmenu">
                          <a>file</a>
                          <ul className="submenu">
                              <li><a onClick={this.props.handleaddItem}>New document</a></li>
                              {/*<li><a>Add tag</a></li>*/}
                              <li className="divider-menu"><hr /></li>
                              <li><Modal
                                trigger={<a onClick={() => this.setState({ modalOpen: true })}>rename</a> }
                                closeIcon
                                open={this.state.modalOpen}
                                closeOnEscape={true}
                                closeOnDimmerClick={true}
                                onClose={() => this.setState({ modalOpen: false})}
                                >
                                <Modal.Header>Edit Document Title</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>

                                    {
                                      title === "Untitled" ?
                                      <div>
                                      Title <br/>
                                      <Input
                                        placeholder="Give it a title"
                                        type="text"
                                        value=""
                                        onChange={this.props.handleTitleChange}
                                      />
                                      </div>
                                      :
                                      <div>
                                      Title<br/>
                                      <Input
                                        placeholder="Title"
                                        type="text"
                                        value={title}
                                        onChange={this.props.handleTitleChange}
                                      />
                                      <Button onClick={() => this.setState({ modalOpen: false })} style={{ borderRadius: "0"}} secondary>Save</Button>
                                      </div>
                                    }
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal></li>
                              <li><a href={'/documents/doc/delete/'+ window.location.href.split('doc/')[1]}>delete</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li>
                                  <a>Download</a>
                                  <ul className="submenu">
                                      <li><a onClick={() => this.props.downloadDoc('word')}>Microsoft Word (.docx)</a></li>
                                      {/*<li><a onClick={() => this.props.downloadDoc('odt')}>OpenDocument (.odt)</a></li>
                                      <li><a onClick={() => this.props.downloadDoc('rtf')}>Rich Text (.rtf)</a></li>*/}
                                      <li><a onClick={() => this.props.downloadDoc('txt')}>Plain Text (.txt)</a></li>
                                      <li><a onClick={() => this.props.downloadDoc('pdf')}>PDF (.pdf)</a></li>

                                  </ul>
                              </li>
                              <li><a onClick={this.props.print}>Print</a></li>
                          </ul>
                      </li>
                      { this.props.mediumConnected ? Object.keys(this.props.mediumConnected).length > 0 && this.props.graphitePro ?
                        <li className="topmenu">
                          <a>Export</a>
                          <ul className="submenu">
                            <li><a>Post to Medium</a></li>
                          </ul>
                        </li> :
                        <li className="hide"></li> : <li className="hide"></li>
                      }


                      <li className="topmenu">
                      <a>Share</a>
                      <ul className="submenu">
                          <li>
                            <Modal closeIcon style={{borderRadius: "0"}}
                              trigger={<a>Public link</a>}>
                              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Publicly</Modal.Header>
                              <Modal.Content>
                                <Modal.Description>
                                  <h3>Search for a contact</h3>
                                  <p>This data is not encrypted and can be accessed by anyone with the link that will be generated.</p>
                                  {
                                    singleDocIsPublic === true ?
                                    <div>
                                      <p style={{marginBottom: "15px"}}>This document is already being shared publicly.</p>

                                      <Button style={{ borderRadius: "0" }} onClick={this.props.toggleReadOnly} color="green">{readOnly === true ? "Make Editable" : "Make Read-Only"}</Button>
                                      <Button style={{ borderRadius: "0" }} onClick={this.props.stopSharing} color="red">Stop Sharing Publicly</Button>
                                      <p style={{marginTop: "15px", marginBottom: "15px"}}>
                                        {readOnly === true ? "This shared document is read-only." : "This shared document is editable."}
                                      </p>
                                    </div>
                                    :
                                    <Button style={{ borderRadius: "0" }} secondary onClick={this.props.sharePublicly}>Share Publicly</Button>
                                  }

                                  {
                                    gaiaLink !== "" ?
                                    <div>
                                      <p><a href={gaiaLink}>{gaiaLink}</a></p>
                                    </div>
                                    :
                                    <div className="hide" />
                                  }
                                </Modal.Description>
                              </Modal.Content>
                            </Modal>

                          </li>
                          {
                            this.props.graphitePro ? <li>
                            <Modal closeIcon style={{borderRadius: "0"}}
                              trigger={<a>Share with team</a>}>
                              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share With Team</Modal.Header>
                              <Modal.Content>
                                <Modal.Description>
                                  <h3>Search for a contact</h3>
                                  <p>By sharing with your entire team, each teammate will have immediate access to the document and will be able to collaborate in real-time.</p>
                                  <p>For reference, you can see your list of teammates below:</p>
                                  <Item.Group divided>
                                  {teamList.map(mate => {
                                      return (
                                          <Item className="contact-search" key={mate.name}>
                                          <Item.Content verticalAlign='middle'>{mate.email}
                                          <br/>
                                          {mate.role}
                                          </Item.Content>
                                          </Item>
                                          )
                                        }
                                      )
                                  }
                                  </Item.Group>
                                  <Button secondary style={{borderRadius: "0"}} onClick={this.props.shareToTeam}>Share</Button>
                                </Modal.Description>
                              </Modal.Content>
                            </Modal>
                            </li> :
                            <li className="hide"></li>
                          }
                          {
                            this.props.teamDoc && this.props.userRole === "User" ?
                            <li className="hide">Share</li> :
                            <li>
                            <Modal
                              closeIcon
                              style={{borderRadius: "0"}}
                              trigger={<a onClick={() => this.setState({ modalOpen: true})}>Share with contact</a>}
                              open={this.state.modalOpen}
                              closeOnEscape={true}
                              closeOnDimmerClick={true}
                              onClose={() => this.setState({ modalOpen: false})}
                              >
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
                                          <Item className="contact-search" key={result.username}>
                                          <Item.Image size='tiny' src={imageLink} />
                                          <Item.Content verticalAlign='middle'>{result.username} <br/>
                                            <Modal closeIcon style={{borderRadius: "0"}}
                                              trigger={<Button onClick={() => this.handleShare(result.fullyQualifiedName) } color='green' style={{borderRadius: "0"}}>Share</Button>}>
                                              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Publicly</Modal.Header>
                                              <Modal.Content>
                                                <Modal.Description>
                                                  <h3>Shared!</h3>
                                                  <p>Here is the link you can provide with the person you shared with for quick access: </p>
                                                  <p style={{wordWrap: "break-word"}}>{window.location.origin + '/documents//single/shared/' + loadUserData().username + window.location.href.split('doc/')[1]}</p>
                                                </Modal.Description>
                                              </Modal.Content>
                                            </Modal>
                                            <Modal closeIcon style={{borderRadius: "0"}}
                                              trigger={<Button onClick={() => this.props.sharedInfoSingleDocStatic(result.fullyQualifiedName) } color='blue' style={{borderRadius: "0"}}>Share Read-Only</Button>}>
                                              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Publicly</Modal.Header>
                                              <Modal.Content>
                                                <Modal.Description>
                                                  <h3>Shared!</h3>
                                                  <p>Here is the link you can provide with the person you shared with for quick access: </p>
                                                  <p style={{wordWrap: "break-word"}}>{window.location.origin + '/documents//single/shared/' + loadUserData().username + window.location.href.split('doc/')[1]}</p>
                                                </Modal.Description>
                                              </Modal.Content>
                                            </Modal>

                                          </Item.Content>
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
                                      <Item className="contact-search" key={contact.contact}>
                                        <Item.Image size='tiny' src={contact.img} />
                                        <Item.Content verticalAlign='middle'>{contact.contact} <br/> <Button onClick={() => this.props.sharedInfoSingleDocRTC(contact.contact) } color='green' style={{borderRadius: "0"}}>Share</Button><Button onClick={() => this.props.sharedInfoSingleDocStatic(contact.contact) } color='blue' style={{borderRadius: "0"}}>Share Read-Only</Button></Item.Content>
                                      </Item>
                                    )
                                  })
                                }
                                </Item.Group>
                                </Modal.Description>
                              </Modal.Content>
                            </Modal>
                            </li>
                          }
                      </ul>
                      </li>
                      <li className="topmenu">
                          <a>Info</a>
                          <ul className="submenu">
                              <li><a href="https://github.com/Graphite-Docs/graphite" target="_blank" rel="noopener noreferrer">github</a></li>
                              <li><a href="https://graphitedocs.com/about" target="_blank" rel="noopener noreferrer">about</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a href="https://github.com/Graphite-Docs/graphite/issues" target="_blank" rel="noopener noreferrer">bug report</a></li>
                          </ul>
                      </li>
                      <li className="topmenu">
                          <a>Page settings</a>
                          <ul className="submenu">
                              <li><a onClick={() => this.props.formatSpacing('single')}>Single Space</a></li>
                              <li onClick={() => this.props.formatSpacing('double')}><a>Double Space</a></li>
                          </ul>
                      </li>
                  </ul>
              </div>
    );
  }
}
