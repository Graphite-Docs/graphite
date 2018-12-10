import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      value: [],
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      loading: ""
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.filterList = this.filterList.bind(this);

  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Files are here");
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         this.setState({filteredValue: this.state.value})
         this.setState({ loading: "hide" });
       } else {
         console.log("No saved files");
         this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });
  }

  handleaddItem() {
    const rando = Date.now();
    const object = {};
    object.title = "Untitled";
    object.content = "";
    object.id = rando;
    object.created = getMonthDayYear();

    this.setState({ value: [] });
    this.setState({ filteredValue: [] });
    this.setState({ tempDocId: object.id });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }
  filterList(event){
    var updatedList = this.state.value;
    updatedList = updatedList.filter(function(item){
      return item.title.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredValue: updatedList});
  }

  saveNewFile() {
    putFile("documents.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        // Materialize.toast('Documents Deleted', 2000);
        setTimeout(this.redirect, 2000);
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  redirect() {
    window.location.replace("/documents");
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
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

              <li><a href="/shared-docs">Shared Files</a></li>
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
              <li><a href="/documents"><i className="material-icons blue-text text-darken-2">description</i><br />Documents</a></li>
              <li><a href="/sheets"><i className="material-icons green-text text-lighten-1">grid_on</i><br />Sheets</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img alt='avatar' src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        </div>
        <div className="docs">
        <div className="center-align">
          <div className="">
            <a onClick={this.handleaddItem}><div className="card small">
              <div className="center-align card-content">
                <p><i className="addDoc large material-icons">warning</i></p>
              </div>
              <div className="card-action">
                <a className="black-text">Delete All Documents</a>
              </div>
            </div></a>
          </div>
        </div>
      </div>
      </div>
    );
  }
}
