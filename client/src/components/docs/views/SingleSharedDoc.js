import React, { Component } from "reactn";
import { Link } from 'react-router-dom';
import { Icon, Image } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import SocketEditor from './editors/SocketEditor';
import EditorSkeleton from './editors/EditorSkeleton';
const shared = require('../helpers/singleShared');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleSharedDoc extends Component {

  componentDidMount() {
    shared.loadSharedDoc();
  }

  renderView() {
    const { loading } = this.global;
    let toolbar = window.document.getElementsByClassName('ql-toolbar');
    if(toolbar[0]) {
      toolbar[0].style.top = "63px";
    }

    const { title, content, rtc, autoSave, avatars } = this.global;

    let uniqueAva;

    if(avatars) {
      uniqueAva = avatars.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);
    } else {
      uniqueAva = [];
    }


    if(loading) {
      return (
        <EditorSkeleton />
      )
    } else {
      return(
      <div>
      {
        rtc ?
        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff", height: "100px", paddingBottom: "30px" }}>
          <MainMenu.Item>
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
          <MainMenu.Menu position='right'>
            <MainMenu.Item>
            <ul className="avatar-ul">
              {
                uniqueAva ? uniqueAva.length < 4 ? uniqueAva.map(img => {
                  let image;
                  if(img.image) {
                    image = img.image[0].contentUrl;
                  } else {
                    image = avatarFallbackImage
                  }
                  return(
                      <li key={img.name} className="avatar-li"><span className="hidden-span">{img.name}</span>
                      <Image src={image} avatar className='shared-avatar circle' /></li>
                  )
                })
                 :
                 <li id="ava-length">
                  {uniqueAva.length}
                 </li> :
                 <li className='hide' />
              }
              </ul>
            </MainMenu.Item>
          </MainMenu.Menu>
          </MainMenu> :

          <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
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
              <button className="link-button" style={{color: "#fff", cursor: "pointer"}} onClick={shared.handleAddStatic}>Add to Collection</button>
            </MainMenu.Item>
            </MainMenu>
      }
      <div className="test-docs">
        <div className="test-doc-card">
          <div className="double-space doc-margin">
              <div>
              {
                rtc ?
                <div>
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
                      loadSingleVaultFile={this.props.loadSingleVaultFile}
                      handleVaultDrop={this.props.handleVaultDrop}
                      files={this.props.files}
                      link={this.props.link}
                      rtc={rtc}
                    />
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
            </div>
            </div>
      </div>

      </div>
        );
    }
  }

  render() {
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
