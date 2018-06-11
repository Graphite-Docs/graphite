import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
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
      teamLength: 0,
      count: 0,
      matePosts: [],
      userToLoad: "",
      postId: "",
      redirect: false
    }
    this.filterList = this.filterList.bind(this);
    this.loadTeamFiles = this.loadTeamFiles.bind(this);
  }

  componentDidMount() {
    getFile('submitted.json', {decrypt: true})
      .then((fileContents) => {
        if(JSON.parse(fileContents || '{}').length > 0) {
          this.setState({ posts: JSON.parse(fileContents || '{}'), loading: "hide" })
        } else {
          this.setState({ posts: [], loading: "hide" })
        }

      })
      .catch(error => {
        console.log(error)
      })

    //TODO re-introduce encryption here and on the admin page. Team file needs to be encrypted there then decrypted here.

    getFile("team.json", {decrypt: false})
    .then((fileContents) => {
      if(JSON.parse(fileContents || '{}').length > 0){
        this.setState({ team: JSON.parse(fileContents || '{}'), teamLength: JSON.parse(fileContents || '{}').length, count: 0 });
      } else {
        this.setState({ team: [], teamLength: 0, count: 0})
      }
    })
     .then(() => {
       this.loadTeamFiles();
     })
     .catch(error => {
       console.log(error);
     });
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

  loadTeamFiles() {
    let check = this.state.teamLength;
    if(this.state.count < check) {
      console.log(this.state.team[this.state.count].name);
      const file = 'submitted.json';
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
          });
    } else {
      console.log("All team files loaded");
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


  render() {
    if(this.state.redirect === true) {
      return <Redirect push to={'/journalism/' + this.state.postId} />
    }
    const { matePosts, team, loading, posts } = this.state;
    console.log(matePosts);
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
                <h5>Posts ({matePosts.length})
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
                matePosts.map(post => {
                return(
                  <tr key={post.id}>
                    <td><input type="checkbox" checked={this.state.checked} value={post.id} id={post.id} onChange={this.handleCheckbox} /><label htmlFor={post.id}></label></td>
                    <td><a onClick={() => this.setState({ postId: post.id, userToLoad: post.author})}>{post.title.length > 30 ? post.title.substring(0,30)+"..." :  post.title}</a></td>
                    <td>{post.author}</td>
                    <td>{post.updated}</td>
                    <td>{post.status}</td>
                  </tr>
                );
                })
              }
              </tbody>
            </table>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
