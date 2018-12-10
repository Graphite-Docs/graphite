import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Header from '../Header';
export default class Forms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {}
    }
  }

  componentDidMount() {
    this.props.loadForms();
    window.$('.modal').modal();
  }


  render() {
    const { forms, appliedFilter, loading, currentPage, docsPerPage } = this.props;
    let formList;
    forms === undefined || forms === null ? formList = [] : formList = forms;
    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    let tags = formList.map(a => a.tags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })
    let date = formList.map(a => a.updated);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(forms.length / docsPerPage); i++) {
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


    return(
      <div>
        <Header />
        <div className="docs">
        <div className="row container">
          <div className="col s12 m6">
            <h5>Forms ({forms.length}) <a onClick={this.props.handleAddForm} className="btn-floating btn black">
              <i className="small material-icons">add</i>
            </a>
              {appliedFilter === false ? <span className="filter"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
              {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={this.props.clearFilter}>Clear</a></span> : <div />}
            </h5>
            {/* Filter Dropdown */}
            <ul id="slide-out" className="comments-side-nav side-nav">
              <h5 className="center-align">Filter</h5>
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
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Forms" onChange={this.props.filterList}/>
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
        <div className="container">
          {
            this.props.activeIndicator === true ?
              <ul className="pagination action-items">
                <li><a className="modal-trigger" href="#shareModal">Embed</a></li>
                <li><a className="modal-trigger" href="#tagModal" onClick={this.props.loadSingleFormTags}>Tag</a></li>
              </ul>
           :
              <ul className="pagination inactive action-items">
                <li><a>Embed</a></li>
                <li><a>Tag</a></li>
              </ul>

          }

          <table className="bordered">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Updated</th>
                <th>Tags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
          {
            formList.slice(indexOfFirstDoc, indexOfLastDoc).map(form => {
              var tags;
              if(form.tags) {
                tags = Array.prototype.slice.call(form.tags);
              } else {
                tags = "";
              }
            return(
              <tr key={form.id}>
                <td><input type="checkbox" checked={this.props.checked} value={form.id} id={form.id} onChange={this.props.handleFormCheckbox} /><label htmlFor={form.id}></label></td>
                <td><Link to={'/forms/form/' + form.id}>{form.title.length > 20 ? form.title.substring(0,20)+"..." :  form.title}</Link></td>
                {/*<td>{doc.singleDocIsPublic === true ? "public" : "private"}</td>*/}
                <td>{form.date}</td>
                <td>{tags === "" ? tags : tags.join(', ')}</td>
                <td><a href='#deleteModal' onClick={() => this.setState({ form: form })} className="modal-trigger"><i className="material-icons red-text delete-button">delete</i></a></td>
              </tr>
            );
            })
          }
          </tbody>
        </table>

        <div id="deleteModal" className="modal">
          <div className="modal-content">
            <h4>Delete Form</h4>
            <p>Are you sure you want to delete <strong>{this.state.form.title}</strong>?</p>
          </div>
          <div className="modal-footer">
            <a onClick={() => this.props.deleteForm(this.state.form)} className="modal-action modal-close waves-red red-text btn-flat">Delete</a>
            <a className="modal-action modal-close btn-flat">Cancel</a>
          </div>
        </div>

        <div>
          <ul className="center-align pagination">
          {renderPageNumbers}
          </ul>
          <div className="docs-per-page right-align">
            <label>Docs per page</label>
            <select defaultValue={docsPerPage} onChange={this.props.setDocsPerPage}>
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
    )
  }
}
