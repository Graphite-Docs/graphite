import React, { Component } from "react";
import {
  isSignInPending,
  getFile,
  putFile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import update from 'immutability-helper';
const { encryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SentCollection extends Component {
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
      docs: [],
      shareFile: [],
      value: [],
      user: "",
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      loading: "",
      img: avatarFallbackImage,
      deleteId: ""
    }
    // this.deleteShareDoc = this.deleteShareDoc.bind(this);


  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    const user = this.props.match.params.id;
    const fileName = 'shareddocs.json'
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
        console.log("Step One: PubKey Loaded");
      })
      .catch(error => {
        console.log(error);
      });

    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
       } else {
         console.log("No docs");
       }
     })
      .catch(error => {
        console.log(error);
      });

    let fileID = this.props.match.params.id;
    let fileOne = fileID.slice(0, -3) + fileName;
    getFile(fileOne, {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("loaded");
         this.setState({ docs: JSON.parse(fileContents || '{}') });
       } else {
         console.log("Nothing shared");
       }
     })
      .catch(error => {
        console.log(error);
      });
    this.deleteShareDoc = () => {
      this.setState({deleteId: ""})
      let docs = this.state.docs;
      const thisDoc = docs.find((doc) => { return doc.id.toString() === this.state.deleteId}); //comparing strings
      let index = thisDoc && thisDoc.id;
      function findObjectIndex(doc) {
        return doc.id === index; //comparing numbers
      }
      let deleteIndex = docs.findIndex(findObjectIndex)
      let updatedDoc = update(this.state.docs, {$splice: [[deleteIndex, 1, ]]})
      this.setState({docs: updatedDoc})
      setTimeout(this.saveEncrypted, 1000);
    }

    this.saveEncrypted = () => {
      const user = this.props.match.params.id;
      const userShort = user.slice(0, -3);
      const fileName = 'shareddocs.json'
      const file = userShort + fileName;
      const publicKey = this.state.pubKey;
      const data = this.state.docs;
      const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
      const directory = '/shared/' + file;
      putFile(directory, encryptedData)
        .then(() => {
          const user = this.props.match.params.id;
          const userShort = user.slice(0, -3);
          const fileName = 'shareddocs.json'
          const file = userShort + fileName;
          putFile(file, JSON.stringify(this.state.docs), {encrypt: true})
            .then(() => {
              window.Materialize.toast('Document no longer shared', 3000);
            })
            .catch(e => {
              console.log(e);
            });
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  renderView() {

    let docs = this.state.docs;
    if(this.state.deleteId !== "") {
      this.deleteShareDoc();
    }
    if (docs.length > 0) {
      return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                  <ul className="left toolbar-menu">
                    <li>Back</li>
                  </ul>

              </div>
            </nav>
          </div>
          <div className="container docs">
          <div className="container">
            <h3 className="center-align">Documents you shared with {this.props.match.params.id}</h3>

            <table className="bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Shared With</th>
                  <th>Date Shared</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
            {
              docs.slice(0).reverse().map(doc => {

              return(
                <tr key={doc.id}>
                  <td>{doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title}</td>
                  <td>{this.props.match.params.id}</td>
                  <td>{doc.shared}</td>
                  <td><a onClick={() => this.setState({ deleteId: doc.id})}><i className="modal-trigger material-icons red-text delete-button">delete</i></a></td>
                </tr>
              );
              })
            }
            </tbody>
          </table>

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
              <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li>Back</li>
                </ul>

            </div>
          </nav>
        </div>
        <div className="container docs">
          <h3 className="center-align">You have not shared anything with {this.props.match.params.id}</h3>
        </div>
        </div>
      );
    }
  }

  render() {
    console.log(this.state.docs);
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
