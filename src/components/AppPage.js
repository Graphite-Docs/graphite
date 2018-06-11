import React, { Component } from "react";
import Signin from "./Signin";
import Header from "./Header";
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  loadUserData,
  handlePendingSignIn,
  getFile,
  signUserOut
} from "blockstack";

export default class AppPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pubKey: "",
      team: [],
      clients: []
    };

    this.loadTeamFile = this.loadTeamFile.bind(this);
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin;
    redirectToSignIn(origin, origin + "/manifest.json", [
      "store_write",
      "publish_data"
    ]);
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  componentDidMount() {
    const user = "admin.graphite";
    const options = {
      username: user,
      zoneFileLookupURL: "https://core.blockstack.org/v1/names",
      decrypt: false
    };

    if (loadUserData() !== null) {
      getFile("key.json", options)
        .then(file => {
          this.setState({ pubKey: JSON.parse(file) });
        })
        .then(() => {
          this.loadTeamFile();
        })
        .catch(error => {
          console.log("No key: " + error);
        });
      getFile("clientlist.json", options).then(fileContents => {
        if (fileContents) {
          this.setState({ clients: JSON.parse(fileContents || "{}") });
        } else {
          this.setState({ clients: [] });
        }
      });
    }
  }

  loadTeamFile() {
    const user = "admin.graphite";
    const options = {
      username: user,
      zoneFileLookupURL: "https://core.blockstack.org/v1/names",
      decrypt: false
    };
    getFile("team.json", options)
      .then(fileContents => {
        if (JSON.parse(fileContents || "{}").length > 0) {
          this.setState({ team: JSON.parse(fileContents || "{}") });
        } else {
          this.setState({ team: [] });
          console.log("No team yet");
        }
      })
      .catch(error => {
        console.log("No key: " + error);
      });
  }

  renderView() {
    const { clients } = this.state;
    let userRoot = loadUserData().username.split('.')[1] + "." + loadUserData().username.split('.')[2];
    const clientIDs =  clients.map(a => a.clientID);
    if(clientIDs.includes(userRoot)) {
      return(
        <div>
          <h1>Heyo!</h1>
        </div>
      );
    }
  }

  render() {
    const { team, clients } = this.state;
    const teammate = team.map(a => a.name);
    console.log(team);
    return (
      <div>
        <Header />
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            {!isUserSignedIn() ? (
              <Signin handleSignIn={this.handleSignIn} />
            ) : (
              <div>
                <div>
                  {/*teammate.includes(loadUserData().username) || loadUserData().username === 'admin.graphite' ? <p className="settings-icon"><a href="/admin"><i className="material-icons">settings</i></a></p> : <p />*/}
                  {loadUserData().username === "justin.personal.id" ? (
                    <p className="settings-icon">
                      <a href="/journalism-admin">
                        <i className="material-icons">settings</i>
                      </a>
                    </p>
                  ) : (
                    <p />
                  )}
                  {loadUserData().username === "admin.graphite" ? (
                    <p className="settings-icon">
                      <a href="/admin">
                        <i className="material-icons">settings</i>
                      </a>
                    </p>
                  ) : (
                    <p />
                  )}
                </div>
                <div className="row app-list">
                  <div className="col s12 m6 l3 app-page">
                    <a className="black-text" href="/documents">
                      <div
                        id="apps"
                        className="center-align app-card docs-card row"
                      >
                        <div className="col s3 m12 center-align">
                          <p className="icon docs-icon">
                            <img
                              alt="docs"
                              className=""
                              src="https://i.imgur.com/C71m2Zs.png"
                            />
                          </p>
                        </div>
                        <h4 className="col m12 s9 app-headers">Documents</h4>
                      </div>
                    </a>
                  </div>
                  <div className="col s12 m6 l3 app-page">
                    <a className="black-text" href="/sheets">
                      <div className="center-align app-card row sheets-card">
                        <div className="col s3 m12 center-align">
                          <p className="icon sheets-icon">
                            <img
                              alt="sheets"
                              className="responsive-img"
                              src="https://i.imgur.com/6jzdbhE.png"
                            />
                          </p>
                        </div>
                        <h4 className="col m12 s9 app-headers">Sheets</h4>
                      </div>
                    </a>
                  </div>
                  <div className="col s12 m6 l3 app-page">
                    <a className="black-text" href="/contacts">
                      <div className="center-align app-card row contacts-card">
                        <div className="col s3 m12 center-align">
                          <p className="icon contacts-icon">
                            <img
                              alt="contacts"
                              className=""
                              src="https://i.imgur.com/st3JArl.png"
                            />
                          </p>
                        </div>
                        <h4 className="col m12 s9 app-headers">Contacts</h4>
                      </div>
                    </a>
                  </div>
                  <div className="col s12 m6 l3 app-page">
                    <a className="black-text" href="/vault">
                      <div
                        id="apps"
                        className="center-align app-card files-card row"
                      >
                        <div className="col s3 m12 center-align">
                          <p className="icon other-icon">
                            <img
                              alt="other"
                              className="responsive-img"
                              src="https://i.imgur.com/9ZlABws.png"
                            />
                          </p>
                        </div>
                        <h4 className="col m12 s9 app-headers">Vault</h4>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }
}
