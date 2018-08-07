import React, { Component } from 'react';

import QuillEditorPublic from './QuillEditorPublic.js'; //this will render Yjs...

import {
  fetchData,
  loadDoc,
  // handlePubChange, //NOTE: don't need this function....
  handlePubTitleChange, //NOTE: need this function for title...
  loadInitial
} from './helpers/publicDoc'

export default class PublicDoc extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: "",
      docLoaded: "",
      idToLoad: "",
      readOnly: "",
      singleDocIsPublic: "",
      title: "",
      userToLoadFrom: "",
      url: "" //need to get url from fetchData, which then calls loadDoc, via helpers/publicDoc...
    }
    this.loadInitial = loadInitial.bind(this);
    this.fetchData = fetchData.bind(this);
    this.loadDoc = loadDoc.bind(this);
    // this.handlePubChange = handlePubChange.bind(this);
    this.handlePubTitleChange = handlePubTitleChange.bind(this);
  }

  componentDidMount() {
    console.log('PublicDoc - componentDidMount - this.props: ', this.props)
    this.loadInitial(window.location.pathname.split('/shared/docs/')[1]); //this gets userToLoadFrom and idToLoad...
    this.fetchData() //this gets url...
    setTimeout(this.loadDoc, 700); //call loadDoc on a slight delay... this function gets JSON response from gaia.blockstack.org/hub/[docId]...
    this.interval = setInterval(() => this.loadDoc(), 3000); //calling function every three seconds...
  }

  //readOnly attribute changes in PublicDoc children, QuillEditorPublic and YjsQuill... they are getting new props, but not updating.....
  //instead of continously calling loadDoc above, need to figure out a way to get PublicDoc state from props...
  //create a PublicDocContainer component???
  //but same problem there, after mounting, how do i keep checking it for changes from loadDoc?
  //can't seem to get componentDidUpdate working, so i'm simply calling loadDoc every 3 seconds, from componentDidMount...

  componentWillUnmount() {
    clearInterval(this.interval) //need to clear the timer when the component unmounts to prevent it leaving errors and leaking memory
  }

  render() {
    console.log('PublicDoc - render - this.state: ', this.state); //getting isUserSignedIn in state, from sharePublicly() in SingleDoc, and from helpers/publicDoc loadDoc() function...
    console.log('PublicDoc - render - this.state.docLoaded? ...', this.state.docLoaded === true ? this.state.docLoaded : "not yet...")
    if (this.state.docLoaded) {
      console.log('PublicDoc - render - this.state: ', this.state)
    }
    return (
      <div>
      <nav className="navbar-fixed toolbar">
        <div className="nav-wrapper">
          <a href="/" className="left brand-logo text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>
          <ul id="nav-mobile" className="right">
            <li>
              <a href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
            </li>
          </ul>
        </div>
      </nav>
        <div className="test-docs">
          <div className="test-doc-card">
            <div className="double-space doc-margin">

              {
                this.state.docLoaded === true ?
                <div>
                {
                  this.state.singleDocIsPublic === true ?
                  <div>
                    {
                      this.state.title === "Untitled" ?
                      <textarea
                        className="doc-title materialize-textarea"
                        placeholder="Give it a title"
                        type="text"
                        onChange={this.handlePubTitleChange}
                      />
                      :
                      <textarea
                        className="doc-title materialize-textarea"
                        placeholder="Title"
                        type="text"
                        value={this.state.title}
                        onChange={this.handlePubTitleChange}
                      />
                    }

                    {
                      this.state.readOnly === true ?
                      <div>
                        <p style={{textAlign: "center"}}>
                          <span style={{padding: "5px", boxShadow: "0 4px 6px 0 hsla(240, 100%, 50%, 0.2)"}}>
                            This collaborative document is currently read-only.
                          </span>
                        </p>
                      </div>
                      :
                      <div>
                        <p style={{textAlign: "center"}}>
                          <span style={{padding: "5px", boxShadow: "0 4px 6px 0 hsla(120, 100%, 50%, 0.2)"}}>
                            This collaborative document is editable.
                          </span>
                        </p>
                      </div>
                    }

                    {/* <div style={(this.state.readOnly === true) ? {border: "5px solid red"} : null}> */}
                    <div>
                      <QuillEditorPublic
                        key={this.state.readOnly === true ? "true!" : "false..."} //NOTE: when this.state.readOnly changes in PublicDoc, it will change this key, which will remount QuillEditorPublic, which will remount YjsQuill, so readOnly changes in SingleDoc update PublicDoc text editor...
                        roomId={this.state.idToLoad} //this is a string!
                        docLoaded={this.state.docLoaded} //this is set by loadDoc
                        value={this.state.content}
                        readOnly={this.state.readOnly}
                      />
                    </div>
                  </div>
                  :
                  <div style={{marginTop: "20%"}}>
                    <h1>
                      This document is not being shared at this time.
                    </h1>
                  </div>
                }
                </div>
                :
                <div style={{marginTop: "20%"}}>
                  <h1>
                    Loading...
                  </h1>
                  <div className="progress">
                    <div className="indeterminate"></div>
                  </div>
                </div>
              }

          </div>
        </div>
      </div>
    </div>
    );
  }
}
