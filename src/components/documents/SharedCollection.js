import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  isSignInPending,
  loadUserData,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
import {Menu as MainMenu, Icon, Container, Table} from 'semantic-ui-react';
import Loading from '../Loading';
const { getPublicKeyFromPrivate } = require('blockstack');
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedCollection extends Component {
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
      value: [],
      user: "",
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      img: avatarFallbackImage,
      loading: false
    }


  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    this.setState({ user: window.location.href.split('shared/')[1], loading: true });
    getFile("documentscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
         // this.setState({filteredValue: this.state.value})
         // this.setState({ loading: "hide" });
       } else {
         console.log("No docs");
       }
     })
      .catch(error => {
        console.log(error);
      });

    let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    let fileString = 'shareddocs.json'
    let file = publicKey + fileString;
    const directory = 'shared/' + file;
    const user = window.location.href.split('shared/')[1];
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    lookupProfile(user, "https://core.blockstack.org/v1/names")
      .then((profile) => {
        let image = profile.image;
        console.log(profile);
        if(profile.image){
          this.setState({img: image[0].contentUrl})
        } else {
          this.setState({ img: avatarFallbackImage })
        }
      })
      .catch((error) => {
        console.log('could not resolve profile')
      })
    getFile(directory, options)
     .then((fileContents) => {
       let privateKey = loadUserData().appPrivateKey;
       console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
       this.setState({ docs: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
         this.setState({ loading: false });
       })
       console.log("loaded");
       this.save();
     })
      .catch(error => {
        console.log(error);
      });
  }

  save() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("saved");
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleaddItem() {
    this.setState({ show: "hide" });
    this.setState({ hideButton: "hide", loading: "" })
    const rando = Date.now();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = rando;
    object.created = getMonthDayYear();

    this.setState({ value: [...this.state.value, object] });
    // this.setState({ filteredValue: [...this.state.filteredValue, object] });
    this.setState({ tempDocId: object.id });
    this.setState({ loading: "" });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }

  saveNewFile() {
    putFile("documents.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/documents");
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderView() {
    const { loading, docs } = this.state;
    if (docs.length > 0 && !loading) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-docs'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color:"#fff"}}>
            Documents shared by {this.state.user}
          </MainMenu.Item>
          </MainMenu>
          <Container>
          <div style={{marginTop: "65px", textAlign: "center"}}>
            <h3 className="center-align">Documents {this.state.user} shared with you</h3>

            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Static File</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                  {
                    docs.slice(0).reverse().map(doc => {

                    return(
                      <Table.Row key={doc.id} style={{ marginTop: "35px"}}>
                        <Table.Cell><Link to={'/documents/single/shared/'+ this.state.user + '/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"}</Link></Table.Cell>
                        <Table.Cell>{this.state.user}</Table.Cell>
                        <Table.Cell>{doc.rtc === true ? "False" : "True"}</Table.Cell>
                        <Table.Cell>{doc.shared}</Table.Cell>
                      </Table.Row>
                    );
                    })
                  }
              </Table.Body>
            </Table>
            </div>
          </Container>
        </div>
      );
    } else if(!loading && docs.length < 1) {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a>Documents shared by {this.state.user}</a></li>
                </ul>

            </div>
          </nav>
        </div>
        <div className="container docs">
          <h3 className="center-align">Nothing shared by {this.state.user}</h3>
        </div>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }
  }


  render() {
    const link = '/documents/doc/' + this.state.tempDocId;
    if (this.state.redirect) {
      return <Redirect push to={link} />;
    } else {
      console.log("No redirect");
    }
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
