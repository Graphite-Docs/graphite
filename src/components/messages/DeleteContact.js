import React, { Component } from "react";
import Header from "../Header";
import {
  isSignInPending,
  getFile,
  putFile,
  handlePendingSignIn,
} from 'blockstack';

export default class DeleteContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      contact: "",
      contactImg: "",
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
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ contacts: JSON.parse(fileContents || '{}').contacts })
        console.log("loaded");
     }).then(() =>{
       let contact = this.state.contacts;
       const thisContact = contact.find((a) => { return a.contact.toString() === this.props.match.params.id});
       let index = thisContact && thisContact.contact;
       function findObjectIndex(contact) {
           return contact.contact === index;
       }
       this.setState({ contact: thisContact && thisContact.contact, contactImg: thisContact && thisContact.img, index: contact.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });
    }

  handleDeleteItem() {
    const object = {};
    object.contact = this.state.contact;
    object.img = this.state.contactImg;
    this.setState({ contacts: [...this.state.contacts, this.state.contacts.splice(this.state.index, 1)]})
    console.log(this.state.contacts);
    this.setState({ loading: "show", save: "hide" });
    this.saveNewFile();
  };

  saveNewFile() {
    this.setState({ loading: "show" });
    this.setState({ save: "hide"});
    putFile("contact.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log(JSON.stringify(this.state));
        this.setState({ loading: "hide" });
        window.location.href = '/contacts';
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  render() {
    const loading = this.state.loading;
    const save = this.state.save;
    return (
      <div>
        <Header />
        <div className="container docs">
          <div className="card delete-card doc-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete Contact
            </h5>
            <h6>Are you sure you want to delete <strong>{this.state.contact}</strong>?
            </h6>
            <div className={save}>
            <button className="btn red" onClick={this.handleDeleteItem}>
              Delete
            </button>
            <a href="/contacts"><button className="btn grey">
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
