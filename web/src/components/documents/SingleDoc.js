import React, { Component, setGlobal } from "reactn";
import { Image, Icon, Modal, Input, Button, Message, List } from 'semantic-ui-react';
import { Value } from 'slate';
import {Menu as MainMenu} from 'semantic-ui-react';
import Loading from '../shared/Loading';
import Menu from './Menu';
import SocketEditor from './editor/SocketEditor';
import { loadContactsCollection } from '../helpers/contacts';
const single = require('../helpers/singleDoc');

// import Html from 'slate-html-serializer';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      modalOpen: false,
    }
    setGlobal({ content: Value.fromJSON(this.global.content)})
  }

  componentDidMount() {
    single.initialDocLoad();
    loadContactsCollection();
  } //end of componentDidMount

  handleTitleSave = () => {
    single.autoSave();
    this.setState({ modalOpen: false })
  }

  render() {
    const { displayMessage, avatars, loading, save, autoSave, hideStealthy, title, singleDocIsPublic} = this.global;
    let uniqueAva = avatars.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index)

    let docFlex;
    if(hideStealthy === true) {
      docFlex = "test-doc-card";
    } else {
      docFlex = "test-with-module";
    }

    if(!loading) {
      return (
        <div>

        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
          <MainMenu.Item onClick={single.handleBack}>
            <Icon name='arrow left' />
          </MainMenu.Item>
          <MainMenu.Item>
          {
            title
            ?
            (title.length > 15 ? title.substring(0,15)+"..." : title)
            :
            "Title here..."
          }
          <Modal
            trigger={<a style={{ cursor: "pointer", color: "#fff"}}  onClick={() => this.setState({ modalOpen: true})}><Icon style={{marginLeft: "10px"}} name='edit outline' /></a> }
            closeIcon
            open={this.state.modalOpen}
            closeOnEscape={true}
            closeOnDimmerClick={true}
            onClose={() => this.setState({ modalOpen: false})}
            >
            <Modal.Header>Edit Document Title</Modal.Header>
            <Modal.Content>
              <Modal.Description>

                {
                  title === "Untitled" ?
                  <div>
                  Title <br/>
                  <Input
                    placeholder="Give it a title"
                    type="text"
                    value=""
                    onChange={single.handleTitleChange}
                  />
                  </div>
                  :
                  <div>
                  Title<br/>
                  <Input
                    placeholder="Title"
                    type="text"
                    value={title}
                    onChange={single.handleTitleChange}
                  />
                  <Button onClick={this.handleTitleSave} style={{ borderRadius: "0"}} secondary>Save</Button>
                  </div>
                }
              </Modal.Description>
            </Modal.Content>
          </Modal>
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

          {displayMessage ?
            <Message
              style={{borderRadius: "0", background: "#000", bottom: "200px", color: "#fff"}}
              header='This user has not yet logged into Graphite'
              content='Ask them to log in first so that you can share encrypted files.'
            /> :
            null
          }

          <div className="test-docs">
            <div className={docFlex}>
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
                      <SocketEditor />
                  </div>
                </div>
              </div>

              <div style={{ float: "right", margin: "40px"}} className="right-align wordcounter">
                <p className="wordcount">
                  {this.global.wordCount} words
                </p>
              </div>
              <div className={save}></div>
            </div>
          </div>
        </div>
      </div>
    );

    } else {
      return(
        <Loading />
      )
    }
}
}
