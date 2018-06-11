import React, { Component } from "react";
import Header from "../Header";
import {
  isSignInPending,
  getFile,
  putFile,
  handlePendingSignIn
} from 'blockstack';

export default class DeleteClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: [],
      name: "",
      index: "",
      save: "",
      loading: "hide"
    }
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
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
    getFile("clientlist.json", {decrypt: false})
     .then((fileContents) => {
        this.setState({ clients: JSON.parse(fileContents || '{}') })
        console.log("loaded");
     }).then(() =>{
       let clients = this.state.clients;
       const thisClient = clients.find((client) => { return client.id == this.props.match.params.id});
       let index = thisClient && thisClient.id;
       function findObjectIndex(client) {
           return client.id == index;
       }
       this.setState({ name: thisClient && thisClient.name, index: clients.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });

    }

  handleDeleteItem() {
    this.setState({ clients: [...this.state.clients, this.state.clients.splice(this.state.index, 1)]})
    this.setState({ loading: "show", save: "hide" });
    this.saveNewFile();
  };

  saveNewFile() {
    this.setState({ loading: "show" });
    this.setState({ save: "hide"});
    putFile("clientlist.json", JSON.stringify(this.state.clients), {encrypt: false})
      .then(() => {
        window.location.href = '/admin';
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  render() {
    const { loading, save } = this.state;
    return (
      <div>
        <Header />
        <div className="container docs">
          <div className="card doc-card delete-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete Client
            </h5>
            <h6>Are you sure you want to delete <strong>{this.state.name}</strong>?
            </h6>
            <div className={save}>
            <button className="btn red" onClick={this.handleDeleteItem}>
              Delete
            </button>
            <a href="/documents"><button className="btn grey">
              No, go back
            </button></a>
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

      </div>
    );
  }
}
