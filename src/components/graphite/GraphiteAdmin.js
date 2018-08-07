import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  handlePendingSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';

const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class GraphiteAdmin extends Component {
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
      orgs: [],
      loading: "hide",
      addClientModal: "hide",
      filteredValue: [],
      newClientName: "",
      newClientID: "",
      newClientType: "",
      newClientPlan: "",
      paid: "",
      team: [],
      teamMain: [],
      lastUpdatedMain: "",
      lastUpdated: "",
      listUpdated: "",
      mainListUpdated: ""
    }

    this.handleNewClientName = this.handleNewClientName.bind(this);
    this.handleNewClientID = this.handleNewClientID.bind(this);
    this.handleAddClient = this.handleAddClient.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    const user = "admin.graphite";
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    if(loadUserData() !==null) {
      getFile('key.json', options)
        .then((file) => {
          this.setState({ pubKey: JSON.parse(file)})
        })
          .then(() => {
            this.loadTeamFile();
          })
          .catch(error => {
            console.log("No key: " + error);
          });
    }


    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
    putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
    .then(() => {
        console.log("Saved!");
        console.log(JSON.stringify(publicKey));
      })
      .catch(e => {
        console.log(e);
      });
    this.loadClientList();
  }

  loadClientList() {

    getFile("clientlist.json", {decrypt: false})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').length > 0) {
         this.setState({ orgs: JSON.parse(fileContents || '{}') });
         this.setState({filteredValue: this.state.orgs})
         this.setState({ loading: "hide" });
       } else {
         this.setState({ orgs: [] });
         this.setState({filteredValue: this.state.orgs})
         this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });
  }


  handleNewClientName(e) {
    this.setState({newClientName: e.target.value });
  }

  handleNewClientID(e) {
    this.setState({ newClientID: e.target.value});
  }

  handleAddClient() {
    const rando = Date.now();
    const object = {};
    object.id = rando;
    object.name = this.state.newClientName;
    object.clientID = this.state.newClientID;
    object.type = this.state.newClientType;
    object.plan = this.state.newClientPlan;
    object.paid = this.state.paid;
    object.added = getMonthDayYear();

    this.setState({ orgs: [...this.state.orgs, object] });
    this.setState({ filteredValue: [...this.state.filteredValue, object] });
    setTimeout(this.saveNewFile, 500);
  }

  saveNewFile() {
    putFile("clientlist.json", JSON.stringify(this.state.orgs), {encrypt:false})
      .then(() => {
        console.log("Saved Client List!");
        this.setState({ addClientModal: "hide", newClientName: "", newClientID: "", newClientPlan: "", newClientType: "", paid: ""});
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  renderView() {
    const { addClientModal, orgs, loading } = this.state;
    console.log(orgs);
    if(loadUserData().username === 'admin.graphite') {
      return(
      <div>
      <div className="docs">
      <div className="row container">
        <div className="col s12 m6">
          <h5>Clients</h5>
        </div>
        <div className="col right s12 m6">
        <form className="searchform">
        <fieldset className=" form-group searchfield">
        <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Clients" onChange={this.filterList}/>
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
          <a onClick={() => this.setState({ addClientModal: "" })} className="btn-floating btn-large black">
            <i className="large material-icons">add</i>
          </a>
      </div>
      {/* End Add Button */}
        <table className="bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Org Type</th>
              <th>Plan Type</th>
              <th>Added</th>
              <th>Paid</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
        {
          orgs.map(org => {
          return(
            <tr key={org.id}>
              <td><Link to={''}>{org.name.length > 30 ? org.name.substring(0,30)+"..." :  org.name}</Link></td>
              <td>{org.type}</td>
              <td>{org.plan}</td>
              <td>{org.added}</td>
              <td>{org.paid}</td>
              <td><Link to={'/admin/delete/'+ org.id}><i className="modal-trigger material-icons red-text delete-button">delete</i></Link></td>
            </tr>
          );
          })
        }
        </tbody>
      </table>

      {/*New Client Modal*/}
      <div className={addClientModal}>
        <div id="modal1" className="add-modal modal">
          <div className="modal-content">
            <h4>Add Client</h4>
            <label htmlFor="client_name">Client Name</label>
            <input value={this.state.newClientName} onChange={this.handleNewClientName} placeholder="Ex: New York Times" id="main_id" type="text" className="validate" />
            <label htmlFor="client_name">Main ID</label>
            <input value={this.state.newClientID} onChange={this.handleNewClientID} placeholder="Ex: nytime.graphite" id="main_id" type="text" className="validate" />
            <div>
              <label>Org Type</label>
              <form value="">
                <p>
                  <input checked={this.state.newClientType === 'Newsroom'} className="with-gap" name="admin" value="type-newsroom" onChange={() => this.setState({ newClientType: "Newsroom"})} type="radio" id="type-newsroom"  />
                  <label htmlFor="type-newsroom">Newsroom</label>
                </p>
                <p>
                  <input checked={this.state.newClientType === 'NGO'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientType: "NGO"})} id="type-ngo"  />
                  <label htmlFor="type-ngo">NGO</label>
                </p>
                <p>
                  <input checked={this.state.newClientType === 'Business'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientType: "Business"})} id="type-business"  />
                  <label htmlFor="type-business">Business</label>
                </p>
                <p>
                  <input checked={this.state.newClientType === 'Medical'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientType: "Medical"})} id="type-medical"  />
                  <label htmlFor="type-medical">Medical</label>
                </p>
                <p>
                  <input checked={this.state.newClientType === 'Education'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientType: "Education"})} id="type-education"  />
                  <label htmlFor="type-education">Education</label>
                </p>
              </form>
            </div>
            <div>
              <label>Plan Type</label>
              <form value="">
                <p>
                  <input checked={this.state.newClientPlan === 'Basic'} className="with-gap" name="admin" value="role-admin" onChange={() => this.setState({ newClientPlan: "Basic"})} type="radio" id="plan-basic"  />
                  <label htmlFor="plan-basic">Basic</label>
                </p>
                <p>
                  <input checked={this.state.newClientPlan === 'Standard'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientPlan: "Standard"})} id="plan-standard"  />
                  <label htmlFor="plan-standard">Standard</label>
                </p>
                <p>
                  <input checked={this.state.newClientPlan === 'Advanced'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientPlan: "Advanced"})} id="plan-advanced"  />
                  <label htmlFor="plan-advanced">Advanced</label>
                </p>
                <p>
                  <input checked={this.state.newClientPlan === 'Custom'} className="with-gap" name="group1" type="radio" onChange={() => this.setState({ newClientPlan: "Custom"})} id="plan-custom"  />
                  <label htmlFor="plan-custom">Custom</label>
                </p>
              </form>
            </div>
            <form action="#">
            <label>Paid</label>
              <p>
                <input checked={this.state.paid === 'Yes'} name="yes" type="radio" id="yes" onChange={() => this.setState({ paid: "Yes"})} />
                <label htmlFor="yes">Yes</label>
              </p>
              <p>
              <input checked={this.state.paid === 'No'} name="no" type="radio" id="no" onChange={() => this.setState({ paid: "No"})} />
              <label htmlFor="no">No</label>
              </p>
            </form>
          </div>
          <div className="modal-footer">
            <a onClick={this.handleAddClient} className="modal-action modal-close waves-effect waves-green btn-flat">Save</a>
            <a onClick={() => this.setState({ addClientModal: "hide", newClientName: "", newClientID: "", newClientPlan: "", newClientType: "", paid: "" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
          </div>
        </div>
        <div>
      </div>
      {/*End New Client Modal */}

        {/*<ul className="center-align pagination">
        {renderPageNumbers}
        </ul>
        <div className="docs-per-page right-align">
          <label>Docs per page</label>
          <select value={this.state.docsPerPage} onChange={(event) => this.setState({ docsPerPage: event.target.value})}>
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
        */}
      </div>

      </div>
      </div>
    </div>
  )
    } else {
      return(
      <div className="docs">
        <h5 className="center-align">You do not have access to this page.</h5>
        <p className="center-align"><a href="/">Go home</a></p>
      </div>
    )
    }
  }

  render() {
    const { team } = this.state;
    const userData = loadUserData();
    const person = new Person(userData.profile);
    const teammate =  team.map(a => a.name);

    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
              <ul id="dropdown1" className="dropdown-content">
                <li><a href="/export">Export All Data</a></li>
                {loadUserData().username.includes('admin.graphite') || teammate.includes(loadUserData().username) ? <li><a href="/admin/settings">Account Settings</a></li> : <br/>}
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
