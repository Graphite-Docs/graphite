import React, { Component } from 'react';
import QuillEditorPublic from './QuillEditorPublic.js'; //this will render Yjs...

export default class PublicDoc extends Component {

  componentDidMount() {
    this.props.loadInitial(window.location.pathname.split('/shared/docs/')[1]);
    setTimeout(this.props.loadDoc, 700);
    this.interval = setInterval(() => this.props.loadDoc(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
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
                this.props.docLoaded === true ?
                <div>
                {
                  this.props.singleDocIsPublic === true ?
                  <div>
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

                    {
                      this.props.readOnly === true ?
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
                        key={this.props.readOnly === true ? "true!" : "false..."} //NOTE: when this.state.readOnly changes in PublicDoc, it will change this key, which will remount QuillEditorPublic, which will remount YjsQuill, so readOnly changes in SingleDoc update PublicDoc text editor...
                        roomId={this.props.idToLoad} //this is a string!
                        docLoaded={this.props.docLoaded} //this is set by loadDoc
                        value={this.props.content}
                        readOnly={this.props.readOnly}
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
