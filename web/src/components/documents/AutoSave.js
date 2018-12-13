import React, { Component, Link } from "react";
import ReactDOM from 'react-dom';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut
} from "blockstack";
import { getMonthDayYear } from '../helpers/getMonthDayYear';
const wordcount = require("wordcount");
const blockstack = require("blockstack");
// const Quill = ReactQuill.Quill
// const Font = Quill.import('formats/font');
// Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto'];
// Quill.register(Font, true);

export default class SingleDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autosave: "",
      value: [],
      textvalue : "",
      test:"",
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
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
    blockstack.getFile("documents.json", true)
     .then((fileContents) => {
        this.setState({ value: JSON.parse(fileContents || '{}').value })
        console.log("loaded");
     }).then(() =>{
       let value = this.state.value;
       // const thisDoc = value.find((doc) => { return doc.id == this.props.match.params.id});
       // let index = thisDoc && thisDoc.id;
       // function findObjectIndex(doc) {
       //     return doc.id == index;
       // }
       // this.setState({ test: thisDoc && thisDoc.content, textvalue: thisDoc && thisDoc.title, index: value.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });
      blockstack.getFile("autosave.json", true)
        .then((fileContents) => {
          let title = JSON.parse(fileContents || '{}').title;
          let content = JSON.parse(fileContents || '{}').content;
          let rando = this.props.match.params.id;
          this.setState({ textvalue: title, test: content })
      });

      this.printPreview = () => {
        if(this.state.printPreview == true) {
          this.setState({printPreview: false});
        } else {
          this.setState({printPreview: true});
        }
      }
    }


  handleTitleChange(e) {
    this.setState({
      textvalue: e.target.value
    });
  }
  handleChange(value) {
      this.setState({ test: value })
    }
  handleaddItem() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.textvalue;
    object.content = this.state.test;
    object.id = parseInt(this.props.match.params.id);
    object.updated = getMonthDayYear();
    object.words = wordcount(this.state.test);
    this.setState({ value: [...this.state.value, this.state.value.splice(this.state.index, 1, object)]})
    console.log(this.state.value);
    this.setState({ loading: "show", save: "hide" });
    this.saveNewFile();
  };

  saveBlank(){
    blockstack.putFile("autosave.json", JSON.stringify(this.state.autosave), true)
      .then(() => {
        console.log("It worked!");
        location.href = '/';
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
      });
  }

  saveNewFile() {
    this.setState({ loading: "show" });
    this.setState({ save: "hide"});
    blockstack.putFile("documents.json", JSON.stringify(this.state), true)
      .then(() => {
        console.log(JSON.stringify(this.state));
        this.setState({autosave: ""});
        this.saveBlank();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
        alert(e.message);
        // location.href = '/';
      });
  }

  print(){
    const curURL = window.location.href;
    window.history.replaceState(window.history.state, '', '/');
    window.print();
    window.history.replaceState(window.history.state, '', curURL);
  }

  renderView() {
    const words = wordcount(this.state.test);
    const loading = this.state.loading;
    const save = this.state.save;

    if(this.state.printPreview === true) {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleaddItem} className="brand-logo"><div className={save}><i className="material-icons">arrow_back</i></div></a>
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
              <div className={save}>
                <ul className="left toolbar-menu">
                  <li><a onClick={this.printPreview}>Back to Editing</a></li>
                  <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                  <li><a href="badges.html">Toolbar</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
        <div className="container docs">
          <div className="card doc-card">
            <div className="double-space doc-margin">
              <p className="center-align print-view">
              {this.state.textvalue}
              </p>
              <div>
                <div
                  className="print-view"
                  dangerouslySetInnerHTML={{ __html: this.state.test }}
                />
              </div>
              </div>
              </div>
        </div>

        </div>
      );
    } else {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleaddItem} className="brand-logo"><div className={save}>Save Now</div></a>
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
              <div className={save}>
                <ul className="left toolbar-menu">
                <li><a onClick={this.printPreview}>Export Options</a></li>
                  <li><a href="badges.html">Toolbar</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
          <div className="container docs">
            <div className="card doc-card">
              <div className="double-space doc-margin">
              <h4 className="align-left">
              <input className="print-title" type="text" value={this.state.textvalue} onChange={this.handleTitleChange} />
              </h4>

              {/* <ReactQuill
                id="textarea1"
                className="materialize-textarea print-view"
                placeholder="Write something great"
                value={this.state.test}
                onChange={this.handleChange}
              /> */}

              <div className="right-align wordcounter">
                <p className="wordcount">{words} words</p>
              </div>
              <div className={save}>
              <button className="btn black" onClick={this.handleaddItem}>
                Update
              </button>
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

  render() {
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}

// <textarea
//   type="text"
  // id="textarea1"
  // className="materialize-textarea print-content"
//   value={this.state.test}
//   onChange={this.handleChange}
// />
