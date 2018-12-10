import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  loadUserData
} from 'blockstack';
import Loading from '../Loading';
import { Image, Card, Container, Input, Grid, Button, Table, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import Header from '../Header';
import Joyride from "react-joyride";
import {
  getFile,
  putFile
} from 'blockstack'
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Contacts extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      open: false,
      contact: {},
      run: false,
      onboarding: false
    }
  }

  componentDidMount() {
    this.props.loadContactsCollection();
    getFile('contactsPageOnboarding.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ onboardingComplete: JSON.parse(fileContents)})
        } else {
          this.setState({ onboardingComplete: false });
        }
      })
      .then(() => {
        this.checkFiles();
      })
  }

  checkFiles = () => {
    if(this.props.contacts < 1) {
      if(!this.state.onboarding) {
        this.setState({ run: true, onboardingComplete: true }, () => {
          putFile('contactsPageOnboarding.json', JSON.stringify(this.state.onboardingComplete), {encrypt: true})
        });
      }
    } else {
      this.setState({ onboardingComplete: true }, () => {
        putFile('contactsPageOnboarding.json', JSON.stringify(this.state.onboardingComplete), {encrypt: true})
      });
    }
  }

  componentDidUpdate() {
    if(this.props.confirmAdd === true) {
      this.props.handleAddContact();
    }
    if(this.props.confirmManualAdd === true) {
      this.props.handleManualAdd();
    }
  }

  handleDelete = () => {
    console.log(this.state.contact)
    this.setState({ open: false }, () => {
      this.props.handleDeleteContact(this.state.contact)
    })
  }

  typeFilter = (tag) => {
    this.setState({ visible: false}, () => {
      this.props.typeFilter(tag);
    })
  }

  dateFilterContacts = (date) => {
    this.setState({ visible: false}, () => {
      this.props.dateFilterContacts(date)
    })
  }

  render(){
    const steps = [
      {
        content: <div><h2>This is where you will add and manage your contacts.</h2><p>You will be able to add any user that has an existing Blockstack username.</p></div>,
        placement: "center",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "body"
      },
      {
        content: <p>This is the contacts grid. Your existing contacts will be displayed here and can be accessed by clicking the contact ID.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: "table.table"
      },
      {
        content: <p>By clicking new, you will be prompted to search for a new contact. Search by the person'{/*'*/}s name or Blockstack username.</p>,
        placement: "top",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".column button.secondary"
      },
      {
        content: <p>You can filter by the date added or by the contact type you may have applied to your contacts.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".filter a"
      },
      {
        content: <p>The search box lets you search across all your contacts. Just start typing the contact ID you are looking for.</p>,
        placement: "bottom",
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 100000
          }
        },
        locale: {
          skip: "Skip tour"
        },
        target: ".input input"
      }
    ]


    this.props.applyFilter === true ? this.props.applyContactsFilter() : loadUserData();
    const { loading, filteredContacts, appliedFilter, deleteState, currentPage, contactsPerPage} = this.props;
    const { visible } = this.state;
    let contacts = filteredContacts;
    let results;
    if(this.props.results !=null) {
      results = this.props.results;
    } else {
      results = [];
    }

    let types;
    if(this.props.types) {
      types = this.props.types;
    } else {
      types = [];
    }

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(contacts.length / contactsPerPage); i++) {
     pageNumbers.push(i);
   }
   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.props.currentPage.toString() === number.toString()} onClick={() => this.props.handleContactsPageChange(number)} />
          );
        });

    deleteState === true ? this.props.deleteType() : loadUserData();
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
        <Header />
        <div className="docs">
        <Container style={{marginTop:"65px"}}>
        <Joyride
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          run={this.state.run}
          steps={steps}
          callback={this.handleJoyrideCallback}
        />
        <Grid stackable columns={2}>
          <Grid.Column>
            <h2>Contacts ({currentContacts.length})
            <Modal closeIcon style={{borderRadius: "0"}} trigger={<Button style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>}>
              <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Add a New Contact</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <h3>Search for a contact</h3>
                  <Input icon='users' iconPosition='left' placeholder='Search users...' onChange={this.props.handleNewContact} />
                  <Item.Group divided>
                  {results.map(result => {
                    let profile = result.profile;
                    let image = profile.image;
                    let imageLink;
                    if(image !=null) {
                      if(image[0]){
                        imageLink = image[0].contentUrl;
                      } else {
                        imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                      }
                    } else {
                      imageLink = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
                    }

                      return (
                          <Item className="contact-search" onClick={() => this.props.handleAddContact(result.fullyQualifiedName)} key={result.username}>
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
              {appliedFilter === false ? <span className="filter"><a onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer"}}>Filter<Icon name='caret down' /></a></span> : <span className="hide"><a>Filter</a></span>}
              {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={this.props.clearContactsFilter}>Clear</Label></span> : <div />}
            </h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={this.props.filterContactsList} icon='search' placeholder='Search...' />
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
                <Table.Row key={contact.contact}>
                  <Table.Cell>
                  <Image style={{height: "40px", width: "40px", marginRight: "10px"}} src={contact.img || avatarFallbackImage} avatar /><span>
                  <Modal closeIcon style={{borderRadius: "0"}} trigger={<Link to={'/contacts'}>
                    {contact.contact.length > 30 ? contact.contact.substring(0,30)+"..." :  contact.contact}
                  </Link>}>
                    <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>{contact.contact}</Modal.Header>
                    <Modal.Content>
                    <Card style={{margin: "auto"}}>
                      <Image src={contact.img || avatarFallbackImage} />
                      <Card.Content>
                        <Card.Header>{contact.name ? contact.name : contact.contact}</Card.Header>
                        <Card.Description>{contact.description} <br/></Card.Description>
                      </Card.Content>
                      <Card.Content extra>
                        <Link to={'/documents/shared/' + contact.contact}>
                          <Icon style={{fontSize: "26px"}} name='file alternate outline' />
                          Shared Docs
                        </Link>
                        <Link to={'/vault/shared/' + contact.contact}>
                          <Icon style={{fontSize: "26px", marginLeft: "5px"}} name='shield alternate' />
                          Shared Files
                        </Link>
                      </Card.Content>
                    </Card>
                    </Modal.Content>
                  </Modal>

                  </span>
                  </Table.Cell>
                  <Table.Cell>{contact.name || ""}</Table.Cell>
                  <Table.Cell>{contact.dateAdded}</Table.Cell>
                  <Table.Cell>{gridTypes === [] ? gridTypes : gridTypes.join(', ')}</Table.Cell>
                  <Table.Cell>
                  <Dropdown icon='ellipsis vertical' className='actions'>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <Modal closeIcon trigger={<Link onClick={() => this.props.loadSingleTypes(contact)} to={'/contacts'} style={{color: "#282828"}}><Icon name='tag'/>Type</Link>}>
                          <Modal.Header>Manage Types</Modal.Header>
                          <Modal.Content>
                            <Modal.Description>
                            <Input placeholder='Enter a type...' value={this.props.type} onChange={this.props.setTypes} />
                            <Button onClick={() => this.props.addTypeManual(contact, 'contact')} style={{borderRadius: "0"}}>Add Type</Button><br/>
                            {
                              types.slice(0).reverse().map(tag => {
                                return (
                                  <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                    {tag}
                                    <Icon onClick={() => this.props.deleteType(tag, 'contact')} name='delete' />
                                  </Label>
                                )
                              })
                            }
                            <div>
                              <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => this.props.saveNewTypes(contact)}>Save Types</Button>
                            </div>
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <Modal open={this.state.open} trigger={
                          <a onClick={() => this.setState({ open: true, contact: contact })} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                        } basic size='small'>
                          <SemanticHeader icon='trash alternate outline' content={this.state.contact.contact ? 'Delete ' + this.state.contact.contact + '?' : 'Delete contact?'} />
                          <Modal.Content>
                            <p>
                              The contact can be restored by re-adding the user.
                            </p>
                          </Modal.Content>
                          <Modal.Actions>
                            <div>
                              {
                                loading ?
                                <Loading style={{bottom: "0"}} /> :
                                <div>
                                  <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
                                    <Icon name='remove' /> No
                                  </Button>
                                  <Button onClick={this.handleDelete} color='red' inverted>
                                    <Icon name='checkmark' /> Delete
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
            <div style={{maxWidth: "50%", margin:"auto"}}>
              <Menu pagination>
              {renderPageNumbers}
              </Menu>
            </div> :
            <div />
          }
            <div style={{float: "right", marginBottom: "25px"}}>
              <label>Contacts per page</label>
              <select value={this.props.contactsPerPage} onChange={this.props.setContactsPerPage}>
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
            </div>
          </div>
        </div>
            </Container>
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
