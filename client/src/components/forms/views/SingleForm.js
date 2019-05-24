import React, { Component, setGlobal } from 'reactn';
import { loadForm } from '../helpers/singleForm';
import { Icon, Input, Container, Popup, Modal, Button, Dropdown, Accordion, Item, TextArea } from 'semantic-ui-react';
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
      activeIndex: 0
    }
  }

  componentDidMount() {
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
    
    loadForm(id);
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
      const { userSession, graphitePro, proOrgInfo, singleForm, embed, teamListModalOpen, teamShare, formLoading, formLinkModalOpen, formEmbedModalOpen } = this.global;
      const { activeItem, activeIndex } = this.state;
      const teamList = proOrgInfo.teams;
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
                  <Dropdown style={{color: "#fff"}} icon='share alternate' simple>
                    <Dropdown.Menu>
                    {
                    graphitePro ?
                    <Dropdown.Item>
                        <Modal 
                          open={teamListModalOpen}
                          onClose={() => setGlobal({ teamListModalOpen: false})}
                          closeIcon style={{borderRadius: "0"}}
                          trigger={<button onClick={() => setGlobal({ teamListModalOpen: true})} className='link-button'>Share With Team</button>}
                          >
                          <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share With Team</Modal.Header>
                          <Modal.Content>
                            <Modal.Description>
                              <p>By sharing with your entire team, each teammate will have immediate access to the form and will be able to make changes.</p>
                              <p>For reference, you can see your list of teammates by expanding each team below.</p>
                              <Item.Group divided>
                              {teamList.map(team => {
                                  return (
                                      <Item className="contact-search" key={team.id}>
                                      <Item.Content verticalAlign='middle'>
                                      <Accordion>
                                        <Accordion.Title active={activeIndex === team.id} index={team.id} onClick={this.handleClick}>
                                          <Icon name='dropdown' />
                                          {`${team.name} (${team.users.length} members)`}
                                        </Accordion.Title>
                                        <Accordion.Content active={activeIndex === team.id}>
                                          {
                                            team.users.map(user => {
                                              return (
                                                <p key={user.username}>
                                                  {user.username}
                                                </p>
                                              )
                                            })
                                          }
                                        </Accordion.Content>
                                      </Accordion>
                                      <br/>
                                      {
                                        teamShare === false ? 
                                        <Button style={{float: "right", borderRadius: "0px"}} secondary onClick={() => single.shareWithTeam({teamId: team.id, teamName: team.name, initialShare: true})}>Share</Button> : 
                                        <div className="hide" />
                                      }
                                      </Item.Content>
                                      </Item>
                                      )
                                    }
                                  )
                              }
                              </Item.Group>
                              {teamShare === false ? <div className="hide" /> : <Button style={{borderRadius: "0"}}>Sharing...</Button>}
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                        </Dropdown.Item> 
                      : 
                      <Dropdown.Item className="hide" />
                    }
                    </Dropdown.Menu>
                  </Dropdown>
                
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
