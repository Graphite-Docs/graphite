import React, { Component } from 'react';
// import ReactQuill, {Quill} from 'react-quill';
// import ImageResize from 'quill-image-resize-module';

import axios from 'axios';

import Header from './Header';
import TextEdit from './TextEdit.js'; //this will render Yjs...
// import ReactQuillTextEditor from './ReactQuillTextEditor.js'; //this will render Yjs...

import {
  lookupProfile,
} from 'blockstack';

// const Font = ReactQuill.Quill.import('formats/font');
// Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
// ReactQuill.Quill.register(Font, true);
// Quill.register('modules/imageResize', ImageResize);

export default class PublicDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userToLoadFrom: "",
      idToLoad: "",
      gaiaLink: "",
      title: "",
      content: "",
      words: "",
      view: false,
      docLoaded: false,
      lastUpdated: "",
    }
    this.fetchData = this.fetchData.bind(this);
    // this.handleLinkChange = this.handleLinkChange.bind(this);
    // this.sendLink = this.sendLink.bind(this);
    // this.newLink = this.newLink.bind(this);
    this.loadDoc = this.loadDoc.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
  }

  componentDidMount() {
    console.log('PublicDoc - componentDidMount, props: ', this.props)
    this.setState({
      userToLoadFrom: this.props.match.params.id.substr(0, this.props.match.params.id.indexOf('-')),
      idToLoad: this.props.match.params.id.split('-')[1]
    })
    setTimeout(this.fetchData, 300);
    // this.refresh = setInterval(() => this.fetchData(), 1000);
  }

  fetchData() {
    lookupProfile(this.state.userToLoadFrom, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      console.log('PublicDoc - fetchData - profile.apps: ', profile.apps['http://localhost:3000']);
      if(process.env.NODE_ENV !== 'production') {
        this.setState({url: profile.apps['http://localhost:3000']});
      } else {
        this.setState({url: profile.apps['https://app.graphitedocs.com']});
      }
      setTimeout(this.loadDoc, 300);
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
  }

  loadDoc() {
    axios.get(this.state.url + 'public/' + this.state.idToLoad + '.json')
    .then((response) => {
      console.warn('PublicDoc - loadDoc() - axios ->> docLoaded! response:', response);
      var responseHeaders = response.headers // response.headers: {last-modified: "Sat, 30 Jun 2018 21:07:31 GMT", content-type: "text/plain", cache-control: "public, max-age=1"}
      var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]]; //this is the value of last-modified
      console.log('lastUpdated is: ', lastUpdated)
      // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! response.data:', response.data);
      // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! response.data.content:', response.data.content);
      // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! typeof response.data.content:', typeof response.data.content); //this is a string
      this.setState({
        title: response.data.title,
        content: response.data.content,
        words: response.data.words,
        docLoaded: true,
        lastUpdated: lastUpdated
      })
    })
    .catch((error) => {
      console.log('error:', error);
    });
  }

  //this function is for TextEdit...
  handleChange(event) { //calling this on change in textarea...
    console.log('PublicDoc -->> handleChange called, event is: ', event)
    var updateString = event.target.value
    console.log('typeof updateString: ', typeof updateString)
    this.setState({
      content: updateString
    });
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }


  render() {
    if (this.state.docLoaded) {
      console.log('PublicDoc - render - this.state: ', this.state)
    }
    return (
      <div>

        <Header
        />

        <div className="test-docs">
          {/* <div className={docFlex}> */}
          <div className="test-doc-card">
            <div className="double-space doc-margin">

              {/* <p>
                <span style={{background: 'yellow'}}>Public Doc:</span> {this.state.idToLoad}
              </p> */}

              {
                this.state.title === "Untitled" ?
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Give it a title"
                  type="text"
                  onChange={this.handleTitleChange}
                />
                :
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Title"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleTitleChange}
                />
              }

              <p>
                This document last updated: {this.state.lastUpdated}
              </p>

              <p>
                Note: the original version of this document will be synced and autosaved whenever its author is signed into Graphite Docs.
                If the author is not signed in, changes made below will be lost.
              </p>

              <TextEdit
                roomId={this.state.idToLoad} //this is a string!
                docLoaded={this.state.docLoaded} //this is set by loadDoc
                value={this.state.content}
                onChange={this.handleChange}
              />

              {/* {
                (this.state.docLoaded === true) ?
                <ReactQuillTextEditor
                // ref={(el) => { this.reactQuillRef = el }}
                roomId={this.state.idToLoad} //this is a string!
                docLoaded={this.state.docLoaded}
                value={this.state.content}
                onChange={this.handleChange}
              />
              :
              "ReactQuillTextEditor will go here..."
            } */}
          </div>
        </div>
      </div>
    </div>
    );
  }
}
