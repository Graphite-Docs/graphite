import React, { Component, setGlobal } from 'reactn';
import Skeleton from './Skeleton';
import { Container, Input, Grid, Button, Icon, Dropdown, Modal, Menu, Label, Sidebar } from 'semantic-ui-react';
import Nav from '../../shared/views/Nav';
import { Link } from 'react-router-dom';
import MyFiles from './MyFiles';
import SharedWithMeCollection from './SharedWithMeCollection';
import { fetchSharedFiles } from '../helpers/sharedFilesCollection';
import DropModal from './DropModal';
const vault = require('../helpers/vault');

class Vault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      open: false,
      file: {},
      onboarding: false,
      run: false,
      activeItem: "My Files"
    }
  }

  componentDidMount() {
    setTimeout(fetchSharedFiles, 3000);
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  tagFilter = (tag, type) => {
    this.setState({ visible: false });
    vault.tagVaultFilter(tag, type);
  }

  dateFilter = (date, type) => {
    this.setState({ visible: false });
    vault.dateVaultFilter(date, type)
  }

  collabVaultFilter = (collab, type) => {
    this.setState({ visible: false });
    vault.collabVaultFilter(collab, type)
  }

  handleDelete = () => {
    this.setState({ open: false });
    let file = this.state.file;
    vault.handleDeleteVaultItem(file)
  }

  handleReject = () => {
    console.log("Rejected")
  }

  render() {
    const { vaultModalOpen, loading, graphitePro, contacts, appliedFilter, currentPage, filesPerPage, filteredFiles } = this.global;
    const { visible, activeItem } = this.state;

    let files;
    if (filteredFiles !== null) {
      files = filteredFiles;
    } else {
      files = [];
    }

    const indexOfLastFile = currentPage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = files.slice(0).reverse();

    let shared = currentFiles.map(a => a.sharedWithSingle);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentFiles.map(a => a.tags);
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
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => vault.handleVaultPageChange(number)} />
          );
        });

    if(loading) {
      return <Skeleton />
    } else {
      return (
        <div>
        <Nav />
        <Container style={{marginTop:"65px"}}>
        <Grid stackable columns={2}>
          <Grid.Column>
            <h2>Files ({currentFiles.length})
              <Modal 
                closeIcon 
                style={{borderRadius: "0", background: "#eee"}} 
                trigger={<Button onClick={() => setGlobal({vaultModalOpen: true})} style={{borderRadius: "0", marginLeft: "10px"}} secondary>Add</Button>}
                open={vaultModalOpen}
                onClose={() => setGlobal({vaultModalOpen: false})}
                >
                <DropModal />
              </Modal>
              {appliedFilter === false ? <span className="filter"><button className='link-button' onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer", color: "#4183c4"}}>Filter<Icon name='caret down' /></button></span> : <span className="hide"><button className='link-button'>Filter</button></span>}
              {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={vault.clearVaultFilter}>Clear</Label></span> : <div />}
            </h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={vault.filterVaultList} icon='search' placeholder='Search...' />
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

        <div className="margin-top-20">
          <Menu secondary>
              <Menu.Item name='My Files' active={activeItem === 'My Files'} onClick={this.handleItemClick} />
              <Menu.Item
              name='Shared With Me'
              active={activeItem === 'Shared With Me'}
              onClick={this.handleItemClick}
              />
              <Menu.Menu position="right">
                  {
                      graphitePro ? 
                      <Menu.Item active={activeItem === 'Team Files'} onClick={this.handleItemClick}><Icon name="group" />Team Documents</Menu.Item>
                      :
                      <Modal closeIcon trigger={<Menu.Item><Icon name="group" />Team Files</Menu.Item>}>
                          <Modal.Header>Working as a team?</Modal.Header>
                          <Modal.Content>
                          <Modal.Description>
                              <p>Graphite Pro has all the team features you and the rest of your organization could need. <Link to={'/trial'}>Sign up today for a 30-day free trial.</Link></p>
                              <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                          </Modal.Description>
                          </Modal.Content>
                      </Modal>
                  }
                  
              </Menu.Menu> 
          </Menu>
          </div>
          { activeItem === "My Files" ? 
            <MyFiles 
              currentFiles={currentFiles}
              indexOfFirstFile={indexOfFirstFile}
              indexOfLastFile={indexOfLastFile}
              contacts={contacts}
              pageNumbers={pageNumbers}
              renderPageNumbers={renderPageNumbers}
            /> : 
            <SharedWithMeCollection 
              indexOfFirstFile={indexOfFirstFile}
              indexOfLastFile={indexOfLastFile} 
              pageNumbers={pageNumbers}
              renderPageNumbers={renderPageNumbers}
            />
          }
          </Container>
        </div>
       );
    }
  }
}

export default Vault;
