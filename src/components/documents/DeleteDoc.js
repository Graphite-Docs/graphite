import React, { Component } from "react";
import Header from "../Header";
import {
  isSignInPending,
  getFile,
  putFile,
  handlePendingSignIn
} from 'blockstack';

export default class DeleteDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      textvalue : "",
      singleDoc: {},
      test:"",
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
    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ value: JSON.parse(fileContents || '{}').value })
        console.log("loaded");
     }).then(() =>{
       let value = this.state.value;
       const thisDoc = value.find((doc) => { return doc.id === this.props.match.params.id});
       let index = thisDoc && thisDoc.id;
       function findObjectIndex(doc) {
           return doc.id === index;
       }
       this.setState({ test: thisDoc && thisDoc.content, textvalue: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });
      const file = this.props.match.params.id;
      const fullFile = '/documents/' + file + '.json';
      getFile(fullFile, {decrypt: true})
       .then((fileContents) => {
         console.log(fileContents);
          this.setState({
            singleDoc: JSON.parse(fileContents || '{}')
         })
       })
        .catch(error => {
          console.log(error);
        });

    }

  handleDeleteItem() {
    const object = {};
    object.title = this.state.textvalue;
    object.content = this.state.test;
    object.id = parseInt(this.props.match.params.id);
    this.setState({ value: [...this.state.value, this.state.value.splice(this.state.index, 1)]})
    this.setState({ singleDoc: {} });
    this.setState({ loading: "show", save: "hide" });
    this.saveNewFile();
  };

  saveNewFile() {
    this.setState({ loading: "show" });
    this.setState({ save: "hide"});
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        // console.log(JSON.stringify(this.state));
        this.saveTwo();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  saveTwo() {
    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt:true})
      .then(() => {
        this.setState({ loading: "hide" });
        window.location.href = '/documents';
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
          <div className="card doc-card delete-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete Document
            </h5>
            <h6>Are you sure you want to delete <strong>{this.state.singleDoc.title}</strong>?
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
