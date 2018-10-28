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
    let toolbar = window.document.getElementsByClassName('ql-toolbar');
    if(toolbar[0]) {
      if(this.props.readOnly) {
        toolbar.style.display = "none";
      } else {
        toolbar[0].style.top = "63px";
      }

    }
    return (
      <div>
      <nav className="navbar-fixed toolbar">
        <div className="nav-wrapper">
          <a href="/" className="left brand-logo text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>
          <ul id="nav-mobile" className="right">
            <li>
            {
              this.props.readOnly === true ?
              <a>
                Read-Only
              </a>
              :
              <a>
                Editable
              </a>
            }
            </li>
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



                    {/* <div style={(this.state.readOnly === true) ? {border: "5px solid red"} : null}> */}
                    <div>
                      <h3 className="center-align">{this.props.title}</h3>
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
