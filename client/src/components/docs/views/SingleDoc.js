import React, { Component, setGlobal } from 'reactn';
import { Image, Icon, Input, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import {Menu as MainMenu} from 'semantic-ui-react';
import Menu from './Menu';
import SocketEditor from './editors/SocketEditor';
import SlateEditor from "./editors/SlateEditor";
import EditorSkeleton from './editors/EditorSkeleton';
const single = require('../helpers/singleDoc');
const wordCount = require('html-word-count');
const initialTimeline = require('./editors/initialTimeline.json');

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

class SingleDoc extends Component {
  componentDidMount() {
    if(window.location.href.includes('new')) {
      setGlobal({loading: true});
      setTimeout(() => {
        setGlobal({loading: false, myTimeline: initialTimeline})
      }, 500)
    } else {
      single.loadSingle();
    }
  }
  
  render() {
    const { loading, avatars, save, autoSave, title, singleDocIsPublic} = this.global;
    let uniqueAva = avatars.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index)
    let editor = document.getElementsByClassName("editor");
    let words;
    if(editor[0]) {
      words = wordCount(editor[0].innerHTML)
    }
    if(loading) {
        return (
          <EditorSkeleton />
        )
      } else {
        return (
          <div>
            <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Link style={{color: "#fff"}} to={'/'}>
                <Icon name='arrow left' />
              </Link>
            </MainMenu.Item>
            <MainMenu.Item>
              <Input placeholder="Give it a title" value={title} onChange={single.handleTitle} type="text"/> 
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
            </MainMenu>
            <Menu />
  
            <div id='ava-modal'>
              <List>
              {
                uniqueAva.map(img => {
                  let image;
                  if(img.image) {
                    image = img.image[0].contentUrl;
                  } else {
                    image = avatarFallbackImage
                  }
                  return(
                    <List.Item key={img.name}>
                      <Image avatar src={image} />
                      <List.Content>
                        <List.Header>{img.name}</List.Header>
                      </List.Content>
                    </List.Item>
                  )
                })
              }
              </List>
            </div>
  
            <div className="test-docs">
              <div className='doc-card'>
                <div className="double-space doc-margin">
  
                  <p className="hide">
                    document access: <span>&nbsp;</span>
                    {
                      (singleDocIsPublic === true) ?
                      <span style={{backgroundColor: "green", color: "white"}}>public</span>
                      :
                      <span style={{backgroundColor: "blue", color: "white"}}>private</span>
                    }
                  </p>
  
                <div>
                  <div>
                    <div>
                      {
                        this.global.readOnly === false || this.global.rtc ? 
                        <SocketEditor /> : 
                        <SlateEditor />
                      }
                       
                    </div>
                  </div>
                </div>
  
                <div style={{ float: "right", margin: "40px"}} className="right-align wordcounter">
                  <p className="wordcount">
                    {words} words
                  </p>
                </div>
                <div className={save}></div>
              </div>
            </div>
          </div>
        </div>
      );
      }
  }
}

export default SingleDoc;
