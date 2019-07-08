import React, { setGlobal } from 'reactn';
import { exportAsWord, exportAsRTF, exportAsTXT } from '../../helpers/exportHelpers';
import { handlePageSettings, lineHeight } from '../../helpers/settings';
import Countable from 'countable';
import { Modal, Button, Item, Accordion, Icon } from 'semantic-ui-react';
const share = require('../../helpers/shareDoc');
const single = require('../../helpers/singleDoc');
const docCol = require('../../helpers/docsCollectionShare');

export default class MenuBar extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
          menuSelection: "file", 
          activeIndex: 0, 
          modalOpen: false, 
      }
  }

  shareDoc = (params) => {
    docCol.sharedInfo(params)
    this.setState({modalOpen: false})
  }

  handleClose = () => this.setState({ versionModal: false });

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleSelection = async (menuSelection) => {
    let menus = document.getElementsByClassName('menu-drops');
      for (const menu of menus) {
          menu.style.display = "none";
      }
      if(menuSelection === "file") {
        await this.setState({ menuSelection })
        document.getElementById('file-drop').style.display = "inline-block";
      } else if(menuSelection === "edit") {
        await this.setState({ menuSelection })
        document.getElementById('edit-drop').style.display = "inline-block";
      } else if(menuSelection === "insert") {
        await this.setState({ menuSelection })
        document.getElementById('insert-drop').style.display = "inline-block";
      } else if(menuSelection === "format") {
        await this.setState({ menuSelection })
        document.getElementById('format-drop').style.display = "inline-block";
      } else if(menuSelection === "tools") {
        await this.setState({ menuSelection })
        document.getElementById('tools-drop').style.display = "inline-block";
      } else if(menuSelection === 'share') {
        await this.setState({ menuSelection })
        document.getElementById('share-drop').style.display = "inline-block";
      }

      if(document.getElementById('table-drop')) {
        document.getElementById('table-drop').style.display = "none";
      }
      if(document.getElementById('shape-menu')) {
        document.getElementById('shape-menu').style.display = "none";
      }

  }

  triggerFilePicker = (event) => {
    document.getElementById('file-input-menu').click()
  }

  handleTableModal = () => {
     document.getElementById('insert-drop').style.display = "none";
     document.getElementById('table-drop').style.display = "inline-block";
  }

  handleShapeList = () => {
      document.getElementById('insert-drop').style.display = "none";
      document.getElementById('shape-menu').style.display = "block";
  }

  handleWordModal = () => {
    if(document.getElementById('editor-section')) {
        Countable.count(document.getElementById('editor-section'), (counter) => setGlobal({ words: counter.words, paragraphs: counter.paragraphs, sentences: counter.sentences, charactersNoSpaces: counter.characters, charactersSpaces: counter.all }), {
            hardReturns: false,
            stripTags: true,
            ignore: []
        })
    }
      document.getElementById('tools-drop').style.display = "none";
      document.getElementById('dimmer').style.display = 'block';
      document.getElementById('word-modal').style.display = 'block';
  }

  commentModal = () => {
    document.getElementById('tools-drop').style.display = "none";
    document.getElementById('comment-review-modal').style.display = 'block';
  }

  handlePrint = () => {
      const { marginRight, marginLeft, marginTop, marginBottom, orientation } = this.global;
      var cssPagedMedia = (function () {
            var style = document.createElement('style');
            document.head.appendChild(style);
            return function (rule) {
                style.innerHTML = rule;
            };
        }());
        
        cssPagedMedia.size = function (size) {
            cssPagedMedia(`@page {size: ' + ${size} + '; margin-top: ${marginTop}in; margin-bottom: ${marginBottom}in; margin-right: ${marginRight}in; margin-left: ${marginLeft}in;}`);
        };
        
        cssPagedMedia.size(orientation);
      let content = document.getElementById('editor-section').innerHTML;
      let printContainer = document.getElementById('print-container')
      printContainer.innerHTML = content;
      window.print();
  }

  render() {
    const { activeIndex, menuSelection } = this.state;
    const { contacts, userSession, singleDoc, graphitePro, proOrgInfo, teamListModalOpen, teamShare } = this.global;
    let docId;
    if(window.location.href.includes("new")) {
        docId = window.location.href.split("new/")[1];
    } else {
        docId = singleDoc.id;
    }
    const teamList = proOrgInfo ? proOrgInfo.teams ? proOrgInfo.teams : [] : [];
    return (
    <div className="menu-bar no-print" >
        <ul>
            <li><span onClick={() => this.handleSelection('file')}>File</span>
                {
                    menuSelection === "file" ? 
                    <div style={{display: "none"}} id="file-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={exportAsWord}>Export to DOCX</li>
                            <li onClick={exportAsRTF}>Export to RTF</li>
                            <li onClick={exportAsTXT}>Export to TXT</li>
                            <li className="divider"></li>
                            <li onClick={handlePageSettings}>Page Settings</li>
                            <li onClick={this.handlePrint}>Print</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('edit')}>Edit</span>
                {
                    menuSelection === "edit" ? 
                    <div style={{display: "none"}} id="edit-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={(e) => this.props.onClickBlock(e, 'undo')}>Undo</li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'redo')}>Redo</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('insert')}>Insert</span>
                {
                    menuSelection === "insert" ? 
                    <div style={{display: "none"}} id="insert-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={this.triggerFilePicker}>Image
                                <input onChange={this.props.onImageClick} style={{display: "none"}} type="file" id="file-input-menu" accept=".png, .jpg, .jpeg, .gif" />
                            </li>
                            <li onClick={this.handleTableModal}>Table</li>
                            {/*<li onClick={this.handleShapeList}>Shape</li>*/}
                            <li onClick={(e) => this.props.onClickBlock(e,'hr')}>Horizontal Line</li>
                            <li className="divider"></li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'header')}>Header</li>
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'footer')}>Footer</li>*/}
                            {/*<li>Page Numbers</li>*/}
                            <li onClick={(e) => this.props.onClickBlock(e, 'table-of-contents')}>Table of Contents</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('format')}>Format</span>
                {
                    menuSelection === "format" ? 
                    <div style={{display: "none"}} id="format-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li><span onClick={() => document.getElementById('line-spacing').style.display="inline-block"}>Line Spacing</span>
                                <ul style={{display: "none"}} id="line-spacing">
                                    <li onClick={() => lineHeight('single')}>Single</li>
                                    <li onClick={() => lineHeight('1.50')}>1.50</li>
                                    <li onClick={() => lineHeight('double')}>Double</li>
                                </ul> 
                            </li>
                            <li onClick={handlePageSettings}>Page Settings</li>
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'two-column')}>Two-Column Layout</li>*/}
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'three-column')}>Three-Column Layout</li>*/}
                            <li className="divider"></li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'clear-formatting')}>Clear Formatting</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('tools')}>Tools</span>
                {
                    menuSelection === "tools" ? 
                    <div style={{display: "none"}} id="tools-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={this.handleWordModal}>Word Count</li>
                            {/*<li>Spell Check</li>*/}
                            {/*<li>Grammar</li>*/}
                            <li onClick={this.commentModal}>Review Comments</li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'doc-outline')}>Document Outline</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            {
                userSession.isUserSignedIn() ? 
                <li><span onClick={() => this.handleSelection('share')}>Share</span>
                {
                    menuSelection === "share" ? 
                    <div style={{display: "none"}} id="share-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li>
                            <Modal closeIcon style={{borderRadius: "0"}}
                              trigger={<button className='link-button'>Public Link</button>}>
                              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Publicly</Modal.Header>
                              <Modal.Content>
                                <Modal.Description>
                                  <p>This data is not encrypted and can be accessed by anyone with the link that will be generated.</p>
                                  {
                                    singleDoc.singleDocIsPublic === true ?
                                    <div>
                                      <p style={{marginBottom: "15px"}}>This document is already being shared publicly.</p>

                                      <Button style={{ borderRadius: "0" }} onClick={share.toggleReadOnly} color="green">{singleDoc.readOnly === true ? "Make Editable" : "Make Read-Only"}</Button>
                                      <Button style={{ borderRadius: "0" }} onClick={share.stopSharing} color="red">Stop Sharing Publicly</Button>
                                      <p style={{marginTop: "15px", marginBottom: "15px"}}>
                                        {singleDoc.readOnly === true ? "This shared document is read-only." : "This shared document is editable."}
                                      </p>
                                      <div>
                                        <p><a href={`${window.location.origin}/shared/docs/${userSession.loadUserData().username}-${docId}`}>{`${window.location.origin}/shared/docs/${userSession.loadUserData().username}-${docId}`}</a></p>
                                      </div>
                                    </div>
                                    :
                                    <Button style={{ borderRadius: "0" }} secondary onClick={share.sharePublicly}>Share Publicly</Button>
                                  }

                                </Modal.Description>
                              </Modal.Content>
                            </Modal>

                            </li>
                            <li>
                            <Modal
                                closeIcon
                                style={{borderRadius: "0"}}
                                trigger={<button style={{textAlign: "left"}} className='link-button' onClick={() => this.setState({ modalOpen: true})}>Share With Contact</button>}
                                open={this.state.modalOpen}
                                closeOnEscape={true}
                                closeOnDimmerClick={true}
                                onClose={() => this.setState({ modalOpen: false})}
                                >
                                <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Document</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                    <Item.Group divided>
                                    <h4>Your Contacts</h4>
                                    {contacts.slice(0).reverse().map(contact => {
                                        return (
                                        <Item className="contact-search" key={contact.contact || contact.id}>
                                            <Item.Image size='tiny' src={contact.img || contact.image} />
                                            <Item.Content verticalAlign='middle'>{contact.contact || contact.id} <br/> <Button onClick={() => this.shareDoc({contact: contact, doc: singleDoc, realTime: true })} color='green' style={{borderRadius: "0"}}>Share</Button><Button onClick={() => this.shareDoc({contact: contact, doc: singleDoc, realTime: false })} color='blue' style={{borderRadius: "0"}}>Share Read-Only</Button></Item.Content>
                                        </Item>
                                        )
                                    })
                                    }
                                    </Item.Group>
                                    </Modal.Description>
                                </Modal.Content>
                                </Modal>
                            </li>
                            {
                                graphitePro ? 
                                <li>
                                    <Modal 
                                        open={teamListModalOpen}
                                        onClose={() => setGlobal({ teamListModalOpen: false})}
                                        closeIcon style={{borderRadius: "0"}}
                                        trigger={<button style={{textAlign: "left"}} onClick={() => setGlobal({ teamListModalOpen: true})} className='link-button'>Share With Team</button>}
                                        >
                                        <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share With Team</Modal.Header>
                                        <Modal.Content>
                                            <Modal.Description>
                                            <p>By sharing with your entire team, each teammate will have immediate access to the document and will be able to collaborate in real-time.</p>
                                            <p>For reference, you can see your list of teammates by expanding each team below.</p>
                                            <Item.Group divided>
                                            {teamList.map(team => {
                                                return (
                                                    <Item className="contact-search" key={team.id}>
                                                    <Item.Content verticalAlign='middle'>
                                                    <Accordion>
                                                        <Accordion.Title active={activeIndex === team.id} index={team.id} onClick={this.handleClick}>
                                                        <Icon name='dropdown' />
                                                        {`${team.name} (${team.users.length} members)`}
                                                        </Accordion.Title>
                                                        <Accordion.Content active={activeIndex === team.id}>
                                                        {
                                                            team.users.map(user => {
                                                            return (
                                                                <p key={user.username}>
                                                                {user.username}
                                                                </p>
                                                            )
                                                            })
                                                        }
                                                        </Accordion.Content>
                                                    </Accordion>
                                                    <br/>
                                                    {
                                                        teamShare === false ? 
                                                        <Button style={{float: "right", borderRadius: "0px"}} secondary onClick={() => single.shareWithTeam({teamId: team.id, teamName: team.name, initialShare: true})}>Share</Button> : 
                                                        <div className="hide" />
                                                    }
                                                    </Item.Content>
                                                    </Item>
                                                    )
                                                    }
                                                )
                                            }
                                            </Item.Group>
                                            {teamShare === false ? <div className="hide" /> : <Button style={{borderRadius: "0"}}>Sharing...</Button>}
                                            </Modal.Description>
                                        </Modal.Content>
                                    </Modal>
                                </li> : 
                                <li className="hide" />
                            }
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li> : 
            <li className="hide" />
            }
        </ul>
    </div>
    );
  }
}
