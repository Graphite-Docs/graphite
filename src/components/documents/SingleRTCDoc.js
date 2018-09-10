import React, { Component } from "react";
import QuillEditorPublic from '../QuillEditorPublic.js'; //this will render Yjs...

export default class SingleRTCDoc extends Component {

  componentDidMount() {
    this.props.findDoc();
  }

  renderView() {
    const { title, content, rtc, docLoaded, idToLoad, yjsConnected, autoSave, hideButton } = this.props;

    return(
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>
          <ul className="left toolbar-menu">
          {
            rtc === true ?
            <li className="document-title">
              {
                title
                ?
                (title.length > 15 ? title.substring(0,15)+"..." : title)
                :
                "Title here..."
              }
            </li>
            :
            <li className={hideButton}><a onClick={this.props.handleAddStatic}>Add to Documents</a></li>
          }
          {
            rtc === true ?
            <li>
              <a className="small-menu muted">{autoSave}</a>
            </li>
            :
            <li className="hide" />
          }
          </ul>
        </div>
      </nav>
    </div>
    <div className="test-docs">

      <div className="test-doc-card">
        <div className="double-space doc-margin">

          {
            (rtc === true) ?
            <div>
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
                (docLoaded === true) ?
                <QuillEditorPublic
                  roomId={idToLoad.toString()} //this needs to be a string!
                  docLoaded={docLoaded} //this is set by getFile
                  value={content}
                  onChange={this.props.handleChange}
                  getYjsConnectionStatus={this.props.getYjsConnectionStatus} //passing this through TextEdit to Yjs
                  yjsConnected={yjsConnected} //true or false, for TextEdit
                  rtc={rtc}
                />
                :
                <div className="progress">
                  <div className="indeterminate"></div>
                </div>
              }
            </div>
            :
            <div>
              <p className="doc-title center-align print-view">
              {title}
              </p>
              <div
                className="print-view no-edit"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          }

          </div>
          </div>
    </div>

    </div>
      );
  }

  render() {
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
