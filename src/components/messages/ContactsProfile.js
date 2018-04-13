import React, { Component } from "react";
import { Link } from 'react-router-dom';
import 'react-quill/dist/quill.bubble.css';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  lookupProfile,
  signUserOut,
  handlePendingSignIn,
} from 'blockstack';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class ContactsProfile extends Component {
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
    loading: "",
    show: "hide",
    description: "",
    name: "",
    appsUsed: "",
    conversationUser: "",
    img: avatarFallbackImage
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
  this.setState({receiver: loadUserData().username});
  let info = loadUserData().profile;
  if(info.image) {
    this.setState({ userImg: info.image[0].contentUrl});
  } else {
    this.setState({ userImg: avatarFallbackImage});
  }

  getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Contacts are here");
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
         let contact = this.state.contacts;
         const thisContact = contact.find((a) => { return a.contact === this.props.match.params.id});
         this.setState({ conversationUser: thisContact && thisContact.contact});
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });
    this.fetchData();
    this.refresh = setInterval(() => this.fetchData(), 1000);
}

fetchData() {
const username = this.state.conversationUser;

  lookupProfile(username, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      console.log(profile);
      let image = profile.image;
      if(image) {
        this.setState({ img: image[0].contentUrl });
      } else {
        this.setState({ img: avatarFallbackImage });
      }
      this.setState({
        person: new Person(profile),
        username: username,
        name: profile.name,
        description: profile.description,
        accounts: profile.accounts
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
}

handleSignOut(e) {
  e.preventDefault();
  signUserOut(window.location.origin);
}

render() {
  console.log(this.state.accounts);
  return (
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/contacts" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


            <ul className="left toolbar-menu">
              <li><a href='/contacts'>Back to Contacts</a></li>
            </ul>

        </div>
      </nav>
    </div>
    <div className="container docs contact-page">

    <div className="col s12 m7">
    <div className="card medium contact-profile-card horizontal">
      <div className="card-image profile-image">
        <img className="rounded-img responsive-img" alt="state img" src={this.state.img} />
      </div>
      <div className="card-stacked">
        <div className="card-content">
          <h3 className="header">{this.state.name}</h3>
          <h5>{this.state.username}</h5>
          <p>{this.state.description}</p>
        </div>
        <div className="card-action">
          <Link to={'/documents/shared/' + this.state.username}><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /></Link>
          <Link to={'/sheets/shared/' + this.state.username}><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /></Link>
          <a href='/conversations'><img src="https://i.imgur.com/cuXF1V5.png" alt="conversations-icon" className="dropdown-icon-bigger" /></a>
        </div>
      </div>
    </div>
  </div>
    </div>
    </div>
  );
}
}

// <input type="text" placeholder="Message here" value={this.state.newMessage} onChange={this.handleMessage} />
