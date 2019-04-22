import React, { Component, setGlobal } from "reactn";
import { Link } from "react-router-dom";
import ContactsSkeleton from './ContactsSkeleton';
import { Image, Container, Input, Grid, Button, Table, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import Nav from '../../shared/views/Nav';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
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
      activeItem: "List"
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

  render(){
    const { type, tagModalOpen, graphitePro, contactModalOpen, applyFilter, loading, filteredContacts, appliedFilter, deleteState, currentPage, types, contactsPerPage, results} = this.global;
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

    let theseTypes;
    if(types) {
      theseTypes = types;
    } else {
      theseTypes = [];
    }

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(contacts.length / contactsPerPage); i++) {
     pageNumbers.push(i);
   }
   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => cx.handleContactsPageChange(number)} />
          );
        });

    deleteState === true ? cx.deleteType() : console.log("null");
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
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
          <Table unstackable style={{borderRadius: "0", marginTop: "35px"}}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>ID</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Name</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Added</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Type</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
            {
              currentContacts.slice(indexOfFirstContact, indexOfLastContact).map(contact => {
                var gridTypes;
                if(contact.types) {
                  gridTypes = Array.prototype.slice.call(contact.types);
                } else {
                  gridTypes = [];
                }
              return(
                <Table.Row key={contact.contact || contact.id}>
                  <Table.Cell>
                  <Image style={{height: "40px", width: "40px", marginRight: "10px"}} src={contact.img ? contact.img || avatarFallbackImage : contact.image || avatarFallbackImage} avatar />
                  <span>
                    <Link to={`/contacts/${contact.contact ? contact.contact : contact.id}`}>
                      {contact.contact ? contact.contact.length > 30 ? contact.contact.substring(0,30)+"..." :  contact.contact : contact.id}
                    </Link>
                  </span>
                  </Table.Cell>
                  <Table.Cell>{contact.name || ""}</Table.Cell>
                  <Table.Cell>{contact.dateAdded}</Table.Cell>
                  <Table.Cell>{gridTypes === [] ? gridTypes : gridTypes.join(', ')}</Table.Cell>
                  <Table.Cell>
                  <Dropdown icon='ellipsis vertical' className='actions'>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <Modal 
                          closeIcon 
                          trigger={<button className="link-button" onClick={() => this.handleTagModal(contact)} style={{color: "#282828"}}><Icon name='tag'/>Type</button>}
                          open={tagModalOpen}
                          onClose={() => setGlobal({ tagModalOpen: false })}
                          >
                          <Modal.Header>Manage Types</Modal.Header>
                          <Modal.Content>
                            <Modal.Description>
                            <Input placeholder='Enter a type...' value={type} onKeyUp={cx.checkKey} onChange={cx.setTypes} />
                            <Button onClick={() => cx.addTypeManual(contact, 'contact')} style={{borderRadius: "0"}}>Add Type</Button><br/>
                            {
                              theseTypes.slice(0).reverse().map(tag => {
                                return (
                                  <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                    {tag}
                                    <Icon onClick={() => cx.deleteType(tag, 'contact')} name='delete' />
                                  </Label>
                                )
                              })
                            }
                            <div>
                              <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => cx.saveTypes(this.state.contact)}>Save Types</Button>
                            </div>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <Modal open={this.state.open} trigger={
                          <button className="link-button" onClick={() => this.setState({ open: true, contact: contact })} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</button>
                        } basic size='small'>
                          <SemanticHeader icon='trash alternate outline' content={this.state.contact.contact ? `Delete ${this.state.contact.contact}?` : this.state.contact.id ? `Delete ${this.state.contact.id}?` : 'Delete contact?'} />
                          <Modal.Content>
                            <p>
                              The contact can be restored by re-adding the user.
                            </p>
                          </Modal.Content>
                          <Modal.Actions>
                            <div>
                              {
                                loading ?
                                <ContactsSkeleton style={{bottom: "0"}} /> :
                                <div>
                                  <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
                                    No
                                  </Button>
                                  <Button onClick={this.handleDelete} color='red' inverted>
                                    Delete
                                  </Button>
                                </div>
                              }
                            </div>
                          </Modal.Actions>
                        </Modal>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  </Table.Cell>
                </Table.Row>
              );
              })
              }
            </Table.Body>
          </Table>
          <div>
                 {
            pageNumbers.length > 0 ?
            <div style={{textAlign: "center"}}>
            <Menu pagination>
            {renderPageNumbers}
            </Menu>
            </div> :
            <div />
        }
        <div style={{float: "right", marginBottom: "25px"}}>
            <label>Contacts per page</label>
            <span className="custom-dropdown small">
            <select className="ui selection dropdown custom-dropdown" onChange={cx.setContactsPerPage}>
            <option value={10}>
            10
            </option>
            <option value={20}>
            20
            </option>
            <option value={50}>
            50
            </option>
        </select>
        </span>
        </div>
          </div>
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
