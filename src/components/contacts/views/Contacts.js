import React, { Component, setGlobal } from "reactn";
import { Link } from "react-router-dom";
import ContactsSkeleton from './ContactsSkeleton';
import ContactsMap from './ContactsMap';
import ContactsGrid from './ContactsGrid';
import { Container, Input, Grid, Button, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import Nav from '../../shared/views/Nav';
const cx = require('../helpers/contacts');

export default class Contacts extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      open: false,
      contact: {},
      run: false,
      onboarding: false, 
      activeItem: "List", 
      mapView: false
    }
  }

  handleDelete = () => {
    this.setState({ open: false }, () => {
      cx.hanldeDeleteContact(this.state.contact)
    })
  }

  typeFilter = (tag) => {
    this.setState({ visible: false}, () => {
      cx.typeFilter(tag);
    })
  }

  dateFilterContacts = (date) => {
    this.setState({ visible: false}, () => {
      cx.dateFilterContacts(date)
    })
  }

  handleTagModal = (contact) => {
    this.setState({ contact });
    setGlobal({ tagModalOpen: true });
    cx.loadSingleContact(contact);
  }

  renderContactDisplay() {
    const { graphitePro, applyFilter, filteredContacts, deleteState, contactsPerPage} = this.global;
    const { activeItem } = this.state;
    
    applyFilter === true ? cx.applyContactsFilter() : console.log("null");
 
    let contacts;
    if(filteredContacts) {
      contacts = filteredContacts;
    } else {
      contacts = [];
    }

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(contacts.length / contactsPerPage); i++) {
     pageNumbers.push(i);
   }

    deleteState === true ? cx.deleteType() : console.log("null");
    const currentContacts = contacts.slice(0).reverse();

    let contactTypes = currentContacts.map(a => a.types);
    let mergedTypes = [].concat.apply([], contactTypes);
    let uniqueTypes = [];
    window.$.each(mergedTypes, function(i, el) {
      if(window.$.inArray(el, uniqueTypes) === -1) uniqueTypes.push(el);
    })

    let date = currentContacts.map(a => a.dateAdded);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })
    if(graphitePro && activeItem === "Map") {
      return (
        <div>
          <ContactsMap />
        </div>
      )
    } else {
      return (
        <ContactsGrid />
      )
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render(){
    const { graphitePro, contactModalOpen, applyFilter, loading, filteredContacts, appliedFilter, deleteState, contactsPerPage, results} = this.global;
    applyFilter === true ? cx.applyContactsFilter() : console.log("null");
    const { visible, activeItem } = this.state;
    let contacts;
    if(filteredContacts) {
      contacts = filteredContacts;
    } else {
      contacts = [];
    }
 
    let theseResults;
    if(results !==null) {
      theseResults = results;
    } else {
      theseResults = [];
    }

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(contacts.length / contactsPerPage); i++) {
     pageNumbers.push(i);
   }


    deleteState === true ? cx.deleteType() : console.log("null");
    
    const currentContacts = contacts.slice(0).reverse();

    let contactTypes = currentContacts.map(a => a.types);
    let mergedTypes = [].concat.apply([], contactTypes);
    let uniqueTypes = [];
    window.$.each(mergedTypes, function(i, el) {
      if(window.$.inArray(el, uniqueTypes) === -1) uniqueTypes.push(el);
    })

    let date = currentContacts.map(a => a.dateAdded);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    if(!loading) {
    return (
      <div>
        <Nav />
        <div className="docs">
        <Container style={{marginTop:"65px"}}>
        <Grid stackable columns={2}>
          <Grid.Column>
            <h2>Contacts ({currentContacts.length})
            <Modal 
            closeIcon 
            style={{borderRadius: "0"}} 
            trigger={<Button onClick={() => setGlobal({ contactModalOpen: true })} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>}
            open={contactModalOpen}
            onClose={() => setGlobal({ contactModalOpen: false })}
            >
              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Add a New Contact</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <h3>Search for a contact</h3>
                  <Input icon='users' iconPosition='left' placeholder='Search users...' onChange={cx.handleNewContact} />
                  <Item.Group divided>
                  {
                    theseResults.map(result => {
                    let profile = result.profile;
                    let image = profile.image;
                    let imageLink;
                    if(image) {
                      if(image[0]){
                        imageLink = image[0].contentUrl;
                      } else {
                        imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                      }
                    } else {
                      imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                    }

                      return (
                          <Item className="contact-search" onClick={() => cx.handleAddContact(result)} key={result.username}>
                          <Item.Image size='tiny' src={imageLink} />
                          <Item.Content verticalAlign='middle'>{result.username}</Item.Content>
                          </Item>
                          )
                        }
                      )
                  }
                  </Item.Group>
                </Modal.Description>
              </Modal.Content>
            </Modal>
              {appliedFilter === false ? <span className="filter"><button className="link-button" onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer", color: "#4183c4"}}>Filter<Icon name='caret down' /></button></span> : <span className="hide"><button className="link-button" style={{color: "#4183c4"}}>Filter</button></span>}
              {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={cx.clearContactsFilter}>Clear</Label></span> : <div />}
            </h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={cx.filterContactsList} icon='search' placeholder='Search...' />
          </Grid.Column>
        </Grid>
        <Sidebar
          as={Menu}
          animation='overlay'
          icon='labeled'
          inverted
          onHide={() => this.setState({ visible: false })}
          vertical
          visible={visible}
          width='thin'
          style={{width: "250px"}}
        >


          <Menu.Item as='a'>
            Types
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueTypes.map(tag => {
                  return (
                    <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.typeFilter(tag)} />
                  )
                })
              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
          <Menu.Item as='a'>
            Date
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueDate.map(date => {
                  return (
                    <Dropdown.Item key={Math.random()} text={date} onClick={() => this.dateFilterContacts(date)} />
                  )
                })

              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Sidebar>
        <div className="margin-top-20">
          <Menu secondary>
              <Menu.Item name='List' active={activeItem === 'List'} onClick={this.handleItemClick} />
              {
                graphitePro ? 
                <Menu.Item name='Map' active={activeItem === 'Map'} onClick={this.handleItemClick} /> : 
                <Modal closeIcon trigger={<Menu.Item><Icon name="globe" />Map</Menu.Item>}>
                  <Modal.Header>Ready to get more?</Modal.Header>
                  <Modal.Content>
                  <Modal.Description>
                      <p>With Graphite Pro, you can add additional metadata about your contacts, including addresses, and visualize them on a map. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                      <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                  </Modal.Description>
                  </Modal.Content>
                </Modal>
              }
          </Menu>
          </div>
          <div className="">
          {this.renderContactDisplay()}
          
        </div>
            </Container>
          </div>

      </div>
    );
  } else {
    return(
        <ContactsSkeleton />
    )

  }
  }
}
