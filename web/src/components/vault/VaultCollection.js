import React, { Component } from 'react';
import { Container, Input, Grid, Button, Table, Message, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import Header from '../Header';
import Loading from '../Loading';
import { Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import Joyride from "react-joyride";
import {
  getFile,
  putFile
} from 'blockstack'

export default class VaultCollection extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      open: false,
      file: {},
      onboarding: false,
      run: false
    }
  }

  componentDidMount() {
    getFile('vaultPageOnboarding.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ onboarding: JSON.parse(fileContents)})
        } else {
          this.setState({ onboarding: false });
        }
      })
      .then(() => {
        this.checkFiles();
      })
  }

  checkFiles = () => {
    if(this.props.files < 1) {
      if(!this.state.onboarding) {
        this.setState({ run: true, onboarding: true }, () => {
          putFile('vaultPageOnboarding.json', JSON.stringify(this.state.onboarding), {encrypt: true})
        });
      }
    } else {
      this.setState({ onboarding: true }, () => {
        putFile('vaultPageOnboarding.json', JSON.stringify(this.state.onboarding), {encrypt: true})
      });
    }
  }

  tagFilter = (tag, type) => {
    this.setState({ visible: false });
    this.props.tagVaultFilter(tag, type);
  }

  dateFilter = (date, type) => {
    this.setState({ visible: false });
    this.props.dateVaultFilter(date, type)
  }

  collabVaultFilter = (collab, type) => {
    this.setState({ visible: false });
    this.props.collabVaultFilter(collab, type)
  }

  handleDelete = () => {
    this.setState({ open: false });
    let file = this.state.file;
    this.props.handleDeleteVaultItem(file)
  }

  render() {
    const steps = [
      {
        content: <div><h2>This is where you will upload and manage your secure files.</h2><p>By uploading files to Vault, you are easily securing those files with encryption tied to keys you, and you alone, own.</p></div>,
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
        content: <p>This is the files grid. Your existing files will be displayed here and can be accessed by clicking the file title.</p>,
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
        content: <p>By clicking add, you will be prompted to upload a new file. Supported files will be uploadable, and unsupported files will be greyed out.</p>,
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
        content: <p>You can filter by the upload date of your files, tags you have applied to your files, or the people you have shared with.</p>,
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
        content: <p>The search box lets you search across all your files. Just start typing the title you are looking for.</p>,
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


    const { displayMessage, results, loading, graphitePro, singleFileTags, contacts, appliedFilter, currentPage, filesPerPage, filteredVault } = this.props;
    const { visible } = this.state;
    const dropzoneStyle = {
      width  : "100%",
      height : "400px",

      marginTop: "74px",
      background: "#282828",
      paddingTop: "10%",
      cursor: "pointer"
    };

    let files;
    if (filteredVault !== null) {
      files = filteredVault;
    } else {
      files = [];
    }

    let vaultTags;
    if(singleFileTags) {
      vaultTags = singleFileTags;
    } else {
      vaultTags = []
    }

    const indexOfLastFile = currentPage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = files.slice(0).reverse();

    let shared = currentFiles.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentFiles.map(a => a.singleFileTags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentFiles.map(a => a.uploaded);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    let type = currentFiles.map(a => a.type);
    let mergedType = [].concat.apply([], type);
    let uniqueType = [];
    window.$.each(mergedType, function(i, el) {
      if(window.$.inArray(el, uniqueType) === -1) uniqueType.push(el);
    })

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(files.length / filesPerPage); i++) {
     pageNumbers.push(i);
   }


   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.props.currentPage.toString() === number.toString()} onClick={() => this.props.handleVaultPageChange(number)} />
          );
        });


    if(!loading) {
      return (
        <div>
        <Header
          graphitePro={graphitePro}
        />
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
            <h2>Files ({currentFiles.length})
              <Modal closeIcon style={{borderRadius: "0"}} trigger={<Button style={{borderRadius: "0", marginLeft: "10px"}} secondary>Add</Button>}>
                <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Upload a File</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <Dropzone
                      style={dropzoneStyle}
                      onDrop={ this.props.handleVaultDrop }
                      accept="application/rtf, application/x-rtf, text/richtext, text/plain, application/rtf, application/x-rtf, text/rtf, application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, video/quicktime, video/x-ms-wmv,video/mp4,application/pdf,image/png,image/jpeg,image/jpg,image/tiff,image/gif"
                      multiple={ false }
                      onDropRejected={ this.props.handleDropRejected }>
                      <div style={{marginTop: "45px"}}>
                        <h1 style={{textAlign: "center", color: "#fff"}} className="upload-cloud"><Icon style={{fontSize: "40px"}} name="cloud upload" /></h1>
                        <h3 style={{textAlign: "center", color: "#fff", fontSize: "40px"}} className="white-text">Drag files or click to upload</h3>
                      </div>
                    </Dropzone>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
              {appliedFilter === false ? <span className="filter"><a onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer"}}>Filter<Icon name='caret down' /></a></span> : <span className="hide"><a>Filter</a></span>}
              {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={this.props.clearVaultFilter}>Clear</Label></span> : <div />}
            </h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={this.props.filterVaultList} icon='search' placeholder='Search...' />
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
            Tags
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueTags.map(tag => {
                  return (
                    <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.tagFilter(tag, 'tag')} />
                  )
                })
              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
          <Menu.Item as='a'>
            Collaborators
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueCollabs.map(collab => {
                  return (
                    <Dropdown.Item key={Math.random()} text={collab} onClick={() => this.collabVaultFilter(collab, 'collab')} />
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
                    <Dropdown.Item key={Math.random()} text={date} onClick={() => this.dateFilter(date, 'date')} />
                  )
                })

              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Sidebar>
        <Table unstackable style={{borderRadius: "0"}}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared With</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Uploaded</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              currentFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
                var tags;
                var collabs;
                var uniqueCollaborators;
                if(file.singleFileTags) {
                  tags = Array.prototype.slice.call(file.singleFileTags);
                } else {
                  tags = [];
                }
                if(file.sharedWith) {
                  collabs = Array.prototype.slice.call(file.sharedWith);
                  uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index);
                } else {
                  collabs = [];
                  uniqueCollaborators = [];
                }

              return(
                <Table.Row key={file.id} style={{ marginTop: "35px"}}>
                  <Table.Cell><Link to={'/vault/' + file.id}>{file.name ? file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name : "Untitled"}</Link></Table.Cell>
                  <Table.Cell>{uniqueCollaborators === [] ? uniqueCollaborators : uniqueCollaborators.join(', ')}</Table.Cell>
                  <Table.Cell>{file.uploaded}</Table.Cell>
                  <Table.Cell>{tags === [] ? tags : tags.join(', ')}</Table.Cell>
                  <Table.Cell>
                    <Dropdown icon='ellipsis vertical' className='actions'>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <Modal closeIcon style={{borderRadius: "0"}} trigger={<Link to={'/vault'} style={{color: "#282828"}}><Icon name='share alternate'/>Share</Link>}>
                            <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Document</Modal.Header>
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
                                        <Item className="contact-search" onClick={() => this.props.sharedVaultInfo(result.fullyQualifiedName, file)} key={result.username}>
                                        <Item.Image size='tiny' src={imageLink} />
                                        <Item.Content verticalAlign='middle'>{result.username}</Item.Content>
                                        </Item>
                                        )
                                      }
                                    )
                                }
                                </Item.Group>
                                <hr />
                                <Item.Group divided>
                                <h4>Your Contacts</h4>
                                {contacts.slice(0).reverse().map(contact => {
                                  return (
                                    <Item className="contact-search" onClick={() => this.props.sharedVaultInfo(contact.contact, file)} key={contact.contact}>
                                      <Item.Image size='tiny' src={contact.img} />
                                      <Item.Content verticalAlign='middle'>{contact.contact}</Item.Content>
                                    </Item>
                                  )
                                })
                              }
                              </Item.Group>
                              </Modal.Description>
                            </Modal.Content>
                          </Modal>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Modal closeIcon trigger={<Link onClick={() => this.props.loadSingleVaultTags(file)} to={'/vault'} style={{color: "#282828"}}><Icon name='tag'/>Tag</Link>}>
                            <Modal.Header>Manage Tags</Modal.Header>
                            <Modal.Content>
                              <Modal.Description>
                              <Input placeholder='Type a tag...' value={this.props.tag} onChange={this.props.setVaultTags} />
                              <Button onClick={() => this.props.addVaultTagManual(file, 'vault')} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                              {
                                vaultTags.slice(0).reverse().map(tag => {
                                  return (
                                    <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                      {tag}
                                      <Icon onClick={() => this.props.deleteVaultTag(tag, 'vault')} name='delete' />
                                    </Label>
                                  )
                                })
                              }
                              <div>
                                <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => this.props.saveNewVaultTags(file)}>Save Tags</Button>
                              </div>
                              </Modal.Description>
                            </Modal.Content>
                          </Modal>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>
                          <Modal open={this.state.open} trigger={
                            <a onClick={() => this.setState({ open: true, file: file })} to={'/vault'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                          } basic size='small'>
                            <SemanticHeader icon='trash alternate outline' content={this.state.file.name ? 'Delete ' + this.state.file.name + '?' : 'Delete file?'} />
                            <Modal.Content>
                              <p>
                                The file cannot be restored.
                              </p>
                            </Modal.Content>
                            <Modal.Actions>
                              <div>
                                {
                                  this.state.loading ?
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
              <label>Files per page</label>
              <select value={filesPerPage} onChange={this.props.setPagination}>
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

          {displayMessage ?
            <Message
              style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
              header='This user has not yet logged into Graphite'
              content='Ask them to log in first so that you can share encrypted files.'
            /> :
            null
          }

          </div>
          </Container>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }
  }
}
