import React, { Component } from 'react';
import {
  isSignInPending
} from 'blockstack';
import Header from '../Header';
import { Link } from 'react-router-dom';

export default class VaultCollection extends Component {

  componentDidMount() {
    window.$('.modal').modal();
    window.$('.dropdown-trigger').dropdown();
    window.$('.button-collapse').sideNav({
        menuWidth: 400, // Default is 300
        edge: 'left', // Choose the horizontal origin
        closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true, // Choose whether you can drag to open on touch screens
      }
    );
  }

  render() {
    const { graphitePro, activeIndicator, checked, tag, singleFileTags, loadingTwo, contacts, contactDisplay, appliedFilter, currentPage, filesPerPage, filteredVault } = this.props;
    let files;
    if (filteredVault !== null) {
      files = filteredVault;
    } else {
      files = [];
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
            <li
              key={number}
              id={number}
              className={number === currentPage ? "active" : ""}
            >
              <a id={number} onClick={this.handlePageChange}>{number}</a>
            </li>
          );
        });

    return (
      !isSignInPending() ?
      <div>
      <Header
        graphitePro={graphitePro}
      />
      <div className="docs">
      <div className="row container">
        <div className="col s12 m6">
          <h5>Files ({currentFiles.length})  <a href='/vault/new/file' className="btn-floating btn black">
            <i className="large material-icons">add</i>
          </a>

            {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
            {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={this.props.clearVaultFilter}>Clear</a></span> : <div />}
          </h5>
          {/* Filter Dropdown */}
          <ul id="slide-out" className="comments-side-nav side-nav">
            <h5 className="center-align">Filter</h5>
            <li><a className="dropdown-trigger" data-activates='collabDrop'>Collaborators</a></li>
              {/* Collaborator list */}
                <ul id='collabDrop' className='dropdown-content'>
                {
                  uniqueCollabs.map(collab => {
                    return (
                      <li className="filter-li" key={Math.random()}><a onClick={() => this.props.collabVaultFilter(collab)}>{collab}</a></li>
                    )
                  })
                }
                </ul>
              {/* End Collaborator list */}
            <li><a className="dropdown-trigger" data-activates='tagDrop'>Tags</a></li>
            {/* Tags list */}
              <ul id='tagDrop' className='dropdown-content'>
              {
                uniqueTags.map(tag => {
                  return (
                    <li className="filter-li" key={Math.random()}><a onClick={() => this.props.tagVaultFilter(tag)}>{tag}</a></li>
                  )
                })
              }
              </ul>
            {/* End Tag list */}
            <li><a className="dropdown-trigger" data-activates='dateDrop'>Updated</a></li>
            {/* Date list */}
              <ul id='dateDrop' className='dropdown-content'>
              {
                uniqueDate.map(date => {
                  return (
                    <li className="filter-li" key={Math.random()}><a onClick={() => this.props.dateVaultFilter(date)}>{date}</a></li>
                  )
                })
              }
              </ul>
            {/* End Date list */}
            <li><a className="dropdown-trigger" data-activates='typeDrop'>Type</a></li>
            {/* Type list */}
              <ul id='typeDrop' className='dropdown-content'>
              {
                uniqueType.map(type => {
                  return (
                    <li className="filter-li" key={Math.random()}><a onClick={() => this.props.typeVaultFilter(type)}>{type.split('/')[1].toUpperCase()}</a></li>
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
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Files" onChange={this.filterList}/>
          </fieldset>
          </form>
        </div>
      </div>

        <div className="">
        <div className="container">
          {/*<div className="fixed-action-btn">
            <a href='/vault/new/file' className="btn-floating btn-large black">
              <i className="large material-icons">add</i>
            </a>
        </div>*/}

        {
          activeIndicator === true ?
            <ul className="pagination action-items">
              <li><a className="modal-trigger" href="#shareModal">Share</a></li>
              <li><a className="modal-trigger" href="#tagModal" onClick={this.props.loadSingleVaultTags}>Tag</a></li>

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
                <th>Shared With</th>
                <th>Uploaded</th>
                <th>Tags</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
          {
            currentFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
              var tags;
              var collabs;
              if(file.tags) {
                tags = Array.prototype.slice.call(file.tags);
              } else {
                tags = "";
              }
              if(file.sharedWith) {
                collabs = Array.prototype.slice.call(file.sharedWith);
              } else {
                collabs = "";
              }
            return(
              <tr key={file.id}>
                <td><input type="checkbox" checked={checked} value={file.id} id={file.id} onChange={this.props.handleVaultCheckbox} /><label htmlFor={file.id}></label></td>
                <td><Link to={'/vault/' + file.id}>{file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name}</Link></td>
                <td>{collabs === "" ? collabs : collabs.join(', ')}</td>
                <td>{file.uploaded}</td>
                <td>{tags === "" ? tags : tags.join(', ')}</td>
                <td>{file.type.split('/')[1]}</td>
                <td><Link to={'/vault/delete/'+ file.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
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
        </div>

        {/* Share Modal */}

            <div id="shareModal" className="project-page-modal modal">
              <div className="modal-content">
                <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>
                <div className={contactDisplay}>
                  <h4>Select Contact</h4>
                  <ul className="collection">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item">
                          <a onClick={() => this.props.sharedVaultInfo(contact.contact)}>
                          <p>{contact.contact}</p>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
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

        {/* End Share Modal */}

        {/* Tag Modal */}

            <div id="tagModal" className="project-page-modal modal">
              <div className="modal-content">
                <a className="btn-floating modal-action modal-close right grey"><i className="material-icons">close</i></a>

                  <h4>Tags</h4>
                  <p>Add a new tag or remove an existing tag.</p>
                  <div className="row">
                    <div className="col s9">
                      <input type="text" value={tag} onChange={this.props.setVaultTags} onKeyPress={this.props.handleVaultKeyPress} />
                    </div>
                    <div className="col s3">
                      <a onClick={this.props.addVaultTagManual}><i className="material-icons">check</i></a>
                    </div>
                  </div>
                  <div>
                  {singleFileTags.slice(0).reverse().map(tag => {
                      return (
                        <div key={tag} className="chip">
                          {tag}<a onClick={() => this.props.deleteVaultTag(tag)}><i className="close material-icons">close</i></a>
                        </div>
                      )
                    })
                  }
                  </div>
                  <div>
                    <button onClick={this.props.saveNewVaultTags} className="btn">Save</button>
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

        </div>
          {/*files.slice(0).reverse().map(file => {
              return(

                <div key={file.id} className="col s12 m6 l3">

                  <div className="card collections-card hoverable horizontal">
                  <Link to={'/vault/' + file.id} className="side-card black-text file-side">
                    <div className="card-image card-image-side file-side">
                    {
                      file.type.includes("image") ? <img src="https://i.imgur.com/jLnXZXM.png" alt="icon" /> :
                      file.type.includes("pdf") ? <img src="https://i.imgur.com/urkNBL9.png" alt="icon" /> :
                      file.type.includes("word") ? <img className="icon-image" src="https://i.imgur.com/6ibKpk4.png" alt="word document" /> :
                      file.type.includes("rtf") || file.type.includes("text/plain") || file.type.includes("opendocument") ? <img className="icon-image" src="https://i.imgur.com/xADzUSW.png" alt="document" /> :
                      file.type.includes("video") ? <img className="icon-image" src="https://i.imgur.com/Hhj5KAl.png" alt="video icon" /> :
                      file.type.includes("spreadsheet") ? <img className="icon-image" src="https://i.imgur.com/1mOhZ4u.png" alt="excel file" /> :
                      file.type.includes("csv") ? <img className="icon-image" src="https://i.imgur.com/BxA1Cgv.png" alt="csv file" /> :
                      <div />
                    }
                    </div>
                    </Link>
                    <div className="card-stacked">
                    <Link to={'/vault/' + file.id} className="black-text">
                      <div className="card-content">
                        <p className="title">{file.name.length > 14 ? file.name.substring(0,17)+"..." :  file.name}</p>
                      </div>
                    </Link>
                      <div className="edit-card-action card-action">
                        <p><span className="muted muted-card">Uploaded: {file.uploaded}</span><Link to={'/vault/delete/' + file.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></p>
                      </div>
                    </div>

                  </div>
                </div>

              )
              })
            */}
        </div>
      </div>
      </div> : null
    );
  }
}
