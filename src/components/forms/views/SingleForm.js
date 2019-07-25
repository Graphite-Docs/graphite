import React, { Component, setGlobal } from 'reactn';
import { loadForm } from '../helpers/singleForm';
import { Icon, Input, Container, Popup, Modal, Button, TextArea } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import {Menu as MainMenu} from 'semantic-ui-react';
import EditForm from './EditForm';
import Responses from './Responses';
import SingleFormSkel from './SingleFormSkel';
import { ToastsStore} from 'react-toasts';
const single = require('../helpers/singleForm');

class SingleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "Edit Form", 
      activeIndex: 0, 
      decryptingResponses: false
    }
  }

  async componentDidMount() {
    setGlobal({ formResponses: [] });
    let id;
    if(window.location.href.includes('team')) {
      if(window.location.href.includes('new')) {
        id = window.location.href.split('new/')[1];
      } else {
        id = window.location.href.split('forms/')[1];
      }
    } else {
      if(window.location.href.includes('new')) {
        id = window.location.href.split('new/')[1];
      } else {
        id = window.location.href.split('forms/')[1];
      }
    }
    
    await loadForm(id);
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  
  copyLink = () => {
    /* Get the text field */
    var copyText = document.getElementById("copyLink");
    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    ToastsStore.success(`Link copied`)
  }

  copyEmbed = () => {
    /* Get the text field */
    var copyText = document.getElementById("copyEmbed");
    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    ToastsStore.success(`Code copied`);
  }

  render() {
      const { userSession, proOrgInfo, singleForm, embed, formLoading, formLinkModalOpen, formEmbedModalOpen } = this.global;
      const { activeItem } = this.state;
      if(formLoading === true) {
        return (
          <SingleFormSkel />
        )
      } else {
        return (
          <div>
            <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
              <MainMenu.Item>
                <Link style={{color: "#fff"}} to={'/forms'}>
                  <Icon name='arrow left' />
                </Link>
              </MainMenu.Item>
              <MainMenu.Item>
                <Input placeholder="Give it a title" value={singleForm.title} onChange={single.handleFormTitle} type="text"/> 
              </MainMenu.Item>
                <MainMenu.Item
                    name='Edit Form'
                    active={activeItem === 'Edit Form'}
                    onClick={this.handleItemClick}
                >
                  <Icon name="edit" /> Edit Form
                </MainMenu.Item>
                <MainMenu.Item name='Responses' active={activeItem === 'Responses'} onClick={this.handleItemClick}>
                  <Icon name="comment outline" /> Responses
                </MainMenu.Item>
                <MainMenu.Item>
                  <Modal trigger={
                    <Popup
                      trigger={<Icon style={{cursor: "pointer"}} onClick={() => single.publicForm('link')} name='linkify' />}
                      content='Link to form'
                      offset='0, 50px'
                      position='bottom center'
                    />}
                    closeIcon
                    open={formLinkModalOpen}
                    onClose={() => setGlobal({ formLinkModalOpen: false })}
                    >
                    <Modal.Content>
                      <Modal.Description>
                        <h3>Link to Form</h3>
                        <p>Use this link to direct respondents to your form.</p>
                        {
                          singleForm.teamForm ? 
                          <Input style={{width: "90%"}} readOnly id="copyLink" value={`${window.location.origin}/public/forms/${proOrgInfo.orgId}/${singleForm.id}`} /> : 
                          <Input style={{width: "90%"}} readOnly id="copyLink" value={`${window.location.origin}/single/forms/${proOrgInfo.orgId}/${singleForm.id}/${userSession.loadUserData().username}`} />                          
                        }
                        <p className="margin-top-10"><Button onClick={this.copyLink} secondary>Copy Link</Button><Icon onClick={this.copyLink} style={{cursor: "pointer", marginLeft: "10px"}} name="copy" /></p>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                </MainMenu.Item>
                <MainMenu.Item>
                <Modal trigger={
                    <Popup
                      trigger={<Icon style={{cursor: "pointer"}} onClick={() => single.publicForm('embed')} name='code' />}
                      content='Embed form'
                      offset='0, 50px'
                      position='bottom center'
                    />}
                    closeIcon
                    open={formEmbedModalOpen}
                    onClose={() => setGlobal({ formEmbedModalOpen: false })}
                    >
                    <Modal.Content>
                      <Modal.Description>
                        <h3>Embed Form</h3>
                        <p>Use the code below to embed this form anywhere.</p>
                        <TextArea style={{width: "90%"}} readOnly id="copyEmbed" value={embed} />
                        <p className="margin-top-10"><Button onClick={this.copyEmbed} secondary>Copy Code</Button><Icon onClick={this.copyEmbed} style={{cursor: "pointer", marginLeft: "10px"}} name="copy" /></p>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                </MainMenu.Item>
              </MainMenu>
              <div style={{marginTop: "125px", marginBottom: "45px"}}>
                <Container>
                  
                  {
                    activeItem === "Edit Form" ? 
                    <EditForm 
                      singleForm={singleForm}
                    /> : 
                    <Responses />
                  }
                </Container>
              </div>
          </div>
         );
      }
  }
}

export default SingleForm;
