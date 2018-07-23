import React, { Component } from 'react';
import Header from './Header';
// import TextEdit from './TextEdit.js'; //this will render Yjs...
import QuillEditorPublic from './QuillEditorPublic.js'; //this will render Yjs...

export default class PublicDoc extends Component {

  componentDidMount() {
    // window.$('.summernote').summernote({
    //   placeholder: "Write something great",
    //   value: this.props.content,
    //   roomId: this.props.idToLoad.toString(), //this needs to be a string!
    //   docLoaded: this.props.docLoaded
    // });
    this.props.loadInitial(window.location.pathname.split('/shared/docs/')[1]);
  }


  render() {

    return (
      <div>
      <nav className="navbar-fixed toolbar">
        <div className="nav-wrapper">
          <a href="/" className="left brand-logo text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>
          <ul id="nav-mobile" className="right">
            <li><a href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a></li>
          </ul>
        </div>
      </nav>
        <div className="test-docs">
          <div className="test-doc-card">
            <div className="double-space doc-margin">

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



              <QuillEditorPublic
                roomId={this.props.idToLoad} //this is a string!
                docLoaded={this.props.docLoaded} //this is set by loadDoc
                value={this.props.content}
              />


          </div>
        </div>
      </div>
    </div>
    );
  }
}
