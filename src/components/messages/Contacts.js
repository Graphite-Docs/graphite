import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  loadUserData
} from 'blockstack';
import Header from '../Header';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Contacts extends Component {

  componentDidMount() {
    this.props.loadContactsCollection();
    window.$('.dropdown-trigger').dropdown();
    window.$('.modal').modal();
    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
  );
  }

  componentDidUpdate() {
    if(this.props.confirmAdd === true) {
      this.props.handleAddContact();
    }
    if(this.props.confirmManualAdd === true) {
      this.props.handleManualAdd();
    }
  }


  renderView() {
    this.props.applyFilter === true ? this.props.applyContactsFilter() : loadUserData();
    const {show, newContact, loading, filteredContacts, manualResults, appliedFilter, deleteState, loadingTwo, typeModal, currentPage, contactsPerPage, add} = this.props;
    let contacts = filteredContacts;
    let showFirstLink;
    let showResults = "";
    let results;
    if(this.props.results !=null) {
      results = this.props.results;
    } else {
      results = [];
    }
    if(newContact.length < 1) {
      showResults = "hide";
    } else {
      showResults = "";
    }
    let types;
    if(this.props.types !== null) {
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
            <li
              key={number}
              id={number}
              className={number === this.props.currentPage ? "active" : ""}
            >
              <a id={number} onClick={this.props.handleContactsPageChange}>{number}</a>
            </li>
          );
        });

    deleteState === true ? this.props.deleteType() : loadUserData();
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = contacts.slice(0).reverse();
    let searchImg;
    if(manualResults.image) {
      searchImg = manualResults.image[0].contentUrl;
    } else {
      searchImg = avatarFallbackImage;
    }

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

    if(add === true){
    return (
      <div className="add-contact row">
        <h3 className="center-align">Add a new contact</h3>


        <div className="card-add col s12">
          <div className="add-new">
            <div>
              <p>Search for a contact</p>
              <label>Search</label>
              <input type="text" placeholder="Ex: Johnny Cash" onChange={this.props.handleNewContact} />
            </div>
            <div className={showResults}>

            <ul className="collection">
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
                  <div key={result.username} className={showFirstLink}>
                  <a className="contact-add" onClick={() => this.props.handleAddContact(result.fullyQualifiedName)}>
                    <li className="collection-item avatar">
                      <img src={imageLink} alt="avatar" className="circle" />
                      <span className="title">{result.profile.name}</span>
                      <p>{result.username}</p>
                    </li>
                  </a>
                  </div>
                )
              })
            }
            {
              manualResults !== {} ?
              <div key={this.props.newContact} className={showFirstLink}>
              <a className="contact-add" onClick={() => this.props.handleAddContact(newContact)}>
                <li className="collection-item avatar">
                  <img src={searchImg} alt="avatar" className="circle" />
                  <span className="title">{manualResults.name}</span>
                  <p>{this.props.newContact}</p>
                </li>
              </a>
              </div>:
              <div />

            }
            </ul>

            </div>
            <div className={show}>
            </div>
            <div className={loading}>
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
    );
  } else {
    return (
      <div>
        <div className="docs">

        {/* Add button */}
        <div className="container">
          {/*<div className="fixed-action-btn">
            <a onClick={this.props.addNewContact} className="btn-floating btn-large black">
              <i className="large material-icons">add</i>
            </a>
        </div> */}
        {/* End Add Button */}

        <div className="row">
          <div className="col s12 m6">
            <h5>Contacts ({currentContacts.length}) <a onClick={this.props.addNewContact} className="btn-floating btn black">
              <i className="material-icons">add</i>
            </a>

              {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
              {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={this.props.clearContactsFilter}>Clear</a></span> : <div />}
            </h5>
            {/* Filter Dropdown */}
            <ul id="slide-out" className="comments-side-nav side-nav">
              <h5 className="center-align">Filter</h5>
              <li><a className="dropdown-trigger" data-activates='typeDrop'>Contact Types</a></li>
              {/* Types list */}
                <ul id='typeDrop' className="dropdown-content">
                {
                  uniqueTypes.map(type => {
                    return (
                      <li className="filter-li" key={Math.random()}><a onClick={() => this.props.typeFilter(type)}>{type}</a></li>
                    )
                  })
                }
                </ul>
              {/* End Tag list */}
              <li><a className="dropdown-trigger" data-activates='dateDrop'>Date Added</a></li>
              {/* Date list */}
                <ul id='dateDrop' className="dropdown-content">
                {
                  uniqueDate.map(date => {
                    return (
                      <li className="filter-li" key={Math.random()}><a onClick={() => this.props.dateFilterContacts(date)}>{date}</a></li>
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
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Contacts" onChange={this.props.filterContactsList}/>
          </fieldset>
          </form>
          </div>
        </div>
        {
          this.props.activeIndicator === true ?
            <ul className="pagination action-items">
              <li><a onClick={() => this.props.loadSingleTypes()}>Contact Type</a></li>
            </ul>
         :
            <ul className="pagination inactive action-items">
              <li><a>Contact Type</a></li>
            </ul>

        }
          <div className="">
            <table className="bordered">
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date Added</th>
                  <th>Contact Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
            {
              currentContacts.slice(indexOfFirstContact, indexOfLastContact).map(contact => {
                var types;
                if(contact.types) {
                  types = Array.prototype.slice.call(contact.types);
                } else {
                  types = "";
                }

              return(
                <tr key={contact.contact}>
                  <td><input type="checkbox" checked={this.props.checked} value={contact.contact} id={contact.contact} onChange={this.props.handleContactsCheckbox} /><label htmlFor={contact.contact}></label></td>
                  <td><img src={contact.img || avatarFallbackImage} className="profile-grid-img circle" alt="img" />
                    <Link className="profile-name-link" to={'/contacts/profile/'+ contact.contact}>
                      {contact.contact.length > 30 ? contact.contact.substring(0,30)+"..." :  contact.contact}
                    </Link>
                  </td>
                  <td>{contact.name || ""}</td>
                  <td>{contact.dateAdded}</td>
                  <td>{types === "" ? types : types.join(', ')}</td>
                  <td><Link to={'/contacts/delete/'+ contact.contact}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
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
              <label>Contacts per page</label>
              <select value={this.props.contactsPerPage} onChange={(event) => this.setState({ contactsPerPage: event.target.value})}>
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
        {/* Type Modal */}
          <div className={typeModal}>
            <div id="typeModal" className="project-page-modal modal">
              <div className="modal-content">
                <a onClick={() => window.$('#typeModal').modal('close')} className="btn-floating modal-close modalClose grey"><i className="material-icons">close</i></a>

                  <h4>Contact Types</h4>
                  <p>Add a new contact type or remove an existing contact type.</p>
                  <div className="row">
                    <div className="col s9">
                      <input type="text" value={this.props.type} onChange={this.props.setTypes} onKeyPress={this.props.handleContactsKeyPress} />
                    </div>
                    <div className="col s3">
                      <a onClick={this.props.addTypeManual}><i className="material-icons">check</i></a>
                    </div>
                  </div>
                  <div>
                  {types.slice(0).reverse().map(type => {
                      return (
                        <div key={type} className="chip">
                          {type}<a onClick={() => this.props.deleteType(type)}><i className="close material-icons">close</i></a>
                        </div>
                      )
                    })
                  }
                  </div>
                  <div>
                    <button onClick={this.props.saveNewTypes} className="btn">Save</button>
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
          </div>
        {/* End type Modal */}
            </div>
          </div>

      </div>
    );
  }
  }

  render(){
    return(
      <div>
        <Header
          graphitePro={this.props.graphitePro}
        />
        {this.renderView()}
      </div>
    )
  }
}
