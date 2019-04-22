import React, { Component } from 'reactn';
import { Link } from 'react-router-dom';
import { loadContact } from '../helpers/singleContact';
import { Image, Segment, Icon, Modal, Input, Button, Tab } from 'semantic-ui-react'
import {Menu as MainMenu} from 'semantic-ui-react';
import MainContactCardContent from './MainContactCardContent';
import ContactCardNotes from './ContactCardNotes';
import SingleSkeleton from './SingleSkeleton';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

class SingleContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }

  componentDidMount() {
    const contactName = window.location.href.split('contacts/')[1]
    loadContact(contactName);
  }

  render() {
    const { contact, loading, graphitePro } = this.global;
    const { open } = this.state;
    let name = contact.contact ? contact.contact : contact.id ? contact.id : "Error";
    let avatarImg = contact.img ? contact.img : contact.image ? contact.image : avatarFallbackImage;
    let accounts = contact.socialAccounts ? contact.socialAccounts : [];
    let displayAccounts;
    let website;
    if(accounts.length > 0) {
      contact.website ? website = contact.website[0].url : website = "www.example.com";
      displayAccounts = accounts.filter(a => a.service === 'twitter' || a.service === 'facebook' || a.service === 'bitcoin' || a.service === 'github' || a.service === 'twitter');
    } else {
      displayAccounts = [];
    }

    const panes = [
      { menuItem: 'Contact Details', render: () => <Tab.Pane>
        <MainContactCardContent 
          contact={contact}
          name={name}
        />
        </Tab.Pane> },
      { menuItem: 'Contact Notes', render: () => <Tab.Pane>
        <ContactCardNotes 
          contact={contact}
          name={name}
        />
        </Tab.Pane> }
    ]

    const Tabs = () => <Tab panes={panes} />

    if(loading) {
      return(
        <SingleSkeleton />
      )
    } else {
      return (
        <div>
          <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Link style={{color: "#fff"}} to={'/contacts'}>
                <Icon name='arrow left' />
              </Link>
            </MainMenu.Item>
            <MainMenu.Item style={{color: "#fff"}}>
              {name}
            </MainMenu.Item>
            </MainMenu>


          <div className="contain">
            <div className="margin-top-65" >
              <div className="col-25-left">
                <Segment>
                  <Image className='contact-avatar' src={avatarImg} />
                  <div className="contact-card">
                    <div className="center">{contact.name ? contact.name : "Anonymous"}
                    {graphitePro ? 
                      <Modal size='small' open={this.state.nameModalOpen} onClose={this.closeNameModal} trigger={<Icon style={{marginLeft: "5px", cursor: "pointer"}} name="edit" />}>
                        <Modal.Header>Update Name</Modal.Header>
                        <Modal.Content>
                          <Input type="text" value={contact.name ? contact.name : "Anonymous"} onChange={this.handleName} />
                        </Modal.Content>
                        <Modal.Actions>
                          <Button secondary>Save</Button>
                        </Modal.Actions>
                      </Modal> : 
                      <Modal closeIcon trigger={<Icon style={{marginLeft: "5px", cursor: "pointer"}} name="edit" />}>
                        <Modal.Header>Ready to get more?</Modal.Header>
                        <Modal.Content>
                        <Modal.Description>
                          <p>With Graphite Pro, you can update information about your contacts, including addresses, email, websites, and more. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                          <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                      </Modal.Description>
                      </Modal.Content>
                    </Modal>

                    }
                    </div>
                    <div className="center">{contact.id ? contact.id :  contact.contact}</div>
                    <div className="center">{website}
                      {graphitePro ? 
                      <Modal size='small' open={open} onClose={this.close} trigger={<Icon style={{marginLeft: "5px", cursor: "pointer"}} name="edit" />}>
                        <Modal.Header>Update Website</Modal.Header>
                        <Modal.Content>
                          <Input type="text" value={contact.website ? contact.website[0].url : ""} onChange={this.handleWebsite} />
                        </Modal.Content>
                        <Modal.Actions>
                          <Button secondary>Save</Button>
                        </Modal.Actions>
                      </Modal> : 
                      <Modal closeIcon trigger={<Icon style={{marginLeft: "5px", cursor: "pointer"}} name="edit" />}>
                        <Modal.Header>Ready to get more?</Modal.Header>
                        <Modal.Content>
                        <Modal.Description>
                          <p>With Graphite Pro, you can update information about your contacts, including addresses, email, websites, and more. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                          <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                      </Modal.Description>
                      </Modal.Content>
                    </Modal>

                    }</div>
                    <div>
                      <div style={{textAlign: "center", marginTop: "10px"}}>
                        {
                          displayAccounts.map(social => {
                            let iconName;
                            let socialHref;
                            if(social.service === "twitter") {
                              iconName = "twitter";
                              socialHref = `https://twitter.com/${social.identifier}`;
                            } else if(social.service === "facebook") {
                              iconName = "facebook";
                              socialHref = `https://facebook.com/${social.identifier}`;
                            } else if(social.service === "github") {
                              iconName = "github";
                              socialHref = `https://github.com/${social.identifier}`;
                            } else if(social.service === "linkedIn") {
                              iconName = "linkedin";
                              socialHref = `https://linkedin.com/in/${social.identifier}`;
                            } else if(social.service === "bitcoin") {
                              iconName = "btc";
                              socialHref = `https://www.blockchain.com/btc/address/${social.identifier}`
                            }
                            return (
                              <a href={socialHref} target='_blank' rel="noopener noreferrer"><Icon circular name={iconName} /></a>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div>
                </Segment>
              </div>
              <div className="col-75-right">
                <Tabs panes={panes} />
              </div>
            </div>
          </div>
        </div>
       );
    }
  }
}

export default SingleContact;
