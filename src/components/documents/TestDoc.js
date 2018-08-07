import React, { Component } from "react";
// import 'react-quill/dist/quill.bubble.css';
import {
  loadUserData,
} from 'blockstack';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
// import ImageResize from 'quill-image-resize-module';
// import axios from 'axios';
import QuillEditorPublic from '../QuillEditorPublic.js'; //this will render Yjs...
import QuillEditorPrivate from '../QuillEditorPrivate.js';
const wordcount = require("wordcount");
const { decryptECIES } = require('blockstack/lib/encryption');
const remoteStorage = new RemoteStorage({logging: false});
const widget = new Widget(remoteStorage);

export default class TestDoc extends Component {

  componentDidMount() {
    window.$('.modal').modal();
    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );
    let privateKey = loadUserData().appPrivateKey;

    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
  );

    remoteStorage.access.claim(this.props.match.params.id, 'rw');
    remoteStorage.caching.enable('/' + this.props.match.params.id + '/');
    const client = remoteStorage.scope('/' + this.props.match.params.id + '/');
    widget.attach('remote-storage-element-id');
    remoteStorage.on('connected', () => {
    const userAddress = remoteStorage.remote.userAddress;
    console.debug(`${userAddress} connected their remote storage.`);
    client.getFile('title.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteTitle: file.data });
      }
    });
    client.getFile('content.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('wordCount.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteWords: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('id.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('updated.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
  })

  remoteStorage.on('network-offline', () => {
    console.debug(`We're offline now.`);
  })

  remoteStorage.on('network-online', () => {
    console.debug(`Hooray, we're back online.`);
    client.getFile('title.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteTitle: file.data });
      }
    });
    client.getFile('content.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteContent: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('wordCount.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteWords: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('id.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteId: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
    client.getFile('updated.txt').then(file => {
      if(file.data !=null) {
        this.setState({ remoteUpdated: decryptECIES(privateKey, JSON.parse(file.data)) });
      }
    });
  })

    this.props.componentDidMountData(this.props.match.params.id);

  }

  componentDidUpdate() {
    window.$('.button-collapse').sideNav({
        menuWidth: 400, // Default is 300
        edge: 'right', // Choose the horizontal origin
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true, // Choose whether you can drag to open on touch screens
      }
    );
  }


  render() {

    let words;
    if(this.props.content) {
      words = wordcount(this.props.content.replace(/<(?:.|\n)*?>/gm, ''));
    } else {
      words = 0;
    }

    const { yjsConnected, idToLoad, docLoaded, remoteStorage, loading, save, autoSave, contacts, hideStealthy, revealModule, title, content, gaiaLink, singleDocIsPublic, value} = this.props
    const stealthy = (hideStealthy) ? "hide" : ""
    const remoteStorageActivator = remoteStorage === true ? "" : "hide";
    let contentString = "<p style='text-align: center;'>" + title + "</p> <div style='text-indent: 30px;'>" + content + "</div>";
    // var htmlString = window.$('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' + content + '</body>' ).get().outerHTML;

    var htmlDocument = '<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><xml><word:WordDocument><word:View>Print</word:View><word:Zoom>90</word:Zoom><word:DoNotOptimizeForBrowser/></word:WordDocument></xml></head><body>' + contentString + '</body></html>';
    var dataUri = 'data:text/html,' + encodeURIComponent(htmlDocument);

      const {length} = contacts
      let users = '&length=' + length
      let k = 0
      for (const i of contacts) {
        users += '&id' + k + "=" + i.contact
        k += 1
      }
      // const to = (sharedWith && sharedWith[sharedWith.length - 1] && sharedWith[sharedWith.length - 1].contact) ? sharedWith[sharedWith.length - 1].contact : ''
      const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
        'http://localhost:3030/?app=gd04012018' :
        'https://www.stealthy.im/?app=gd04012018';
      const stealthyUrl = stealthyUrlStub + users;

      // const stealthyModule = (length > 0) ? (
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
              <a
                onClick={this.props.handleBack}
                className="left brand-logo">
                <i className="small-brand material-icons">arrow_back</i>
              </a>

                <ul className="left toolbar-menu">
                <li className="document-title">
                  {title.length > 15 ? title.substring(0,15)+"..." :  title}
                </li>
                <li>
                  <a className="small-menu muted">{autoSave}</a>
                </li>
                </ul>
                <ul className="right toolbar-menu small-toolbar-menu auto-save">
                <li>
                  <a className="tooltipped dropdown-button"
                    data-activates="dropdown2"
                    data-position="bottom"
                    data-delay="50"
                    data-tooltip="Share">
                    <i className="small-menu material-icons">people</i>
                  </a>
                </li>
                <li>
                  <a className="dropdown-button"
                    data-activates="dropdown1">
                    <i className="small-menu material-icons">more_vert</i>
                  </a>
                </li>
                <li>
                  <a className="small-menu tooltipped stealthy-logo"
                    data-position="bottom"
                    data-delay="50"
                    data-tooltip="Stealthy Chat"
                    onClick={this.props.handleStealthy}>
                    <img className="stealthylogo"
                      src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png"
                      alt="open stealthy chat"/>
                    </a>
                  </li>
                </ul>

                {/*Share Menu Dropdown*/}
                <ul id="dropdown2"
                  className="dropdown-content collection cointainer">
                  <li>
                    <span className="center-align">Select a contact to share with</span>
                  </li>
                  <a href="/contacts">
                  <li>
                    <span className="muted blue-text center-align">Or add new contact</span>
                  </li>
                </a>
                <li className="divider" />
                {
                  contacts.slice(0).reverse().map(contact => {
                    return (
                      <li key={contact.contact}className="collection-item">
                        <a onClick={() => this.props.sharedInfoSingleDoc(contact.contact)}>
                          <p>
                            {contact.contact}
                          </p>
                        </a>
                      </li>
                    )
                  })
                }
                </ul>
                {/*Share Menu Dropdown*/}

                {/* Dropdown menu content */}
                <ul id="dropdown1" className="dropdown-content single-doc-dropdown-content">
                  {/*<li><a onClick={() => this.setState({ remoteStorage: !remoteStorage })}>Remote Storage</a></li>
                  <li className="divider"></li>*/}
                  <li>
                    <a onClick={this.props.print}>Print</a>
                  </li>
                  <li>
                    <a download={title + ".doc"} href={dataUri}>Download</a>
                  </li>
                  <li>
                    <a onClick={this.props.sharePublicly}>Public Link</a>
                  </li>
                </ul>
              {/* End dropdown menu content */}

            </div>
          </nav>
        </div>
        {/*Remote storae widget*/}
          <div className={remoteStorageActivator} id="remotestorage">
            <div id='remote-storage-element-id'></div>
          </div>
          {/*Remote storae widget*/}


          {/* Public Link Modal */}
            <div id="publicShare" className="project-page-modal modal">
              <div className="modal-content">
                <h4>Share Publicly</h4>
                <p>This data is not encrypted and can be accessed by anyone with the link below.</p>
                <div>
                  <p>{gaiaLink}</p>
                </div>
              </div>
              <div className="modal-footer">
                <a
                onClick={() => this.setState({ publicShare: "hide"})}
                className="modal-action modal-close waves-effect waves-green btn-flat">
                Close
              </a>
              </div>
            </div>
          {/* End Public Link Modal */}


          <div className="test-docs">
            <div className={docFlex}>
              <div className="double-space doc-margin">

                {/* <p style={{border: '5px solid green'}}>
                  TestDoc ID: {this.props.match.params.id}
                </p> */}

                {
                  title === "Untitled" ?
                  <textarea
                    className="doc-title materialize-textarea"
                    placeholder="Give it a title"
                    type="text"
                    onChange={this.props.handleTitleChange}
                  />
                  :
                  <textarea
                    className="doc-title materialize-textarea"
                    placeholder="Title"
                    type="text"
                    value={title}
                    onChange={this.props.handleTitleChange}
                  />
                }

                {
                  (singleDocIsPublic === true && value) //making sure we have this pass to match for PublicDoc
                  ?
                  <div>
                    <div>
                    </div>

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
                        roomId={idToLoad.toString()} //this needs to be a string!
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
                <p className="wordcount">{words} words</p>
              </div>
              <div className={save}>
              </div>
              <div className={loading}>
              <div className="preloader-wrapper small active">
                <div className="spinner-layer spinner-green-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div><div className="gap-patch">
                    <div className="circle"></div>
                  </div><div className="circle-clipper right">
                    <div className="circle"></div>
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
