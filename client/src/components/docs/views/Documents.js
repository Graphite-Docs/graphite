import React, { Component } from 'reactn';
import { Container, Modal, Input, Grid, Button, Icon, Dropdown, Menu, Label, Sidebar } from 'semantic-ui-react';
import MyDocs from './MyDocs';
import SharedWithMe from './SharedWithMeCollection';
import { Link } from 'react-router-dom';
import Skeleton from './Skeleteon';
import Nav from '../../shared/views/Nav';
import { fetchSharedDocs } from '../helpers/sharedDocsCollection';
const gdocs = require('../helpers/documents');

class Documents extends Component {
    constructor(props) {
        super(props);
        this.state = {
          contactToShareWith: "",
          open: false,
          visible: false,
          doc: {},
          run: false,
          onboarding: false, 
          activeItem: "My Documents"
        }
    }

    componentDidMount() {
        // console.log(window.startWorker());
        setTimeout(fetchSharedDocs, 3000);
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })


    dateFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.dateFilter(props)
        })
    }

    tagFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.tagFilter(props)
        })
    }

    collabFilter = (props) => {
        this.setState({ visible: false}, () => {
            gdocs.collabFilter(props)
        })
    }
  render() {
    const { visible, activeItem } = this.state;
    const { graphitePro, deleteModalOpen, selectedDoc, tagModalOpen, shareModalOpen, results, filteredDocs, appliedFilter, singleDocTags, contacts, currentPage, docsPerPage, loading, tag } = this.global;
    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = filteredDocs.sort((a, b) => parseFloat(b.lastUpdate) - parseFloat(a.lastUpdate));
    // const currentDocs = filteredDocs.sort(function(a,b){return new Date(b.lastUpdate) - new Date(a.lastUpdate)});
    let shared = currentDocs.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
    if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentDocs.map(a => a.singleDocTags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
    if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentDocs.map(a => a.updated);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
    if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })


    // Logic for displaying page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredDocs.length / docsPerPage); i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => {
            return (
                <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => gdocs.handlePageChange(number)} />
            );
            });

      if(loading) {
          return (
              <Skeleton />
          )
      } else {
        return (
            <div>
                <Nav />
                <Container className='margin-top-65'>
                    <Grid stackable columns={2}>
                        <Grid.Column>
                        <h2>Documents ({filteredDocs.length})
                            {/* <Button onClick={this.handleaddItem} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button> */}
                            <Link to={`/documents/new/${Date.now()}`}><Button style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button></Link>
                            {appliedFilter === false ? <span className="filter"><button className='link-button' onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer", color: "#4183c4"}}>Filter<Icon name='caret down' /></button></span> : <span className="hide"><button className='link-button' style={{color: "#4183c4"}}>Filter</button></span>}
                            {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={gdocs.clearFilter}>Clear</Label></span> : <div />}
                        </h2>
                        </Grid.Column>
                        <Grid.Column>
                            <Input className='search-box' onChange={gdocs.filterList} icon='search' placeholder='Search...' />
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
                                <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.tagFilter(tag)} />
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
                                <Dropdown.Item key={Math.random()} text={collab} onClick={() => this.collabFilter(collab)} />
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
                                <Dropdown.Item key={Math.random()} text={date} onClick={() => this.dateFilter(date)} />
                              )
                            })
      
                          }
                          </Dropdown.Menu>
                        </Dropdown>
                      </Menu.Item>
                    </Sidebar>
                    <div className="margin-top-20">
                    <Menu secondary>
                        <Menu.Item name='My Documents' active={activeItem === 'My Documents'} onClick={this.handleItemClick} />
                        <Menu.Item
                        name='Shared With Me'
                        active={activeItem === 'Shared With Me'}
                        onClick={this.handleItemClick}
                        />
                        <Menu.Menu position="right">
                            {
                                graphitePro ? 
                                <Menu.Item active={activeItem === 'Team Documents'} onClick={this.handleItemClick}><Icon name="group" />Team Documents</Menu.Item>
                                :
                                <Modal closeIcon trigger={<Menu.Item><Icon name="group" />Team Documents</Menu.Item>}>
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
                    {
                        activeItem === "My Documents" ?
                        <MyDocs 
                            currentDocs={currentDocs}
                            indexOfFirstDoc={indexOfFirstDoc}
                            indexOfLastDoc={indexOfLastDoc}
                            shareModalOpen={shareModalOpen}
                            results={results}
                            contacts={contacts}
                            tagModalOpen={tagModalOpen}
                            tag={tag}
                            singleDocTags={singleDocTags}
                            deleteModalOpen={deleteModalOpen}
                            selectedDoc={selectedDoc}
                            renderPageNumbers={renderPageNumbers}
                            pageNumbers={pageNumbers}
                        /> : 
                        <SharedWithMe />
                    }
                </Container>
            </div>
           );
      }
  }
}

export default Documents;
