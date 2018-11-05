import React, { Component } from "react";
import { Image, Icon, Modal, Input, Button, Message } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import {
  loadUserData
} from 'blockstack';
import Loading from '../Loading';
import Menu from './Menu';
import QuillEditorPublic from '../QuillEditorPublic.js'; //this will render Yjs...
import QuillEditorPrivate from '../QuillEditorPrivate.js';
const wordcount = require("wordcount");
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      modalOpen: false,
    }
  }

  componentDidMount() {
    this.props.initialDocLoad();
  } //end of componentDidMount


  render() {
    const { displayMessage, userRole, teamDoc, avatars, loadingIndicator, yjsConnected, docLoaded, rtc, idToLoad, content, mediumConnected, graphitePro, loading, save, autoSave, contacts, hideStealthy, revealModule, title, singleDocIsPublic, readOnly, gaiaLink, team} = this.props;
    let teamList;
    if(team) {
      teamList = team;
    } else {
      teamList = []
    }
    let uniqueAva = avatars.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index)
    let words;
    if(content) {
      words = wordcount(content.replace(/<(?:.|\n)*?>/gm, ''));
    } else {
      words = 0;
    }
    const stealthy = (hideStealthy) ? "hide" : "";

    const {length} = contacts
    let users = '&length=' + length
    let k = 0
    for (const i of contacts) {
      users += '&id' + k + "=" + i.contact
      k += 1
    }

    const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
    'http://localhost:3030/?app=gd04012018' :
    'https://www.stealthy.im/?app=gd04012018';
    const stealthyUrl = stealthyUrlStub + users;


    const stealthyModule =  (
      <div className={stealthy}>
        <div id='stealthyCol' className='card'>
          <div className={revealModule}>
            <iframe title="Stealthy" src={stealthyUrl} id='stealthyFrame' />
          </div>
        </div>
      </div>
    )
    // ) : null

    let docFlex;
    if(hideStealthy === true) {
      docFlex = "test-doc-card";
    } else {
      docFlex = "test-with-module";
    }

    if(!loading) {
      return (
        <div>

        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item onClick={this.handleItemClick}>
            <Icon name='arrow left' />
          </MainMenu.Item>
          <MainMenu.Item>
          {
            title
            ?
            (length > 15 ? title.substring(0,15)+"..." : title)
            :
            "Title here..."
          }
          <Modal trigger={<Icon onClick={() => this.setState({ modalOpen: true})} style={{marginLeft: "10px"}} name='edit outline' /> } closeIcon open={this.state.modalOpen}>
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
          </Modal>
          </MainMenu.Item>
          <MainMenu.Item>
            {autoSave}
          </MainMenu.Item>
          <MainMenu.Menu position='right'>
            <MainMenu.Item>
            <ul className="avatar-ul">
              {
                uniqueAva ? uniqueAva.map(img => {
                  let image;
                  if(img.image) {
                    image = img.image[0].contentUrl;
                  } else {
                    image = avatarFallbackImage
                  }
                  return(
                      <li key={img.name} className="avatar-li"><span className="hidden-span">{img.name}</span>
                      <Image src={image} avatar className='shared-avatar circle' /></li>
                  )
                })
                 : <li className="hide" />
              }
              </ul>
            </MainMenu.Item>
            <MainMenu.Item>
              <Image className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/>
            </MainMenu.Item>
          </MainMenu.Menu>
          </MainMenu>
          <Menu
            downloadDoc={this.props.downloadDoc}
            handleaddItem={this.props.handleaddItem}
            formatSpacing={this.props.formatSpacing}
            print={this.props.print}
            modalOpen={this.state.modalOpen}
            handleTitleChange={this.props.handleTitleChange}
            handleNewContact={this.props.handleNewContact}
            sharedInfoSingleDocRTC={this.props.sharedInfoSingleDocRTC}
            sharedInfoSingleDocStatic={this.props.sharedInfoSingleDocStatic}
            results={this.props.results}
            contacts={contacts}
            title={title}
            graphitePro={graphitePro}
            teamDoc={teamDoc}
            userRole={userRole}
            mediumConnected={mediumConnected}
          />

          {displayMessage ?
            <Message
              style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
              header='This user has not yet logged into Graphite'
              content='Ask them to log in first so that you can share encrypted files.'
            /> :
            null
          }

        {/* Team Share Modal */}

        <div id="teamShare" className="modal">
          <div className="modal-content">
            <h4>Share to Your Graphite Pro Team</h4>
            { loadingIndicator === true ?
              <div className="container">
                <Loading />
              </div> :
              <div>
              <p>By sharing with your entire team, each teammate will have immediate access to the document and will be able to collaborate in real-time.</p>
              <p>For reference, you can see your list of teammates below:</p>
              {
                teamList.slice(0).reverse().map(mate => {
                  return (
                    <div key={mate.blockstackId} className="col s12 m7">
                      <div className="card horizontal">
                        <div className="card-stacked">
                          <div className="card-content">
                            <h5 className="header">{mate.name}</h5>
                            <p>{mate.email}</p>
                            <p>{mate.role}</p>
                          </div>

                        </div>
                      </div>
                    </div>
                  )
                })
              }
              </div>
            }
          </div>
          <div className="modal-footer">
            <a onClick={this.props.shareToTeam} className="modal-action btn green">Share</a>
            <a className="modal-action modal-close btn grey">Cancel</a>
            </div>
          </div>

          {/* End Team Share Modal */}

        {/* Public Link Modal */}

        <div id="publicModal" className="modal">
          <div className="modal-content">
            <h4>Share Publicly</h4>
            <p>This data is not encrypted and can be accessed by anyone with the link that will be generated.</p>
            {
              singleDocIsPublic === true ?
              <div>
                <p>This document is already being shared publicly.</p>
                <button onClick={this.props.sharePublicly} className="btn black">Show Link</button>
                <button onClick={this.props.toggleReadOnly} className="btn green">{readOnly === true ? "Make Editable" : "Make Read-Only"}</button>
                <button onClick={this.props.stopSharing} className="btn red">Stop Sharing Publicly</button>
                <p>
                  {readOnly === true ? "This shared document is read-only." : "This shared document is editable."}
                </p>
              </div>
              :
              <button className="btn" onClick={this.props.sharePublicly}>Share publicly</button>
            }

            {
              gaiaLink !== "" ?
              <div>
                <p><a href={gaiaLink}>{gaiaLink}</a></p>
              </div>
              :
              <div className="hide" />
            }
          </div>
          <div className="modal-footer">
            <a className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
          </div>

          {/* End Public Link Modal */}

          {/* Encrypted Collab Modal */}
          <div id="encryptedModal" className="modal">
            <div className="modal-content">
              <h4>Choose How to Share</h4>
              <p>All data is encrypted, but if you choose to enable real-time collaboration, a websockets server will be utilized. If you do not wish to utlize any server, choose "Static Sharing."</p>
              <button onClick={() => this.props.sharedInfoSingleDocRTC(this.state.contactToShareWith)} className='btn green'>Enable Real-Time Collaboration</button>
              <button onClick={() => this.props.sharedInfoSingleDocStatic(this.state.contactToShareWith)} className='btn blue'>Share Static Copy</button>
              <div>
              {rtc === true ?
                <p>Share this link with your collaborator(s) or they can access all shared files next time they log into Graphite. <br/><a href={window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + window.location.href.split('doc/')[1]}>{window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + window.location.href.split('doc/')[1]}</a></p> :
                null
              }
              </div>
            </div>
            <div className="modal-footer">
              <a className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
              </div>
            </div>
          {/* End Encrypted Collab Modal */}


          <div className="test-docs">
            <div className={docFlex}>
              <div className="double-space doc-margin">

                <p className="hide">
                  document access: <span>&nbsp;</span>
                  {
                    (singleDocIsPublic === true) ?
                    <span style={{backgroundColor: "green", color: "white"}}>public</span>
                    :
                    <span style={{backgroundColor: "blue", color: "white"}}>private</span>
                  }
                </p>

              {
                (singleDocIsPublic === true || rtc === true) ?
                <div>
                  {
                    (docLoaded === true) ?
                    <QuillEditorPublic
                      roomId={typeof idToLoad === 'string' || idToLoad instanceof String ? idToLoad : idToLoad.toString()} //this needs to be a string!
                      docLoaded={docLoaded} //this is set by getFile
                      value={content}
                      onChange={this.props.handleChange}
                      getYjsConnectionStatus={this.props.getYjsConnectionStatus} //passing this through TextEdit to Yjs
                      yjsConnected={yjsConnected} //true or false, for TextEdit
                      singleDocIsPublic={singleDocIsPublic} //only calling on Yjs if singleDocIsPublic equals true
                    />
                    :
                    <div className="progress">
                      <div className="indeterminate"></div>
                    </div>
                  }
                </div>
                :
                <div>
                  {
                    (docLoaded === true) ?
                    <QuillEditorPrivate
                      roomId={idToLoad} //this needs to be a string!
                      docLoaded={docLoaded} //this is set by getFile
                      value={content}
                      onChange={this.props.handleChange}
                    />
                    :
                    <div className="progress">
                      <div className="indeterminate"></div>
                    </div>
                  }
                </div>
              }

              <div className="right-align wordcounter">
                <p className="wordcount">
                  {words} words
                </p>
              </div>
              <div className={save}></div>
            </div>
            {stealthyModule}
          </div>
        </div>
      </div>
    );

    } else {
      return(
        <Loading />
      )
    }
}
}
