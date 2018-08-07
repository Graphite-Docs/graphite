import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  Person,
  handlePendingSignIn,
} from 'blockstack';
import Header from '../Header';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Collections extends Component {

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
  }

  render() {
    const { filteredValue, appliedFilter, singleDocTags, loadingTwo, contacts, currentPage, docsPerPage, loading, value } = this.props;
    const link = '/documents/doc/' + this.props.tempDocId;
    if (this.props.redirect) {
      return <Redirect push to={link} />;
    } else {
      console.log("No redirect");
    }
    const userData = loadUserData();
    const person = new Person(userData.profile);

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = filteredValue.slice(0).reverse();
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
   for (let i = 1; i <= Math.ceil(value.length / docsPerPage); i++) {
     pageNumbers.push(i);
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
    return (
      <div>
        <Header />
        <div className="docs">
        <div className="row container">
          <div className="col s12 m6">
            <h5>Documents ({currentDocs.length})
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
          <div className="fixed-action-btn">
            <a onClick={this.props.handleaddItem} className="btn-floating btn-large black">
              <i className="large material-icons">add</i>
            </a>
            </div>
        {/* End Add Button */}
          {
            this.props.activeIndicator === true ?
              <ul className="pagination action-items">
                <li><a className="modal-trigger" href="#shareModal">Share</a></li>
                <li><a className="modal-trigger" href="#tagModal" onClick={this.props.loadSingleTags}>Tag</a></li>

              </ul>
           :
              <ul className="pagination inactive action-items">
                <li><a>Share</a></li>
                <li><a>Tag</a></li>

              </ul>

          }

          <table className="bordered">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Access</th>
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
              if(doc.tags) {
                tags = Array.prototype.slice.call(doc.tags);
              } else {
                tags = "";
              }
              if(doc.sharedWith) {
                collabs = Array.prototype.slice.call(doc.sharedWith);
              } else {
                collabs = "";
              }
            return(
              <tr key={doc.id}>
                <td><input type="checkbox" checked={this.props.checked} value={doc.id} id={doc.id} onChange={this.props.handleCheckbox} /><label htmlFor={doc.id}></label></td>
                <td><Link to={'/documents/doc/' + doc.id}>{doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title}</Link></td>
                <td>{doc.singleDocIsPublic === true ? "public" : "private"}</td>
                <td>{collabs === "" ? collabs : collabs.join(', ')}</td>
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
                contacts.length < 1 ?

                      <p className="center-align no-contacts">You do not have any contacts. Add some <a href="/contacts">here</a> before you share.</p>
                     : <p className="hide"></p>
                }
                {contacts.slice(0).reverse().map(contact => {
                    return (
                      <li key={contact.contact}className="collection-item">
                        <a onClick={() => this.props.sharedInfo(contact.contact)}>
                        <p>{contact.contact}</p>
                        </a>
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
