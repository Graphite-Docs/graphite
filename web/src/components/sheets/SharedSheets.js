import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut
} from 'blockstack';
import Loading from '../Loading';
import Header from '../Header';
import { Grid, Item } from 'semantic-ui-react';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedSheets extends Component {

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
      username: "",
      contacts: [],
      filteredContacts: [],
      title : "",
      grid: [
        []
      ],
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      senderID: "",
      sheets: [],
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      receiverID: "",
      show: "",
      hide: "",
      hideButton: "",
      sharedWithMe: true
    }

    this.fetchData = this.fetchData.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.pullData = this.pullData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentDidMount() {
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       this.setState({ loading: true});
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
         this.setState({ filteredContacts: this.state.contacts });
       } else {
         console.log("No contacts");
       }
     })
     .then(() => {
       this.setState({ loading: false });
     })
      .catch(error => {
        console.log(error);
      });

    getFile("sheetscollection.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
       } else {
         console.log("Nothing shared");
       }
     })
      .catch(error => {
        console.log(error);
      });
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
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
    object.content = this.state.grid;
    object.id = rando;
    object.created = getMonthDayYear();

    this.setState({ sheets: [...this.state.sheets, object] });
    this.setState({ tempDocId: object.id });
    this.setState({ loading: "" });
    // this.setState({ confirm: true, cancel: false });
    setTimeout(this.saveNewFile, 500);
    // setTimeout(this.handleGo, 700);
  }

  saveNewFile() {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt:true})
      .then(() => {
        console.log("Saved!");
        window.location.replace("/sheets");
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  fetchData() {
    const username = this.state.senderID;

      lookupProfile(username, "https://core.blockstack.org/v1/names")
        .then((profile) => {
          this.setState({
            person: new Person(profile),
            username: username
          })
        })
        .catch((error) => {
          console.log('could not resolve profile')
          this.setState({ loading: "hide" });
          window.Materialize.toast('Could not find user', 2000);
          setTimeout(this.windowRefresh, 2000);
        })

      const options = { username: this.state.senderID, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

      getFile('sharedsheet.json', options)
        .then((file) => {
          const doc = JSON.parse(file || '{}');
          console.log(doc.title);
          this.setState({ title: doc.title, grid: doc.content, receiverID: doc.receiverID })
          this.setState({ show: "hide", loading: "hide", hideButton: ""});
        })
        .catch((error) => {
          console.log('could not fetch');
          this.setState({ loading: "hide" });
          window.Materialize.toast('Nothing shared', 2000);
          setTimeout(this.windowRefresh, 2000);
        })
        .then(() => {
          this.setState({ isLoading: false })
        })
    }

  windowRefresh() {
    window.location.reload(true);
  }

  handleIDChange(e) {
    this.setState({ senderID: e.target.value })
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }

  handleChange(value) {
    this.setState({ content: value })
  }

  pullData() {
    this.fetchData();
    this.setState({ hideButton: "hide", loading: "" });
  }

  render() {
      const { loading, contacts } = this.state;
      let contactsList;
      if(contacts) {
        contactsList = contacts;
      } else {
        contactsList = [];
      }
      if(!loading) {
        return (
          <div>
          <Header />
          <div style={{marginTop: "45px", textAlign: "center"}}>
            <div className="container center-align">
              <h3>Sheets Shared With Me</h3>
              <h5>Select the contact who shared with you</h5>
            </div>
            <Grid style={{maxWidth: "85%", margin: "auto"}} relaxed columns={2}>
              {contactsList.slice(0).reverse().map(contact => {
                let imageLink;
                let name;
                if(contact.img) {
                  imageLink = contact.img;
                } else {
                  imageLink = avatarFallbackImage;
                }

                if(contact.name) {
                  name = contact.name;
                } else {
                  name = "";
                }
                  return (
                    <Grid.Column style={{textAlign: "center"}} key={contact.contact}>
                      <Item.Group>
                        <Item className="contacts-items">
                          <Link to={'/sheets/shared/'+ contact.contact}>
                            <Item.Image size='tiny' src={imageLink} />
                            <Item.Content>
                              <Item.Header>{contact.contact}</Item.Header>
                              <Item.Meta>{name}</Item.Meta>
                            </Item.Content>
                          </Link>
                        </Item>
                      </Item.Group>
                    </Grid.Column>
                  )
                })
              }
              </Grid>
          </div>
          </div>
        );
      } else {
        return (
          <Loading />
        )
      }

    }

}
