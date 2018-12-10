import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import SocketEditor from './editor/SocketEditor';
import MDEditor from '../MDEditor';

export default class SingleRTCDoc extends Component {

  componentDidMount() {
    this.props.findDoc();
  }

  renderView() {
    let toolbar = window.document.getElementsByClassName('ql-toolbar');
    if(toolbar[0]) {
      toolbar[0].style.top = "63px";
    }

    const { title, content, rtc, docLoaded, autoSave, markdown } = this.props;
    return(
    <div>
    {
      rtc ?
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
        </MainMenu> :

        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item onClick={this.props.handleBack}>
            <Link style={{color: "#fff"}} to={'/documents'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
          {
            title
            ?
            (title.length > 15 ? title.substring(0,15)+"..." : title)
            :
            "Title here..."
          }
          </MainMenu.Item>
          <MainMenu.Item>
            <a style={{color: "#fff", cursor: "pointer"}} onClick={this.props.handleAddStatic}>Add to Collection</a>
          </MainMenu.Item>
          </MainMenu>
    }
    <div className="test-docs">
      <div className="test-doc-card">
        <div className="double-space doc-margin">
          {
            markdown ?
            <div>
              <MDEditor
                markdownContent={this.props.markdownContent}
                handleMDChange={this.props.handleMDChange}
              />
            </div> :
            <div>
            {
              (rtc === true) ?
              <div>
                {
                  (docLoaded === true) ?

                  <SocketEditor
                    content={content}
                    handleChange={this.props.handleChange}
                    onRTCChange={this.props.onRTCChange}
                    applyOperations={this.props.applyOperations}
                    hasMark={this.props.hasMark}
                    onKeyDown={this.props.onKeyDown}
                    onClickMark={this.props.onClickMark}
                    docLoaded={this.props.docLoaded}
                    createRTC={this.props.createRTC}
                    rtc={rtc}
                  />
                  :
                  <div className="progress">
                    <div className="indeterminate"></div>
                  </div>
                }
              </div>
              :
              <div style={{maxWidth: "85%", margin: "auto", marginTop: "100px", marginBottom: "45px"}}>
                <div
                  className="print-view no-edit"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            }
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
