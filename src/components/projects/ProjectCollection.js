import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
} from 'blockstack';
const { getPublicKeyFromPrivate } = require('blockstack');
import { getMonthDayYear } from '../helpers/getMonthDayYear';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class ProjectCollection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      filteredProjects: [],
      tempId: "",
      singleProject: {},
      title: "",
      topic: "",
      tag: "",
      showModal: "hide",
      menuBar: "hide",
      checked: false,
      filterModal: "hide",
      loading: "",
      inputValue: "",
      topicModal: "hide",
      tagModal: "hide",
      dateModal: "hide",
      collaboratorsModal: "hide",
      statusModal: "hide",
      singleTopic: "hide",
      singleTag: "hide",
      singleDate: "hide",
      singleCollaborator: "hide",
      singleStatus: "hide",
      topicSelect: "",
      tagSelect: "",
      dateSelect: "",
      collabSelect: "",
      statusSelect: ""
    }
    this.handleAdd = this.handleAdd.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.filterList = this.filterList.bind(this);
    this.saveProjectIndex = this.saveProjectIndex.bind(this);
    this.saveNewSingleProject = this.saveNewSingleProject.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.sidebarFilter = this.sidebarFilter.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
    //Date picker initialization
    window.$('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year,
      today: 'Today',
      clear: 'Clear',
      close: 'Ok',
      closeOnSelect: false, // Close upon selecting a date,
      container: undefined, // ex. 'body' will append picker to body
    });
    //Here we are saving the public key for encrypted sharing later.
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
    putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
    .then(() => {
        console.log("key saved")
      })
      .catch(e => {
        console.log(e);
      });
    //Here we are loading the index file of all project and setting state with the results
    getFile("projectsindex.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ projects: JSON.parse(fileContents || '{}').projects });
         this.setState({ loading: "hide" });
       } else {
         console.log("No saved projects");
         this.setState({ loading: "hide" });
       }
     })
     .then(() => {
       this.setState({filteredProjects: this.state.projects});
     })
      .catch(error => {
        console.log(error);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }

  handleTopicChange(e) {
    this.setState({
      topic: e.target.value
    });
  }

  handleTagChange(e) {
    this.setState({
      tag: e.target.value
    });
  }

  handleDateChange(event) {
    this.setState({
      dateSelect: new Date(event.target.value)
    });
  }

  handleAdd() {
    const object = {};
    object.id = Date.now();
    object.title = this.state.title;
    object.topic = [this.state.topic].join(", ");
    object.collaborators = [];
    object.status = "W";
    object.updated = getMonthDayYear();
    object.createdDay = day;
    object.createdMonth = month;
    object.createdYear = year;
    object.tags = [this.state.tag].join(", ");
    const objectTwo = object;
    this.setState({
      projects: [...this.state.projects, object],
      filteredProjects: [...this.state.filteredProjects, object],
      singleProject: objectTwo,
      showModal: "hide",
      title: "",
      topic: "",
      tag: "",
      menuBar: "hide",
      checked: false,
      tempId: object.id
    });
    setTimeout(this.saveProjectIndex, 500);
  }

  saveProjectIndex() {
    putFile("projectsindex.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        this.saveNewSingleProject();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveNewSingleProject() {
    const file = this.state.tempId;
    const fullFile = 'projects/' + file + '.json'
    putFile(fullFile, JSON.stringify(this.state.singleProject), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        // this.setState({ redirect: true });
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  toggleAll() {
    if(this.state.menuBar === "hide" && this.state.checked === false){
      this.setState({
        checked: true,
        menuBar: ""
      });
    }else {
      this.setState({
        checked: false,
        menuBar: "hide"
      });
    }
  }
//TODO Need to make checkbox selections apply to a single row
  handleCheckbox(event) {
    this.setState({checked: !this.state.checked});
    console.log(event.target.id);
  }

  filterList(event){
    var updatedList = this.state.projects;
    updatedList = updatedList.filter(function(item){
      let titleSearch = item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
      let topicSearch = item.topic.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
      return titleSearch || topicSearch;
    });
    this.setState({filteredProjects: updatedList});
  }

  sidebarFilter() {
    let projects = this.state.projects;
    let topicFilter = projects.filter(x => x.topic.includes(this.state.topicSelect));
    let tagFilter = projects.filter(x => x.tags.includes(this.state.tagSelect));
    let dateFilter = projects.filter(x => new Date(x.updated) >= this.state.dateSelect);
    let collaboratorFilter = projects.filter(x => x.collaborators.includes(this.state.collabSelect));
    let statusFilter = projects.filter(x => x.status.includes(this.state.statusSelect));
    //TODO will need to accomodate multiple filters at once
    this.state.topicSelect === "" ? console.log("no topics selected") : this.setState({ filteredProjects: topicFilter});
    this.state.tagSelect === "" ? console.log("no tags selected") : this.setState({ filteredProjects: tagFilter});
    this.state.dateSelect === "" ? console.log("no date selected") : this.setState({ filteredProjects: dateFilter});
    this.state.collabSelect === "" ? console.log("no collaborator selected") : this.setState({ filteredProjects: collaboratorFilter});
    this.state.statusSelect === "" ? console.log("no status selected") : this.setState({ filteredProjects: statusFilter});
  }

  render() {
    let projects;
    if(this.state.filteredProjects) {
      projects = this.state.filteredProjects;
    } else {
      projects = [];
    }
    let topics = projects.map(project => {
      return project.topic;
    });
    let collaborators = projects.map(project => {
      return project.collaborators;
    });
    let status = projects.map(project => {
      return project.status;
    });
    let tags = projects.map(project => {
      return project.tags;
    });

    let uniqueCollabs = [];
    window.$.each(collaborators, function(i, el){
        if(window.$.inArray(el, uniqueCollabs) === -1) uniqueCollabs.push(el);
    });

    let uniqueTopics = [];
    window.$.each(topics, function(i, el){
        if(window.$.inArray(el, uniqueTopics) === -1) uniqueTopics.push(el);
    });

    let uniqueStatus = [];
    window.$.each(status, function(i, el){
        if(window.$.inArray(el, uniqueStatus) === -1) uniqueStatus.push(el);
    });
    let uniqueTags = [];
    window.$.each(tags, function(i, el){
        if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    });

    const { topicModal, tagModal, dateModal, collaboratorsModal, statusModal, singleTopic, singleTag, singleCollaborator, singleStatus, showModal, menuBar, loading, filterModal } = this.state;
    const userData = loadUserData();
    const person = new Person(userData.profile);
    let statusButton;

    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/shared-docs">Shared Files</a></li>
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
            <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
            <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
            <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
            <li><a href="/vault"><img src="https://i.imgur.com/9ZlABws.png" alt="vault-icon" className="dropdown-icon-file" /><br />Vault</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img alt="dropdown1" src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        </div>

        <div className="row main-projects-page">
          <div className="col s12 m2 card filter-pane">
            <div className="center-align filter">
              <h5>Filter</h5>
              <div className="filter-trigger">
                <a href="#!" className="btn-floating dropdown-button btn-medium white" onClick={() => this.setState({filterModal: "", topicModal: "hide"})}>
                  <i className="black-text medium material-icons">add</i>
                </a>
              </div>

              {/*Filter Modal*/}
              <div className={filterModal}>
                <ul className='dropdown-content filter-dropdown'>
                  <li><a onClick={() => this.setState({filterModal: "hide"})} className="right-align">X</a></li>
                  <li><a onClick={() => this.setState({filterModal: "hide", topicModal: ""})}>Topics</a></li>
                  <li><a onClick={() => this.setState({filterModal: "hide", collaboratorsModal: ""})}>Collaborators</a></li>
                  <li><a onClick={() => this.setState({filterModal: "hide", statusModal: ""})}>Status</a></li>
                  <li><a onClick={() => this.setState({filterModal: "hide", tagModal: ""})}>Tags</a></li>
                  <li><a onClick={() => this.setState({filterModal: "hide", dateModal: ""})}>Updated</a></li>
                </ul>
              </div>
              {/*End Filter Modal*/}

              {/*Topic Modal*/}
                <div className={topicModal}>
                  <ul className='dropdown-content filter-dropdown'>
                  <li><a onClick={() => this.setState({filterModal: "hide", topicModal: "hide"})} className="right-align">X</a></li>
                  {uniqueTopics.slice(0).reverse().map(topic => {
                      return (
                        <li key={topic}><a onClick={() => this.setState({ topicSelect: topic, singleTopic: "", topicModal: "hide"})}>{topic}</a></li>
                      )
                    })
                  }
                  </ul>
                </div>
              {/*End  Topic Modal */}

              {/*Single Topic*/}
              <div className={singleTopic}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({singleTopic: "hide", topicSelect: "", filteredProjects: this.state.projects})} className="right-align">X</a></li>
                <li><a>{this.state.topicSelect}</a></li>
                {this.state.topicSelect === "" ? <li /> : <li><a className="apply-button" onClick={this.sidebarFilter}>Apply</a></li>}
                </ul>
              </div>
              {/*End Single Topic*/}

              {/*Tag Modal*/}
              <div className={tagModal}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({filterModal: "hide", tagModal: "hide"})} className="right-align">X</a></li>
                {uniqueTags.slice(0).reverse().map(tag => {
                    return (
                      <li key={tag}><a onClick={() => this.setState({ tagSelect: tag, singleTag: "", tagModal: "hide"})}>{tag}</a></li>
                    )
                  })
                }
                </ul>
              </div>
              {/*End Tag Modal*/}

              {/*Single Tag */}
              <div className={singleTag}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({singleTag: "hide", tagSelect: "", filteredProjects: this.state.projects})} className="right-align">X</a></li>
                <li ><a>{this.state.tagSelect}</a></li>
                {this.state.tagSelect === "" ? <li /> : <li><a className="apply-button" onClick={this.sidebarFilter}>Apply</a></li>}
                </ul>
              </div>
              {/* End Single Tag */}

              {/*Date Modal*/}
              <div className={dateModal}>
                <ul className='dropdown-content filter-dropdown'>
                  <li><a onClick={() => this.setState({filterModal: "hide", dateModal: "hide", filteredProjects: this.state.projects, dateSelect: ""})} className="right-align">X</a></li>
                  <li><input id="date" type="date" onChange={this.handleDateChange}/></li>
                  {this.state.dateSelect === "" ? <li /> : <li><a className="apply-button" onClick={this.sidebarFilter}>Apply</a></li>}
                </ul>
              </div>
              {/*End Date Modal*/}

              {/* Collaborators Modal */}
              <div className={collaboratorsModal}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({filterModal: "hide", collaboratorsModal: "hide"})} className="right-align">X</a></li>
                {uniqueCollabs.slice(0).reverse().map(collab => {
                    return (
                      <li key={Math.random()}><a onClick={() => this.setState({ collabSelect: collab, singleCollaborator: "", collaboratorsModal: "hide"})}>{collab}</a></li>
                    )
                  })
                }
                </ul>
              </div>
              {/*End Collaborators Modal */}

              {/* Single Collaborator */}
              <div className={singleCollaborator}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({singleCollaborator: "hide", collabSelect: "", filteredProjects: this.state.projects})} className="right-align">X</a></li>
                <li><a>{this.state.collabSelect}</a></li>
                {this.state.collabSelect === "" ? <li /> : <li><a className="apply-button" onClick={this.sidebarFilter}>Apply</a></li>}
                </ul>
              </div>
              {/* End Single Collaborator */}

              {/* Status Modal */}
              <div className={statusModal}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({filterModal: "hide", statusModal: "hide"})} className="right-align">X</a></li>
                {uniqueStatus.slice(0).reverse().map(stat => {
                    return (
                      <li key={stat}><a onClick={() => this.setState({ statusSelect: stat, singleStatus: "", statusModal: "hide"})}>{stat}</a></li>
                    )
                  })
                }
                </ul>
              </div>
              {/* End Status Modal */}

              {/* Single Status */}
              <div className={singleStatus}>
                <ul className='dropdown-content filter-dropdown'>
                <li><a onClick={() => this.setState({singleStatus: "hide", statusSelect: "", filteredProjects: this.state.projects})} className="right-align">X</a></li>
                <li><a>{this.state.statusSelect}</a></li>
                {this.state.statusSelect === "" ? <li /> : <li><a className="apply-button" onClick={this.sidebarFilter}>Apply</a></li>}
                </ul>
              </div>
              {/*End Single Status*/}

            </div>
          </div>
          <div className="col s12 m10 project-pane">

          {/*Loading indicator*/}
            <div className={loading}>
              <div className="progress center-align">
                <p>Loading...</p>
                <div className="indeterminate"></div>
              </div>
            </div>
            <div className="center-align project-table">
              <h3>Projects</h3>

              <div className="project-search">
                <form className="searchform">
                <fieldset className=" form-group searchfield">
                <input type="text" className="form-control form-control-lg" placeholder="Search Projects" onChange={this.filterList}/>
                </fieldset>
                </form>
              </div>

              <div className={menuBar}>
                <div className="left-align modal-footer">
                  <a className="modal-action waves-effect waves-green btn-flat">Share</a>
                  <a className="modal-action waves-effect waves-green btn-flat">Topic</a>
                  <a className="modal-action waves-effect waves-green btn-flat">Tag</a>
                  <a className="modal-action waves-effect waves-green btn-flat">Delete</a>
                </div>
              </div>

              <table className="bordered">
                <thead>
                  <tr>
                    <th><input onChange={this.toggleAll} type="checkbox" id="select-all" /><label htmlFor="select-all"></label></th>
                    <th>Project Name</th>
                    <th>Topic</th>
                    <th>Collaborators</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                    {projects.slice(0).reverse().map(project => {
                      if(project.status === "W") {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light yellow accent-4";
                      } else if(project.status === "S") {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light green darken-2";
                      } else if (project.status === "F") {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light light-blue accent-4";
                      }
                        return (
                          <tr key={project.id}>
                            <td><input type="checkbox" checked={this.state.checked} id={project.id} onChange={this.handleCheckbox} /><label htmlFor={project.id}></label></td>
                            <td><Link to={'/projects/' + project.id}>{project.title}</Link></td>
                            <td>{project.topic}</td>
                            <td>{project.collaborators}</td>
                            <td>
                              <p className={statusButton}>{project.status}</p>
                            </td>
                            <td>{project.updated}</td>
                            <td>{project.tags}</td>
                          </tr>
                        )
                      })
                    }
                </tbody>
              </table>
            </div>
          </div>
          {/*add project button*/}
          <div className="fixed-action-btn">
            <a onClick={() => this.setState({ showModal: "" })} className="btn-floating btn-medium black modal-trigger">
              <i className="large material-icons">add</i>
            </a>
          </div>
          {/*New Project Modal*/}
          <div className={showModal}>
            <div id="modal1" className="add-project-modal modal modal-fixed-footer">
              <div className="modal-content project-modal">
                <h4 className="center-align">Add New Project</h4>
                <div>
                  <label htmlFor="project_title">Project Title</label>
                  <input onChange={this.handleTitleChange} value={this.state.title} placeholder="Give your project a name" id="project_title" type="text" />
                </div>
                <div>
                  <label htmlFor="project_topic">Project Topic</label>
                  <input onChange={this.handleTopicChange} value={this.state.topic} placeholder="Short project topic" id="project_topic" type="text" />
                </div>
                <div>
                  <label htmlFor="project_topic">Project Tag</label>
                  <input onChange={this.handleTagChange} value={this.state.tag} placeholder="Tag your project, add more later" id="project_tag" type="text" />
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={this.handleAdd} className="modal-action modal-close waves-effect waves-green btn-flat">Add</a>
                <a onClick={() => this.setState({showModal: "hide", title: "", topic: "", tag: ""})} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
