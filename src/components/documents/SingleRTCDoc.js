import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import QuillEditorPublic from '../QuillEditorPublic.js'; //this will render Yjs...

export default class SingleRTCDoc extends Component {

  componentDidMount() {
    this.props.findDoc();
  }

  renderView() {
    let toolbar = window.document.getElementsByClassName('ql-toolbar');
    if(toolbar[0]) {
      toolbar[0].style.top = "63px";
    }

    const { title, content, rtc, docLoaded, idToLoad, yjsConnected, autoSave } = this.props;
    return(
    <div>
    <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff", height: "100px", paddingBottom: "30px" }}>
      <MainMenu.Item onClick={this.props.handleBack}>
        <Link style={{color: "#fff"}} to={'/documents'}><Icon name='arrow left' /></Link>
      </MainMenu.Item>
      <MainMenu.Item>
      {
        title
        ?
        (title.length > 15 ? title.substring(0,15)+"..." : title)
        :
        "Title here..."
      }
      </MainMenu.Item>
      <MainMenu.Item>
        {autoSave}
      </MainMenu.Item>
      </MainMenu>
    <div className="test-docs">
      <div className="test-doc-card">
        <div className="double-space doc-margin">

          {
            (rtc === true) ?
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
