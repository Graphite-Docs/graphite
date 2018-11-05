import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Loading from '../Loading';
import { Container, Input, Grid, Button, Table, Message, Icon, Dropdown, Modal, Menu, Label, Sidebar, Item } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import {
  isSignInPending,
  handlePendingSignIn
} from 'blockstack';
import Header from '../Header';

export default class Collections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      teamView: false,
      open: false,
      visible: false
    }
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  handleDeleteDoc = (props) => {
    this.props.handleDeleteDoc(props);
    this.setState({ loading: true })
  }

  dateFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.dateFilter(props)
    })
  }

  tagFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.tagFilter(props)
    })
  }

  collabFilter = (props) => {
    this.setState({ visible: false}, () => {
      this.props.collabFilter(props)
    })
  }

  render() {
    const { displayMessage, results, docs, graphitePro, filteredValue, appliedFilter, singleDocTags, contacts, currentPage, docsPerPage, loading } = this.props;
    const teamView = this.state.teamView;
    const {visible} = this.state;
    const link = '/documents/doc/' + this.props.tempDocId;
    if (this.props.redirect) {
      return <Redirect push to={link} />;
    }
    let teamDocs = docs.filter(doc => doc.teamDoc === true);

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    // const currentDocs = filteredValue.slice(0).reverse();
    const currentDocs = filteredValue.sort(function(a,b){return new Date(b.updated) - new Date(a.updated)});
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
   for (let i = 1; i <= Math.ceil(filteredValue.length / docsPerPage); i++) {
     pageNumbers.push(i);
   }

   const pageNumbersTeam = [];
   for (let i = 1; i <= Math.ceil(teamDocs.length / docsPerPage); i++) {
     pageNumbersTeam.push(i);
   }

   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.props.currentPage.toString() === number.toString()} onClick={() => this.props.handlePageChange(number)} />
          );
        });

        const renderTeamPageNumbers = pageNumbersTeam.map(number => {
               return (
                 <li
                   key={number}
                   id={number}
                   className={number === this.props.currentPage ? "active" : ""}
                 >
                   <a id={number} onClick={this.props.handlePageChange}>{number}</a>
                 </li>
               );
             });
    if(teamView && !loading) {
      return (

        <div>
          <Header
            graphitePro={graphitePro}
          />
          <Container style={{marginTop:"65px"}}>
            <Grid stackable columns={2}>
              <Grid.Column>
                <h2>Team Documents ({teamDocs.length})</h2>
              </Grid.Column>
              <Grid.Column>
                <Input onChange={this.props.filterList} icon='search' placeholder='Search...' />
              </Grid.Column>
            </Grid>

            {graphitePro ? <Icon className="teamButton" onClick={() => this.setState({ teamView: !this.state.teamView })} name='group' style={{ float: "right", margin: "10px"}} /> : null}
            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Static File</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {
                  teamDocs.slice(indexOfFirstDoc, indexOfLastDoc).reverse().map(doc => {
                  return(
                    <Table.Row key={doc.id}>
                      <Table.Cell><Link to={'/documents/single/shared/'+ doc.user + '/' + doc.id}>{doc.title ? doc.title : "Untitled"}</Link></Table.Cell>
                      <Table.Cell>{this.state.user}</Table.Cell>
                      <Table.Cell>{doc.rtc === true ? "False" : "True"}</Table.Cell>
                      <Table.Cell>{doc.shared}</Table.Cell>
                    </Table.Row>
                  );
                  })
                }
              </Table.Body>
            </Table>
            <div>
            {
              pageNumbersTeam.length > 0 ?
              <div style={{maxWidth: "50%", margin:"auto"}}>
                <Menu pagination>
                {renderTeamPageNumbers}
                </Menu>
              </div> :
              <div />
            }
              <div style={{float: "right"}}>
                <label>Docs per page</label>
                <select value={this.props.docsPerPage} onChange={this.props.setDocsPerPage}>
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

          </Container>
        </div>
      );
    } else if(!loading) {
      return (
        <div>
          <Header
            graphitePro={graphitePro}
          />
          <Container style={{marginTop:"65px"}}>
            <Grid stackable columns={2}>
              <Grid.Column>
                <h2>Documents ({filteredValue.length})
                  <Button onClick={this.props.handleaddItem} style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button>
                  {appliedFilter === false ? <span className="filter"><a onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer"}}>Filter<Icon name='caret down' /></a></span> : <span className="hide"><a>Filter</a></span>}
                  {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={this.props.clearFilter}>Clear</Label></span> : <div />}
                </h2>
              </Grid.Column>
              <Grid.Column>
                <Input onChange={this.props.filterList} icon='search' placeholder='Search...' />
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

            {graphitePro ? <Icon className="teamButton" onClick={() => this.setState({ teamView: !this.state.teamView })} name='group' style={{ float: "right", margin: "10px"}} /> : null}
            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Collaborators</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {
                  currentDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
                    var tags;
                    var collabs;
                    let uniqueCollaborators;
                    if(doc.tags) {
                      tags = Array.prototype.slice.call(doc.tags);
                    } else if(doc.singleDocTags) {
                      tags = Array.prototype.slice.call(doc.singleDocTags);
                    } else {
                      tags = [];
                    }
                    if(doc.sharedWith) {
                      collabs = Array.prototype.slice.call(doc.sharedWith);
                      uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index)
                    } else {
                      collabs = [];
                      uniqueCollaborators = [];
                    }

                  return(
                    <Table.Row key={doc.id}>
                      <Table.Cell><Link to={'/documents/doc/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <Icon name='globe' /> : <Icon name='lock' />}</span></Link></Table.Cell>
                      <Table.Cell>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</Table.Cell>
                      <Table.Cell>{doc.updated}</Table.Cell>
                      <Table.Cell>{tags === "" ? tags : tags.join(', ')}</Table.Cell>
                      <Table.Cell>
                        <Dropdown icon='ellipsis vertical' className='actions'>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <Modal closeIcon style={{borderRadius: "0"}} trigger={<Link to={'/documents'} style={{color: "#282828"}}><Icon name='share alternate'/>Share</Link>}>
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
                                            <Item className="contact-search" onClick={() => this.props.sharedInfo(result.fullyQualifiedName, doc)} key={result.username}>
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
                                        <Item className="contact-search" onClick={() => this.props.sharedInfo(contact.contact, doc)} key={contact.contact}>
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
                              <Modal closeIcon trigger={<Link onClick={() => this.props.loadSingleTags(doc)} to={'/documents'} style={{color: "#282828"}}><Icon name='tag'/>Tag</Link>}>
                                <Modal.Header>Manage Tags</Modal.Header>
                                <Modal.Content>
                                  <Modal.Description>
                                  <Input placeholder='Type a tag...' value={this.props.tag} onChange={this.props.handleTagChange} />
                                  <Button onClick={() => this.props.addTagManual(doc, 'document')} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                                  {
                                    singleDocTags.slice(0).reverse().map(tag => {
                                      return (
                                        <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                          {tag}
                                          <Icon onClick={() => this.props.deleteTag(tag, 'document')} name='delete' />
                                        </Label>
                                      )
                                    })
                                  }
                                  <div>
                                    <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => this.props.saveNewTags(doc)}>Save Tags</Button>
                                  </div>
                                  </Modal.Description>
                                </Modal.Content>
                              </Modal>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item>
                              <Modal open={this.state.open} trigger={
                                <a onClick={() => this.setState({ open: true })} to={'/documents'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                              } basic size='small'>
                                <SemanticHeader icon='trash alternate outline' content={doc.title ? 'Delete ' + doc.title + '?' : 'Delete document?'} />
                                <Modal.Content>
                                  <p>
                                    The document cannot be restored.
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
                                        <Button onClick={() => this.handleDeleteDoc(doc)} color='red' inverted>
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
              <div style={{float: "right"}}>
                <label>Docs per page</label>
                <select value={this.props.docsPerPage} onChange={this.props.setDocsPerPage}>
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
            {displayMessage ?
              <Message
                style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
                header='This user has not yet logged into Graphite'
                content='Ask them to log in first so that you can share encrypted files.'
              /> :
              null
            }

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
//
// <tr key={doc.id}>
//   <td><input type="checkbox" checked={this.props.checked} value={doc.id} id={doc.id} onChange={this.props.handleCheckbox} /><label htmlFor={doc.id}></label></td>
//   <td><Link to={'/documents/doc/' + doc.id}>{doc.title ? doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <i className="material-icons tiny">public</i> : <i className="material-icons tiny">lock</i>}</span></Link></td>
//   {/*<td>{doc.singleDocIsPublic === true ? "public" : "private"}</td>*/}
//   <td>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</td>
//   <td>{doc.updated}</td>
//   <td>{tags === "" ? tags : tags.join(', ')}</td>
//   <td><Link to={'/documents/doc/delete/'+ doc.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
// </tr>

// <div className="row container">
//   <div className="col s12 m6">
//     <h5>Documents ({currentDocs.length}) <a onClick={this.props.handleaddItem} className="btn-floating btn black">
//       <i className="small material-icons">add</i>
//     </a>
//       {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
//       {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={this.props.clearFilter}>Clear</a></span> : <div />}
//     </h5>
//     {/* Filter Dropdown */}
//     <ul id="slide-out" className="comments-side-nav side-nav">
//       <h5 className="center-align">Filter</h5>
//       <li><a className="dropdown-trigger" data-activates='collabDrop'>Collaborators</a></li>
//         {/* Collaborator list */}
//           <ul id='collabDrop' className="dropdown-content">
//           {
//             uniqueCollabs.map(collab => {
//               return (
//                 <li className="filter-li" key={Math.random()}><a onClick={() => this.props.collabFilter(collab)}>{collab}</a></li>
//               )
//             })
//           }
//           </ul>
//         {/* End Collaborator list */}
//       <li><a className="dropdown-trigger" data-activates='tagDrop'>Tags</a></li>
//       {/* Tags list */}
//         <ul id='tagDrop' className="dropdown-content">
//         {
//           uniqueTags.map(tag => {
//             return (
//               <li className="filter-li" key={Math.random()}><a onClick={() => this.props.tagFilter(tag)}>{tag}</a></li>
//             )
//           })
//         }
//         </ul>
//       {/* End Tag list */}
//       <li><a className="dropdown-trigger" data-activates='dateDrop'>Updated</a></li>
//       {/* Date list */}
//         <ul id="dateDrop" className="dropdown-content">
//         {
//           uniqueDate.map(date => {
//             return (
//               <li className="filter-li" key={Math.random()}><a onClick={() => this.props.dateFilter(date)}>{date}</a></li>
//             )
//           })
//         }
//         </ul>
//       {/* End Date list */}
//     </ul>
//     {/* End Filter Dropdown */}
//   </div>
//   <div className="col right s12 m6">
//   <form className="searchform">
//   <fieldset className=" form-group searchfield">
//   <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Documents" onChange={this.props.filterList}/>
//   </fieldset>
//   </form>
//   </div>
// </div>
//   <div className="container">
//     <div className={loading}>
//       <div className="progress center-align">
//         <p>Loading...</p>
//         <div className="indeterminate"></div>
//       </div>
//     </div>
//   </div>
// {/* Add button */}
// <div className="container">
//   {/*<div className="fixed-action-btn">
//     <a onClick={this.props.handleaddItem} className="btn-floating btn-large black">
//       <i className="large material-icons">add</i>
//     </a>
//     </div>*/}
// {/* End Add Button */}
//   {
//     this.props.activeIndicator === true ?
//       <ul className="pagination action-items">
//         <li><a className="modal-trigger" href="#shareModal">Share</a></li>
//         <li><a className="modal-trigger" onClick={this.props.loadSingleTags}>Tag</a></li>
//         {graphitePro && docs ? <li className="right"><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Toggle Graphite Pro team documents" onClick={() => this.setState({ teamView: !this.state.teamView})}><i className="material-icons teamDocs">people</i></a></li> : <li className="hide"></li>}
//       </ul>
//    :
//       <ul className="pagination inactive action-items">
//         <li><a>Share</a></li>
//         <li><a>Tag</a></li>
//         {graphitePro && docs ? <li className="right"><a onClick={() => this.setState({ teamView: !this.state.teamView})}><i className="material-icons teamDocs">people</i></a></li> : <li className="hide"></li>}
//       </ul>
//
//   }
//
//   <table className="bordered">
//     <thead>
//       <tr>
//         <th></th>
//         <th>Title</th>
//         {/*<th>Access</th>*/}
//         <th>Collaborators</th>
//         <th>Updated</th>
//         <th>Tags</th>
//         <th></th>
//       </tr>
//     </thead>
//     <tbody>
//   {
//     currentDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
//       var tags;
//       var collabs;
//       let uniqueCollaborators;
//       if(doc.tags) {
//         tags = Array.prototype.slice.call(doc.tags);
//       } else {
//         tags = "";
//       }
//       if(doc.sharedWith) {
//         collabs = Array.prototype.slice.call(doc.sharedWith);
//         uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index)
//       } else {
//         collabs = "";
//         uniqueCollaborators = "";
//       }
//     return(
//       <tr key={doc.id}>
//         <td><input type="checkbox" checked={this.props.checked} value={doc.id} id={doc.id} onChange={this.props.handleCheckbox} /><label htmlFor={doc.id}></label></td>
//         <td><Link to={'/documents/doc/' + doc.id}>{doc.title ? doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <i className="material-icons tiny">public</i> : <i className="material-icons tiny">lock</i>}</span></Link></td>
//         {/*<td>{doc.singleDocIsPublic === true ? "public" : "private"}</td>*/}
//         <td>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</td>
//         <td>{doc.updated}</td>
//         <td>{tags === "" ? tags : tags.join(', ')}</td>
//         <td><Link to={'/documents/doc/delete/'+ doc.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
//       </tr>
//     );
//     })
//   }
//   </tbody>
// </table>
//
// <div>
//   <ul className="center-align pagination">
//   {renderPageNumbers}
//   </ul>
//   <div className="docs-per-page right-align">
//     <label>Docs per page</label>
//     <select value={this.props.docsPerPage} onChange={this.props.setDocsPerPage}>
//       <option value={10}>
//       10
//       </option>
//       <option value={20}>
//       20
//       </option>
//       <option value={50}>
//       50
//       </option>
//     </select>
//   </div>
// </div>
// {/* Share Modal */}
//   <div id="shareModal" className="project-page-modal modal">
//     <div className="modal-content">
//       <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
//       <div>
//         <h4>Select Contact</h4>
//         <ul className="collection">
//         {
//         contacts && contacts.length < 1 ?
//
//               <p className="center-align no-contacts">You do not have any contacts. Add some <a href="/contacts">here</a> before you share.</p>
//              : <p className="hide"></p>
//         }
//         {contacts.slice(0).reverse().map(contact => {
//             return (
//               <li key={contact.contact}className="collection-item">
//                 {/*<a onClick={() => this.props.sharedInfo(contact.contact)}>
//                 <p>{contact.contact}</p>
//                 </a>*/}
//                 <a onClick={() => this.setState({ contactToShareWith: contact.contact})} className='modal-trigger' href='#encryptedModal'>{contact.contact}</a>
//               </li>
//             )
//           })
//         }
//         </ul>
//       </div>
//       {/*loading */}
//       <div className={loadingTwo}>
//         <div className="center">
//           <div className="preloader-wrapper small active">
//             <div className="spinner-layer spinner-green-only">
//               <div className="circle-clipper left">
//                 <div className="circle"></div>
//               </div><div className="gap-patch">
//                 <div className="circle"></div>
//               </div><div className="circle-clipper right">
//                 <div className="circle"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//
//     </div>
//   </div>
// {/* End Share Modal */}
//
// {/* Encrypted Collab Modal */}
// <div id="encryptedModal" className="modal">
//   <div className="modal-content">
//     <h4>Choose How to Share</h4>
//     <p>All data is encrypted, but if you choose to enable real-time collaboration, a websockets server will be utilized. If you do not wish to utlize any server, choose "Static Sharing."</p>
//     <button onClick={() => this.props.sharedInfo(this.state.contactToShareWith)} className='btn green'>Enable Real-Time Collaboration</button>
//     <button onClick={() => this.props.sharedInfoStatic(this.state.contactToShareWith)} className='btn blue'>Share Static Copy</button>
//     <div>
//     {rtc === true ?
//       <p>Share this link with your collaborator(s) or they can access all shared files next time they log into Graphite. <br/><a href={window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + docsSelected[0]}>{window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + docsSelected[0]}</a></p> :
//       null
//     }
//     </div>
//   </div>
//   <div className="modal-footer">
//     <a className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
//     </div>
//   </div>
// {/* End Encrypted Collab Modal */}
//
// {/* Tag Modal */}
//     <div id="tagModal" className="project-page-modal modal">
//       <div className="modal-content">
//         <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
//           <h4>Tags</h4>
//           <p>Add a new tag or remove an existing tag.</p>
//           <div className="row">
//             <div className="col s9 input-field">
//               <input type="text" className="tag-input" placeholder="Add a tag" value={this.props.tag} onChange={this.props.setTags} onKeyPress={this.props.handleKeyPress} />
//             </div>
//             <div className="col s3">
//               <a onClick={this.props.addTagManual}><i className="material-icons">check</i></a>
//             </div>
//           </div>
//           <div>
//           {singleDocTags.slice(0).reverse().map(tag => {
//               return (
//                 <div key={tag} className="chip">
//                   {tag}<a onClick={() => this.props.deleteTag(tag)}><i className="close material-icons">close</i></a>
//                 </div>
//               )
//             })
//           }
//           </div>
//           <div>
//             <button onClick={this.props.saveNewTags} className="btn">Save</button>
//           </div>
//       </div>
//       {/*loading */}
//       <div className={loadingTwo}>
//         <div className="center">
//           <div className="preloader-wrapper small active">
//             <div className="spinner-layer spinner-green-only">
//               <div className="circle-clipper left">
//                 <div className="circle"></div>
//               </div><div className="gap-patch">
//                 <div className="circle"></div>
//               </div><div className="circle-clipper right">
//                 <div className="circle"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/*end loading */}
//   </div>
// {/* End tag Modal */}
//
// {/* Tap Target */}
// <div className="tap-target" data-activates="menu">
//   <div className="tap-target-content">
//     <h5>Add a Document</h5>
//     <p>It looks like you don'{/*'*/}t have any documents yet. Add one here.</p>
//   </div>
// </div>
// {/* End Tap Target */}
//
// </div>
