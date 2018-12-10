import React, { Component } from "react";
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  handlePendingSignIn,
} from "blockstack";
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Blog extends Component {
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
      contacts: [],
      team: [],
      hideMain: "",
      teammateModal: "hide",
      teammateName: "",
      deleteContact: "",
      contact: "",
      index: "",
      confirmAdd: false
    }
    this.delete = this.delete.bind(this);
    this.saveTeam = this.saveTeam.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      //TODO need to prevent duplicate adds
      const team = this.state.team;
      if(team.length > 0){
        if(team.includes(this.state.teammateName)){
          console.log("Nope");
          window.Materialize.toast('That person is already on your team.', 4000)
        } else {
          this.addTeammate();
        }
      } else {
          this.addTeammate();
      }
    }

    if(this.state.deleteContact !== "") {
      let deleteName = this.state.deleteContact;
      let team = this.state.team;
      window.$.each(team, function(i){
        if(team[i].name === deleteName) {
            team.splice(i,1);
            this.setState({ team: [...this.state.team, team.splice(i, 1)]})
            return false;
        }
      });
      setTimeout(this.delete, 500);
    }
  }

  componentDidMount() {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       let file = JSON.parse(fileContents || '{}');
       let contacts = file.contacts;
       if(contacts.length > 0) {
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         this.setState({ contacts: [] });
       }
     })
      .catch(error => {
        console.log(error);
      });

    getFile("blogteam.json", {decrypt: false})
    .then((fileContents) => {
      if(JSON.parse(fileContents || '{}').length > 0){
        this.setState({ team: JSON.parse(fileContents || '{}') });
      } else {
        console.log("No team yet")
      }
    })
     .catch(error => {
       console.log(error);
     });
  }

  addTeammate() {
    this.setState({confirmAdd: false, hideMain: "", teammateModal: "hide" });
    const object = {};
    object.name = this.state.teammateName;
    object.added = getMonthDayYear();
    object.postCount = 0;
    this.setState({ team: [...this.state.team, object] });
    setTimeout(this.saveTeam, 500);
  }

  delete() {
    this.setState({team: this.state.team, deleteContact: "" })
    this.saveTeam();
  }

  saveTeam() {
    putFile('blogteam.json', JSON.stringify(this.state.team), {encrypt: false})
    .then(() => {
        console.log("Saved!");
      })
      .catch(e => {
        console.log(e);
      });
  }

  render(){
    const user = loadUserData().username;
    const blogLink = 'https://thelead.blog/' + user;
    const { team, hideMain, teammateModal, contacts } = this.state;
    console.log(team);
    if(loadUserData().username === "jehunter5811.id"){
      return(
        <div>
        {/* Nav */}
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/documents" className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>
                <ul className="left toolbar-menu">
                  <li><a className="small-menu">Blog Settings</a></li>
                </ul>
            </div>
          </nav>
        </div>
        {/* End Nav */}
        <div className="container blog-settings">
          {/*Main Page */}
          <div className={hideMain}>
            <h3 className="center-align">Manage your blog settings</h3>
            <div className="row">
              <div className="col s6">
                <h5>Your Team <button className="add-teammate-button btn-floating btn-small black" onClick={() => this.setState({ hideMain: "hide", teammateModal: "" })}><i aria-labelledby="Add new blog team member" className="material-icons white-text">add</i></button></h5>

                <table className="bordered">
                  <thead>
                    <tr>
                      <th>Teammate Name</th>
                      <th>Date Added</th>
                      <th>Post Count</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                      {team.slice(0).reverse().map(mate => {
                          return (
                            <tr key={mate.name}>
                              <td>{mate.name}</td>
                              <td>{mate.added}</td>
                              <td>{mate.postCount}</td>
                              <td><a onClick={() => this.setState({ deleteContact: mate.name })} ><i className="material-icons red-text">delete</i></a></td>
                            </tr>
                          )
                        })
                      }
                  </tbody>
                </table>
              </div>
              <div className="col s6">
                <h5>Blog URL</h5>
                <p><i aria-labelledby="Link to blog" className="material-icons black-text">insert_link</i><a href={blogLink}>{blogLink}</a></p>
                <button className="btn-flat">Request Custom Domain</button>
              </div>
              <div className="col stats s12">
                <h5 className="center-align">Stats</h5>
                <p>Coming soon.</p>
              </div>
            </div>
          </div>
          {/* End Main Page */}

          {/*Teammate Modal */}
          <div className={teammateModal}>
            <div id="modal1" className=" project-page-modal modal">
              <div className="modal-content">
                <h4>Add a Teammate From Your Contacts</h4>
                <p>Need to <a href="/contacts">add a new contact</a>?</p>
                <div>
                  <ul className="collection with-header">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item avatar">
                          <a onClick={() => this.setState({ teammateName: contact.contact, confirmAdd: true })}>
                          <p><span className="title black-text">{contact.contact}</span></p>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <a onClick={() => this.setState({ teammateModal: "hide", hideMain: "" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Teammate Modal */}
        </div>
        </div>
      )
    } else {
      return (
        <div>
        {/* Nav */}
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/documents" className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>
                <ul className="left toolbar-menu">
                  <li><a className="small-menu">Blog Settings</a></li>
                </ul>
            </div>
          </nav>
        </div>
        {/* End Nav */}
        <div className="container blog-settings center-align">
          <h3>You do not have blog access</h3>
          <button className="btn-flat">Request Access</button>
        </div>
        </div>
      )
    }
  }
}
