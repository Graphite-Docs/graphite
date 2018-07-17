import React, { Component } from 'react';
import Header from './Header';
import TextEdit from './TextEdit.js'; //this will render Yjs...

export default class PublicDoc extends Component {

  componentDidMount() {
    window.$('.summernote').summernote({
      placeholder: "Write something great",
      value: this.props.content,
      roomId: this.props.idToLoad.toString(), //this needs to be a string!
      docLoaded: this.props.docLoaded
    });
    this.props.loadInitial(window.location.pathname.split('/shared/docs/')[1]);
  }


  render() {
    return (
      <div>
        <Header />
        <div className="test-docs">
          {/* <div className={docFlex}> */}
          <div className="test-doc-card">
            <div className="double-space doc-margin">

              {/* <p>
                <span style={{background: 'yellow'}}>Public Doc:</span> {this.state.idToLoad}
              </p> */}

              {
                this.props.title === "Untitled" ?
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Give it a title"
                  type="text"
                  onChange={this.props.handlePubTitleChange}
                />
                :
                <textarea
                  className="doc-title materialize-textarea"
                  placeholder="Title"
                  type="text"
                  value={this.props.title}
                  onChange={this.props.handlePubTitleChange}
                />
              }

              <p>
                This document last updated: {this.props.lastUpdated}
              </p>

              <p>
                Note: the original version of this document will be synced and autosaved whenever its author is signed into Graphite Docs.
                If the author is not signed in, changes made below will be lost.
              </p>

              <TextEdit
                roomId={this.props.idToLoad} //this is a string!
                docLoaded={this.props.docLoaded} //this is set by loadDoc
                value={this.props.content}
                onChange={this.handlePubChange}
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
