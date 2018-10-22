import React, { Component } from "react";
import {
  loadUserData
} from 'blockstack';
import LoadingBar from '../LoadingBar';
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
    }
  }

  componentDidMount() {
    this.props.initialDocLoad();
    window.$('.collapsible').collapsible();
    window.$('.modal').modal();
    window.$('.tooltipped').tooltip();
    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    });
    // let privateKey = loadUserData().appPrivateKey;

    window.$('.button-collapse').sideNav({
      menuWidth: 400,
      edge: 'right',
      closeOnClick: true,
      draggable: true,
    });
  } //end of componentDidMount

  componentDidUpdate(prevProps) {
    window.$('.button-collapse').sideNav({
      menuWidth: 400,
      edge: 'right',
      closeOnClick: true,
      draggable: true,
    });
  }

  render() {
    const { userRole, teamDoc, avatars, loadingIndicator, yjsConnected, docLoaded, rtc, idToLoad, content, mediumConnected, graphitePro, loading, save, autoSave, contacts, hideStealthy, revealModule, title, singleDocIsPublic, readOnly, gaiaLink, team} = this.props;
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

    return (
      <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.props.handleBack} className="left brand-logo">
                <i className="small-brand material-icons">arrow_back</i>
              </a>

              <ul className="left toolbar-menu">
                <li className="document-title">
                  <a className="modal-trigger" href="#editName">
                    {
                      title
                      ?
                      (length > 15 ? title.substring(0,15)+"..." : title)
                      :
                      "Title here..."
                    }
                    <i className="material-icons right tiny">edit</i>
                  </a>
                </li>
                <li>
                  <a className="small-menu muted">{autoSave}</a>
                </li>
              </ul>
              <ul className="right toolbar-menu small-toolbar-menu auto-save">
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
                        <li key={img.name} className="avatar-li"><span className="hidden-span">{img.name}</span><img src={image} alt='shared with avatar' className='shared-avatar circle' /></li>
                    )
                  })
                   : <li className="hide" />
                }
                </ul>
                <li>
                  <a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={this.props.stealthyChat}>
                    <img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/>
                  </a>
                </li>
              </ul>

          </div>
        </nav>
        <Menu
          downloadDoc={this.props.downloadDoc}
          handleaddItem={this.props.handleaddItem}
          formatSpacing={this.props.formatSpacing}
          print={this.props.print}
          graphitePro={graphitePro}
          teamDoc={teamDoc}
          userRole={userRole}
          mediumConnected={mediumConnected}
        />
      </div>

      {/* Contacts Modal */}

      <div id="contactsModal" className="modal">
        <div className="modal-content">
          <h4>Share With a Contact</h4>
          <p>Select a contact or add a new one <a href="/contacts">here</a>.</p>
          <ul className="collection cointainer">
          {
          contacts.slice(0).reverse().map(contact => {
            return (
              <li key={contact.contact}className="collection-item">
                <a onClick={() => this.setState({ contactToShareWith: contact.contact})} className='modal-trigger' href='#encryptedModal'>{contact.contact}</a>
              </li>
            )
          })
          }
          </ul>
        </div>
        <div className="modal-footer">
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
        </div>
      </div>
      {/* End Contacts Modal */}

      {/* Edit Name Modal */}
      <div id="editName" className="modal">
        <div className="modal-content">
          <h4>Edit Document Title</h4>
          {
            title === "Untitled" ?
            <input
              className="edit-title"
              placeholder="Give it a title"
              type="text"
              onChange={this.props.handleTitleChange}
            />
            :
            <input
              className="edit-title"
              placeholder="Title"
              type="text"
              value={title}
              onChange={this.props.handleTitleChange}
            />
          }
        </div>
        <div className="modal-footer">
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Save</a>
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
        </div>
      </div>
      {/*End Edit Name Modal */}

      {/* Team Share Modal */}

      <div id="teamShare" className="modal">
        <div className="modal-content">
          <h4>Share to Your Graphite Pro Team</h4>
          { loadingIndicator === true ?
            <div className="container">
              <LoadingBar />
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
                    roomId={idToLoad.toString()} //this needs to be a string!
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
            <div className={loading}>
              <div className="preloader-wrapper small active">
                <div className="spinner-layer spinner-green-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div>
                  <div className="gap-patch">
                    <div className="circle">
                    </div>
                  </div>
                  <div className="circle-clipper right">
                    <div className="circle">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {stealthyModule}
        </div>
      </div>
    </div>
  );
}
}
