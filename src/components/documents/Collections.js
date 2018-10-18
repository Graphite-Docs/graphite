import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  handlePendingSignIn,
  loadUserData
} from 'blockstack';
import Header from '../Header';

export default class Collections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      teamView: false
    }
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    window.$('.dropdown-trigger').dropdown();
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    });
    window.$('.modal').modal();
    window.$('.tooltipped').tooltip({delay: 50});
  }

  render() {

    const { docs, docsSelected, rtc, graphitePro, filteredValue, appliedFilter, singleDocTags, loadingTwo, contacts, currentPage, docsPerPage, loading } = this.props;
    const teamView = this.state.teamView;
    const link = '/documents/doc/' + this.props.tempDocId;
    if (this.props.redirect) {
      return <Redirect push to={link} />;
    }
    let teamDocs = docs.filter(doc => doc.teamDoc === true);

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    // const currentDocs = filteredValue.slice(0).reverse();
    const currentDocs = filteredValue.sort(function(a,b){return new Date(parseInt(b.id,10)) - new Date(parseInt(a.id,10))});
    let shared = currentDocs.map(a => a.sharedWith);
    let newShared = shared.filter(function(n){ return n !== undefined });
    let mergedShared = [].concat.apply([], newShared);
    let uniqueCollabs = [];
    window.$.each(mergedShared, function(i, el){
      if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let tags = currentDocs.map(a => a.tags);
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
            <li
              key={number}
              id={number}
              className={number === this.props.currentPage ? "active" : ""}
            >
              <a id={number} onClick={this.props.handlePageChange}>{number}</a>
            </li>
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

    if(teamView) {
      return (
        <div>
          <Header
            graphitePro={graphitePro}
          />
          <div className="docs">
          <div className="row container">
            <div className="col s12 m6">
              <h5>Team Documents ({teamDocs.length})</h5>
            </div>
            <div className="col right s12 m6">
            <form className="searchform">
            <fieldset className=" form-group searchfield">
            <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Documents" onChange={this.props.filterList}/>
            </fieldset>
            </form>
            </div>
          </div>

          <div className="container">
            <ul className="pagination action-items">
              {graphitePro && docs ? <li className="right"><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Toggle Graphite Pro team documents" onClick={() => this.setState({ teamView: !this.state.teamView})}><i className="material-icons teamDocs">people</i></a></li> : <li className="hide"></li>}
            </ul>

            <table className="bordered">
              <thead>
                <tr>
                <th>Title</th>
                <th>Shared By</th>
                <th>Static File</th>
                <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
            {
              teamDocs.slice(indexOfFirstDoc, indexOfLastDoc).reverse().map(doc => {
              return(
                <tr key={doc.id}>
                  <td><Link to={'/documents/single/shared/'+ doc.user + '/' + doc.id}>{doc.title ? doc.title : "Untitled"}</Link></td>
                  <td>{this.state.user}</td>
                  <td>{doc.rtc === true ? "False" : "True"}</td>
                  <td>{doc.shared}</td>
                </tr>
              );
              })
            }
            </tbody>
          </table>

          <div>
            <ul className="center-align pagination">
            {renderTeamPageNumbers}
            </ul>
            <div className="docs-per-page right-align">
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
          </div>
        </div>
        </div>
      );
    } else {
      return (
        <div>
          <Header
            graphitePro={graphitePro}
          />
          <div className="docs">
          <div className="row container">
            <div className="col s12 m6">
              <h5>Documents ({currentDocs.length}) <a onClick={this.props.handleaddItem} className="btn-floating btn black">
                <i className="small material-icons">add</i>
              </a>
                {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
                {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={this.props.clearFilter}>Clear</a></span> : <div />}
              </h5>
              {/* Filter Dropdown */}
              <ul id="slide-out" className="comments-side-nav side-nav">
                <h5 className="center-align">Filter</h5>
                <li><a className="dropdown-trigger" data-activates='collabDrop'>Collaborators</a></li>
                  {/* Collaborator list */}
                    <ul id='collabDrop' className="dropdown-content">
                    {
                      uniqueCollabs.map(collab => {
                        return (
                          <li className="filter-li" key={Math.random()}><a onClick={() => this.props.collabFilter(collab)}>{collab}</a></li>
                        )
                      })
                    }
                    </ul>
                  {/* End Collaborator list */}
                <li><a className="dropdown-trigger" data-activates='tagDrop'>Tags</a></li>
                {/* Tags list */}
                  <ul id='tagDrop' className="dropdown-content">
                  {
                    uniqueTags.map(tag => {
                      return (
                        <li className="filter-li" key={Math.random()}><a onClick={() => this.props.tagFilter(tag)}>{tag}</a></li>
                      )
                    })
                  }
                  </ul>
                {/* End Tag list */}
                <li><a className="dropdown-trigger" data-activates='dateDrop'>Updated</a></li>
                {/* Date list */}
                  <ul id="dateDrop" className="dropdown-content">
                  {
                    uniqueDate.map(date => {
                      return (
                        <li className="filter-li" key={Math.random()}><a onClick={() => this.props.dateFilter(date)}>{date}</a></li>
                      )
                    })
                  }
                  </ul>
                {/* End Date list */}
              </ul>
              {/* End Filter Dropdown */}
            </div>
            <div className="col right s12 m6">
            <form className="searchform">
            <fieldset className=" form-group searchfield">
            <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Documents" onChange={this.props.filterList}/>
            </fieldset>
            </form>
            </div>
          </div>
            <div className="container">
              <div className={loading}>
                <div className="progress center-align">
                  <p>Loading...</p>
                  <div className="indeterminate"></div>
                </div>
              </div>
            </div>
          {/* Add button */}
          <div className="container">
            {/*<div className="fixed-action-btn">
              <a onClick={this.props.handleaddItem} className="btn-floating btn-large black">
                <i className="large material-icons">add</i>
              </a>
              </div>*/}
          {/* End Add Button */}
            {
              this.props.activeIndicator === true ?
                <ul className="pagination action-items">
                  <li><a className="modal-trigger" href="#shareModal">Share</a></li>
                  <li><a className="modal-trigger" href="#tagModal" onClick={this.props.loadSingleTags}>Tag</a></li>
                  {graphitePro && docs ? <li className="right"><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Toggle Graphite Pro team documents" onClick={() => this.setState({ teamView: !this.state.teamView})}><i className="material-icons teamDocs">people</i></a></li> : <li className="hide"></li>}
                </ul>
             :
                <ul className="pagination inactive action-items">
                  <li><a>Share</a></li>
                  <li><a>Tag</a></li>
                  {graphitePro && docs ? <li className="right"><a onClick={() => this.setState({ teamView: !this.state.teamView})}><i className="material-icons teamDocs">people</i></a></li> : <li className="hide"></li>}
                </ul>

            }

            <table className="bordered">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  {/*<th>Access</th>*/}
                  <th>Collaborators</th>
                  <th>Updated</th>
                  <th>Tags</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
            {
              currentDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
                var tags;
                var collabs;
                let uniqueCollaborators;
                if(doc.tags) {
                  tags = Array.prototype.slice.call(doc.tags);
                } else {
                  tags = "";
                }
                if(doc.sharedWith) {
                  collabs = Array.prototype.slice.call(doc.sharedWith);
                  uniqueCollaborators = collabs.filter((thing, index, self) => self.findIndex(t => t === thing) === index)
                } else {
                  collabs = "";
                  uniqueCollaborators = "";
                }
              return(
                <tr key={doc.id}>
                  <td><input type="checkbox" checked={this.props.checked} value={doc.id} id={doc.id} onChange={this.props.handleCheckbox} /><label htmlFor={doc.id}></label></td>
                  <td><Link to={'/documents/doc/' + doc.id}>{doc.title ? doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <i className="material-icons tiny">public</i> : <i className="material-icons tiny">lock</i>}</span></Link></td>
                  {/*<td>{doc.singleDocIsPublic === true ? "public" : "private"}</td>*/}
                  <td>{uniqueCollaborators === "" ? uniqueCollaborators : uniqueCollaborators.join(', ')}</td>
                  <td>{doc.updated}</td>
                  <td>{tags === "" ? tags : tags.join(', ')}</td>
                  <td><Link to={'/documents/doc/delete/'+ doc.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
                </tr>
              );
              })
            }
            </tbody>
          </table>

          <div>
            <ul className="center-align pagination">
            {renderPageNumbers}
            </ul>
            <div className="docs-per-page right-align">
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
          {/* Share Modal */}
            <div id="shareModal" className="project-page-modal modal">
              <div className="modal-content">
                <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
                <div>
                  <h4>Select Contact</h4>
                  <ul className="collection">
                  {
                  contacts && contacts.length < 1 ?

                        <p className="center-align no-contacts">You do not have any contacts. Add some <a href="/contacts">here</a> before you share.</p>
                       : <p className="hide"></p>
                  }
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item">
                          {/*<a onClick={() => this.props.sharedInfo(contact.contact)}>
                          <p>{contact.contact}</p>
                          </a>*/}
                          <a onClick={() => this.setState({ contactToShareWith: contact.contact})} className='modal-trigger' href='#encryptedModal'>{contact.contact}</a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
                {/*loading */}
                <div className={loadingTwo}>
                  <div className="center">
                    <div className="preloader-wrapper small active">
                      <div className="spinner-layer spinner-green-only">
                        <div className="circle-clipper left">
                          <div className="circle"></div>
                        </div><div className="gap-patch">
                          <div className="circle"></div>
                        </div><div className="circle-clipper right">
                          <div className="circle"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          {/* End Share Modal */}

          {/* Encrypted Collab Modal */}
          <div id="encryptedModal" className="modal">
            <div className="modal-content">
              <h4>Choose How to Share</h4>
              <p>All data is encrypted, but if you choose to enable real-time collaboration, a websockets server will be utilized. If you do not wish to utlize any server, choose "Static Sharing."</p>
              <button onClick={() => this.props.sharedInfo(this.state.contactToShareWith)} className='btn green'>Enable Real-Time Collaboration</button>
              <button onClick={() => this.props.sharedInfoStatic(this.state.contactToShareWith)} className='btn blue'>Share Static Copy</button>
              <div>
              {rtc === true ?
                <p>Share this link with your collaborator(s) or they can access all shared files next time they log into Graphite. <br/><a href={window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + docsSelected[0]}>{window.location.origin + '/documents/single/shared/' + loadUserData().username + '/' + docsSelected[0]}</a></p> :
                null
              }
              </div>
            </div>
            <div className="modal-footer">
              <a className="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
              </div>
            </div>
          {/* End Encrypted Collab Modal */}

          {/* Tag Modal */}
              <div id="tagModal" className="project-page-modal modal">
                <div className="modal-content">
                  <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
                    <h4>Tags</h4>
                    <p>Add a new tag or remove an existing tag.</p>
                    <div className="row">
                      <div className="col s9">
                        <input type="text" value={this.props.tag} onChange={this.props.setTags} onKeyPress={this.props.handleKeyPress} />
                      </div>
                      <div className="col s3">
                        <a onClick={this.props.addTagManual}><i className="material-icons">check</i></a>
                      </div>
                    </div>
                    <div>
                    {singleDocTags.slice(0).reverse().map(tag => {
                        return (
                          <div key={tag} className="chip">
                            {tag}<a onClick={() => this.props.deleteTag(tag)}><i className="close material-icons">close</i></a>
                          </div>
                        )
                      })
                    }
                    </div>
                    <div>
                      <button onClick={this.props.saveNewTags} className="btn">Save</button>
                    </div>
                </div>
                {/*loading */}
                <div className={loadingTwo}>
                  <div className="center">
                    <div className="preloader-wrapper small active">
                      <div className="spinner-layer spinner-green-only">
                        <div className="circle-clipper left">
                          <div className="circle"></div>
                        </div><div className="gap-patch">
                          <div className="circle"></div>
                        </div><div className="circle-clipper right">
                          <div className="circle"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/*end loading */}
            </div>
          {/* End tag Modal */}

          {/* Tap Target */}
          <div className="tap-target" data-activates="menu">
            <div className="tap-target-content">
              <h5>Add a Document</h5>
              <p>It looks like you don'{/*'*/}t have any documents yet. Add one here.</p>
            </div>
          </div>
          {/* End Tap Target */}

          </div>
        </div>
        </div>
      );
    }


  }
}
