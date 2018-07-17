import React, { Component } from "react";
import { Redirect } from 'react-router';
import {
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
} from 'blockstack';
const { getPublicKeyFromPrivate } = require('blockstack');
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class EditorCollection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      filteredPosts: [],
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
      statusSelect: "",
      team: [],
      contacts: [],
      editorView: "",
      editorName: "",
      editorRoles: "",
      editorPermissions: "",
      editorIntegrations: "",
      editorPublish: "",
      journoView: "",
      journoName: "",
      journoRoles: "",
      journoPermissions: "",
      journoIntegrations: "",
      journoPublish: "",
      integrations: [],
      teamLength: 0,
      count: 0,
      matePosts: [],
      userToLoad: "",
      postId: "",
      redirect: false,
      userRole: "",
      publishedPostCollection: []
    }
    this.filterList = this.filterList.bind(this);
    this.loadTeamFiles = this.loadTeamFiles.bind(this);
    this.loadPermissions = this.loadPermissions.bind(this);
    this.loadPublishedCollections = this.loadPublishedCollections.bind(this);
    this.loadMainAdminPublished = this.loadMainAdminPublished.bind(this);
  }

  componentDidMount() {

    //Get main client list to see if logged in user should have access.
    const user = 'admin.graphite';
    const options = { username: user, zoneFileLookupURL: 'https://core.blockstack.org/v1/names', decrypt: false}
    getFile('clientlist.json', options)
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ clients: JSON.parse(fileContents || '{}') });
        } else {
          this.setState({ clients: [] });
        }

      })
      .then(() => {
        let user = loadUserData().username;
        let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
        let clientList;
        if(this.state.clients) {
          clientList = this.state.clients;
        } else {
          clientList = [];
        }
        let clientIDs =  clientList.map(a => a.clientID);
        if(clientIDs.includes(userRoot) || clientIDs.includes(user)) {
          this.loadPermissions();
        }
      })
      .catch(error => {
        console.log(error);
      });


    getFile(loadUserData().username + 'publishedPostscollection.json', {decrypt: false})
      .then((fileContents) => {
        console.log("loading my published posts");
        console.log(JSON.parse(fileContents || '{}'));
        if(fileContents) {
          this.setState({ publishedPostCollection: JSON.parse(fileContents || '{}')})
        } else {
          this.setState({ publishedPostCollection: []})
        }
      })
      .catch(error => {
        console.log(error);
      })
    //Here we are saving the public key for encrypted sharing later.
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
    putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
    .then(() => {
        console.log("key saved")
      })
      .catch(e => {
        console.log(e);
      });

  }

  componentDidUpdate() {
    if(this.state.userToLoad !== "") {
      putFile('singlejournodocid.json', JSON.stringify(this.state.userToLoad), {encrypt: true})
        .then(() => {
          console.log("selected User saved");
          this.setState({ userToLoad: "", redirect: true});
        })
    }
  }

  loadPublishedCollections() {
    if(this.state.count < this.state.team.length) {
      console.log(this.state.team[this.state.count].name);
      const file = this.state.team[this.state.count].name + 'publishedPostscollection.json';
      const options = { username: this.state.team[this.state.count].name, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
        getFile(file, options)
         .then((fileContents) => {
           if(fileContents) {
             console.log("found a file: ");
             console.log(JSON.parse(fileContents || "{}"))
             this.setState({ publishedPostCollection: this.state.publishedPostCollection.concat(JSON.parse(fileContents || "{}")) })
             this.setState({count: this.state.count + 1});
           } else {
             this.setState({count: this.state.count + 1});
           }
         })
          .then(() => {
            this.loadPublishedCollections();
          })
          .catch(error => {
            console.log(error);
            this.setState({count: this.state.count + 1});
            this.loadPublishedCollections();
          });
    } else {
      console.log("All published files loaded");
      this.setState({ count: 0 });
      this.loadMainAdminPublished();
    }
  }

  loadMainAdminPublished() {
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const file = userRoot + 'publishedPostscollection.json';
    const options = { username: this.state.team[this.state.count].name, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      getFile(file, options)
       .then((fileContents) => {
         if(fileContents) {
           console.log("found a file: ");
           console.log(JSON.parse(fileContents || "{}"))
           this.setState({ publishedPostCollection: this.state.publishedPostCollection.concat(JSON.parse(fileContents || "{}")) })
           this.setState({count: this.state.count + 1});
         } else {
           this.setState({ loading: "hide", show: ""});
         }
       })
       .then(() => {
         this.setState({ loading: "hide", show: ""})
       })
       .catch(error => {
         console.log(error);
       })
  }

  loadPermissions() {
    let user = loadUserData().username;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    let clientList;
    if(this.state.clients) {
      clientList = this.state.clients;
    } else {
      clientList = [];
    }
    let clientIDs =  clientList.map(a => a.clientID);

    if(clientIDs.includes(userRoot)) {
      const options = {username: userRoot, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false };
      const privateKey = loadUserData().appPrivateKey;
      getFile(getPublicKeyFromPrivate(loadUserData().appPrivateKey) + '.json', options)
       .then((fileContents) => {
         if(fileContents) {
           console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
           this.setState({
             team: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
             integrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).team,
             editorView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorView,
             editorName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorName,
             editorRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorRoles,
             editorPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPermissions,
             editorIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorIntegrations,
             editorPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).editorPublish,
             journoView: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoView,
             journoName: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoName,
             journoRoles: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoRoles,
             journoPermissions: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPermissions,
             journoIntegrations: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoIntegrations,
             journoPublish: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).journoPublish,
             accountSettings: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).accountSettings,
             lastUpdated: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).lastUpdated
           })
         } else {
           this.setState({
             team: [],
             integrations: [],
             editorView: false,
             editorRoles: false,
             editorPermissions: false,
             editorIntegrations: false,
             editorPublish: false,
             journoView: false,
             journoRoles: false,
             journoPermissions: false,
             journoIntegrations: false,
             journoPublish: false,
             accountSettings: "",
             lastUpdated: 0
           })
         }
       })
        .then(() => {
          let teamList;
          if(this.state.team) {
            teamList = this.state.team;
          } else {
            teamList = [];
          }
          let teamName = teamList.map(a => a.name);
          let teamMate = teamList.find(function (obj) { return obj.name === loadUserData().username })
          if(teamMate) {
            this.setState({ userRole: teamMate.role});
          }
        })
        .then(() => {
          this.loadTeamFiles();
        })
        .catch(error => {
          console.log(error);
        });
    } else if(clientIDs.includes(user)) {
      getFile('journoFileTest.json', {decrypt: true})
        .then((fileContents) => {
          if(fileContents) {
            console.log("Found your file");
            console.log(JSON.parse(fileContents || '{}'));
            this.setState({
              team: JSON.parse(fileContents || '{}').team,
              integrations: JSON.parse(fileContents || '{}').integrations || [],
              editorView: JSON.parse(fileContents || '{}').editorView,
              editorName: JSON.parse(fileContents || '{}').editorName,
              editorRoles: JSON.parse(fileContents || '{}').editorRoles,
              editorPermissions: JSON.parse(fileContents || '{}').editorPermissions,
              editorIntegrations: JSON.parse(fileContents || '{}').editorIntegrations,
              editorPublish: JSON.parse(fileContents || '{}').editorPublish,
              journoView: JSON.parse(fileContents || '{}').journoView,
              journoName: JSON.parse(fileContents || '{}').journoName,
              journoRoles: JSON.parse(fileContents || '{}').journoRoles,
              journoPermissions: JSON.parse(fileContents || '{}').journoPermissions,
              journoIntegrations: JSON.parse(fileContents || '{}').journoIntegrations,
              journoPublish: JSON.parse(fileContents || '{}').journoPublish,
              accountSettings: JSON.parse(fileContents || '{}').accountSettings,
              lastUpdated: JSON.parse(fileContents || '{}').lastUpdated
            })
          } else {
            console.log("No file created yet");
            this.setState({
              team: [],
              integrations: [],
              editorView: false,
              editorName: false,
              editorRoles: false,
              editorPermissions: false,
              editorIntegrations: false,
              editorPublish: false,
              journoView: false,
              journoName: false,
              journoRoles: false,
              journoPermissions: false,
              journoIntegrations: false,
              journoPublish: false,
              accountSettings: "",
              lastUpdated: 0
            })
          }
        })
        .then(() => {
          let teamList;
          if(this.state.team) {
            teamList = this.state.team;
          } else {
            teamList = [];
          }
          let teamName = teamList.map(a => a.name);
          let teamMate = teamList.find(function (obj) { return obj.name === loadUserData().username })
          if(teamMate) {
            this.setState({ userRole: teamMate.role});
          }
        })
        .then(() => {
          this.loadTeamFiles();
        })
        .catch(error => {
          console.log(error);
        });
    }

  }

  loadTeamFiles() {
    if(this.state.count < this.state.team.length) {
      console.log(this.state.team[this.state.count].name);
      const file = loadUserData().username + 'submitted.json';
      console.log(file);
      const options = { username: this.state.team[this.state.count].name, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
        getFile(file, options)
         .then((fileContents) => {
           let privateKey = loadUserData().appPrivateKey;
           if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).length > 0) {
             this.setState({ newMatePosts: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) })
           } else {
             this.setState({ newMatePosts: [] })
           }
           this.setState({count: this.state.count + 1});
         })
          .then(() => {
            console.log(this.state.matePosts);
            let finalMatePosts = this.state.matePosts.concat(this.state.newMatePosts);
            this.setState({ matePosts: finalMatePosts});
          })
          .then(() => {
            this.loadTeamFiles();
          })
          .catch(error => {
            console.log(error);
            this.setState({count: this.state.count + 1});
            this.loadTeamFiles();
          });
    } else {
      console.log("All team files loaded");
      // this.setState({ loading: "hide", show: ""})
      this.setState({ count: 0, userToLoad: "" });
      this.loadPublishedCollections();
    }
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
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

  renderView() {
    if(this.state.redirect === true) {
      return <Redirect push to={'/journalism/' + this.state.postId} />
    }
    const { publishedPostCollection, editorPublish, journoPublish, userRole, team, matePosts, loading, clients } = this.state;
    console.log("published posts collection")
    console.log(publishedPostCollection);
    let user = loadUserData().username;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    let allPosts;
    if(matePosts) {
      allPosts = matePosts;
    } else {
      allPosts = []
    }
    let clientList;
    if(clients) {
      clientList = clients;
    } else {
      clientList = [];
    }
    let clientIDs = clientList.map(a => a.clientID);
    let teamList;

    let props = ['id'];
    let idsToCheck = [];

    // let result = matePosts.filter(function(o1){
    //     // filter out (!) items in result2
    //     return publishedPostCollection.some(function(o2){
    //         return o1.id === o2.id;          // assumes unique id
    //     });
    // }).map(function(o){
    //     // use reduce to make objects with only the required properties
    //     // and map to apply this to the filtered array as a whole
    //     return props.reduce(function(newo, name){
    //         newo[name] = o[name];
    //         console.log(newo);
    //         idsToCheck = [...idsToCheck, newo];
    //     }, {});
    // });
    let ids;
    if(publishedPostCollection) {
      ids = publishedPostCollection.map(a => a.id);
    }
    console.log(ids);
    let statusButton;

    if(clientIDs.includes(userRoot) || clientIDs.includes(user)) {
      if(userRole === "Administrator" || clientIDs.includes(user)) {
          return (
            <div className="docs">

              <div className="container project-pane">

              {/*Loading indicator*/}
                <div className={loading}>
                  <div className="progress center-align">
                    <p>Loading...</p>
                    <div className="indeterminate"></div>
                  </div>
                </div>
                <div>
                <div className="row">
                  <div className="col s12 m6">
                    <h5>Posts ({allPosts.length})
                      {/*appliedFilter === false ? <span className="filter"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
                      {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredValue: this.state.value})}>Clear</a></span> : <div />*/}
                    </h5>
                  </div>
                  <div className="col right s12 m6">
                  <form className="searchform">
                  <fieldset className=" form-group searchfield">
                  <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Posts" onChange={this.filterList}/>
                  </fieldset>
                  </form>
                  </div>
                </div>

                  <table className="bordered">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                  {
                    allPosts.map(post => {
                      if(ids.includes(post.id)) {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light green darken-2";
                      } else {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light yellow accent-4";
                      }
                    return(
                      <tr key={post.id}>
                        <td><input type="checkbox" checked={this.state.checked} value={post.id} id={post.id} onChange={this.handleCheckbox} /><label htmlFor={post.id}></label></td>
                        <td><a onClick={() => this.setState({ postId: post.id, userToLoad: post.author})}>{post.title.length > 30 ? post.title.substring(0,30)+"..." :  post.title}</a></td>
                        <td>{post.author}</td>
                        <td>{post.updated}</td>
                        <td>{ids.includes(post.id) ? <p className={statusButton}>S</p> : <p className={statusButton}>P</p>}</td>
                      </tr>
                    );
                    })
                  }
                  </tbody>
                </table>
                </div>
              </div>
            </div>
        )
      } else if(userRole === "Editor" && editorPublish === true) {
        return (
          <div className="docs">

            <div className="container project-pane">

            {/*Loading indicator*/}
              <div className={loading}>
                <div className="progress center-align">
                  <p>Loading...</p>
                  <div className="indeterminate"></div>
                </div>
              </div>
              <div>
              <div className="row">
                <div className="col s12 m6">
                  <h5>Posts ({allPosts.length})
                    {/*appliedFilter === false ? <span className="filter"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
                    {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredValue: this.state.value})}>Clear</a></span> : <div />*/}
                  </h5>
                </div>
                <div className="col right s12 m6">
                <form className="searchform">
                <fieldset className=" form-group searchfield">
                <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Posts" onChange={this.filterList}/>
                </fieldset>
                </form>
                </div>
              </div>

                <table className="bordered">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                    allPosts.map(post => {
                      if(ids.includes(post.id)) {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light green darken-2";
                      } else {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light yellow accent-4";
                      }
                    return(
                      <tr key={post.id}>
                        <td><input type="checkbox" checked={this.state.checked} value={post.id} id={post.id} onChange={this.handleCheckbox} /><label htmlFor={post.id}></label></td>
                        <td><a onClick={() => this.setState({ postId: post.id, userToLoad: post.author})}>{post.title.length > 30 ? post.title.substring(0,30)+"..." :  post.title}</a></td>
                        <td>{post.author}</td>
                        <td>{post.updated}</td>
                        <td>{ids.includes(post.id) ? <p className={statusButton}>S</p> : <p className={statusButton}>P</p>}</td>
                      </tr>
                    );
                    })
                  }
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )
      } else if(userRole === "Journalist" && journoPublish === true) {
        return (
          <div className="docs">

            <div className="container project-pane">

            {/*Loading indicator*/}
              <div className={loading}>
                <div className="progress center-align">
                  <p>Loading...</p>
                  <div className="indeterminate"></div>
                </div>
              </div>
              <div>
              <div className="row">
                <div className="col s12 m6">
                  <h5>Posts ({allPosts.length})
                    {/*appliedFilter === false ? <span className="filter"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span> : <span className="hide"><a href="#" data-activates="slide-out" className="menu-button-collapse button-collapse">Filter<i className="filter-icon material-icons">arrow_drop_down</i></a></span>}
                    {appliedFilter === true ? <span className="filter"><a className="card filter-applied" onClick={() => this.setState({ appliedFilter: false, filteredValue: this.state.value})}>Clear</a></span> : <div />*/}
                  </h5>
                </div>
                <div className="col right s12 m6">
                <form className="searchform">
                <fieldset className=" form-group searchfield">
                <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Posts" onChange={this.filterList}/>
                </fieldset>
                </form>
                </div>
              </div>

                <table className="bordered">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                    allPosts.map(post => {
                      if(ids.includes(post.id)) {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light green darken-2";
                      } else {
                        statusButton = "btn-floating center-align btn-small waves-effect waves-light yellow accent-4";
                      }
                    return(
                      <tr key={post.id}>
                        <td><input type="checkbox" checked={this.state.checked} value={post.id} id={post.id} onChange={this.handleCheckbox} /><label htmlFor={post.id}></label></td>
                        <td><a onClick={() => this.setState({ postId: post.id, userToLoad: post.author})}>{post.title.length > 30 ? post.title.substring(0,30)+"..." :  post.title}</a></td>
                        <td>{post.author}</td>
                        <td>{post.updated}</td>
                        <td>{ids.includes(post.id) ? <p className={statusButton}>S</p> : <p className={statusButton}>P</p>}</td>
                      </tr>
                    );
                    })
                  }
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div className="docs">

            <div className="container project-pane">

              <h5 className="center-align">You do not have access to this page. Go <a href="/">home</a></h5>

            </div>
          </div>
        )
      }
    } else {
      return (
        <div className="docs">

          <div className="container project-pane">

            <h5 className="center-align">You do not have access to this page. Go <a href="/">home</a></h5>

          </div>
        </div>
      )
    }
  }


  render() {
    const userData = loadUserData();
    const person = new Person(userData.profile);

    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/journalism-admin">Admin</a></li>
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

        {this.renderView()}

      </div>
    );
  }
}
