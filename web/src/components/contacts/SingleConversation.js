import React, { Component } from "react";
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.bubble.css';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
  handlePendingSignIn
} from 'blockstack';

const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleConversation extends Component {
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
    contacts: [],
    messages: [],
    sharedMessages: [],
    myMessages: [],
    combinedMessages: [],
    count: "",
    filteredValue: [],
    tempDocId: "",
    redirect: false,
    loading: "",
    show: "hide",
    newMessage: "",
    receiver: "",
    conversationUser: "",
    conversationUserImage: avatarFallbackImage,
    userImg: avatarFallbackImage,
    pubKey: ""
  }
  this.handleaddItem = this.handleaddItem.bind(this);
  this.saveNewFile = this.saveNewFile.bind(this);
  this.handleMessage = this.handleMessage.bind(this);
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
         const thisContact = contact.find((a) => { return a.contact == this.props.match.params.id});
         this.setState({ conversationUser: thisContact && thisContact.contact});
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

    this.refresh = setInterval(() => this.fetchMine(), 1000);
    this.refresh = setInterval(() => this.fetchData(), 1000);
    // let combined = [{...this.state.myMessages, ...this.state.sharedMessages}]
    // this.setState({ combined: combined});
}

// componentDidUpdate() {
//   this.scrollToBottom();
// }

fetchMine() {
  const fileName = this.state.conversationUser.slice(0, -3) + '.json';
  getFile(fileName, {decrypt: true})
   .then((fileContents) => {
     if(fileContents) {
       console.log("loaded")
       this.setState({ myMessages: JSON.parse(fileContents || '{}').messages });
     } else {
       console.log("No saved files");
     }
   })
    .catch(error => {
      console.log("fetchmine failed " + error);
    });
}

fetchData() {
const username = this.state.conversationUser;
const options = { username: username, zoneFileLookupURL: "https://core.blockstack.org/v1/names"}
getFile('key.json', options)
  .then((file) => {
    this.setState({ pubKey: JSON.parse(file)})
    console.log("Step One: PubKey Loaded");
  })
    .catch(error => {
      console.log(error);
    });

  lookupProfile(username, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      let image = profile.image;
      if(profile.image){
        this.setState({conversationUserImage: image[0].contentUrl})
      }
      this.setState({
        person: new Person(profile),
        username: username
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
  const fileName = loadUserData().username.slice(0, -3) + '.json';
  const privateKey = loadUserData().appPrivateKey;
  const directory = '/shared/' + fileName;
  getFile(directory, options)
    .then((file) => {
      console.log("Shared file: " + file);
      // console.log("Shared messages: " + JSON.parse(decryptECIES(privateKey, JSON.parse(file))));
      console.log("fetched!");

      this.setState({ tempMessages: JSON.parse(decryptECIES(privateKey, JSON.parse(file))) });
      let temp = this.state.tempMessages;
      this.setState({ sharedMessages: temp.messages});
      this.setState({ combinedMessages: [...this.state.myMessages, ...this.state.sharedMessages] });
      this.setState({ loading: "hide", show: "" });
      this.scrollToBottom();
    })
    .catch((error) => {
      console.log('could not fetch shared messages: ' + error);
    })
}

newContact() {
  this.setState({add: true});
}

handleaddItem() {
  const today = new Date();
  const rando = Date.now();
  const object = {};
  object.content = this.state.newMessage;
  object.id = rando;
  object.created = today.toString();
  object.sender = loadUserData().username;
  object.receiver = this.state.conversationUser;

  this.setState({ messages: [...this.state.myMessages, object] });
  this.setState({newMessage: ""});
  setTimeout(this.saveNewFile, 500);
  // setTimeout(this.handleGo, 700);
}

saveNewFile() {
  const fileName = this.state.conversationUser.slice(0, -3) + '.json';
  putFile(fileName, JSON.stringify(this.state), {encrypt: true})
    .then(() => {
      console.log("Saved!");
      this.saveShared();
    })
    .catch(e => {
      console.log(e);
    });
}

saveShared() {
  const fileName = this.state.conversationUser.slice(0, -3) + '.json';
  const publicKey = this.state.pubKey;
  const data = this.state;
  const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
  const directory = '/shared/' + fileName;
  putFile(directory, encryptedData)
    .then(() => {
      console.log("Shared encrypted file " + directory);
    })
    .catch(e => {
      console.log(e);
    });
}

handleSignOut(e) {
  e.preventDefault();
  signUserOut(window.location.origin);
}

handleMessage(value) {
  this.setState({ newMessage: value })
}

scrollToBottom = () => {
  this.messagesEnd.scrollIntoView({ behavior: "smooth" });
}

render() {

  SingleConversation.modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': Font.whitelist }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'},
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }
  /*
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
  SingleConversation.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ]

  let combinedMessages = this.state.combinedMessages;
  function compare(a,b) {
    return a.id - b.id
  }
  let messages = combinedMessages.sort(compare);

  let loading = this.state.loading;
  let show = this.state.show;

  return (
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/contacts" className="brand-logo"><i className="material-icons">arrow_back</i></a>


            <ul className="left toolbar-menu">
              <li><a>Conversation with {this.state.conversationUser}</a></li>
            </ul>

        </div>
      </nav>
    </div>

      <div className="container">
        <div className={loading}>
          <div className="progress center-align">
            <p>Loading...</p>
            <div className="indeterminate"></div>
          </div>
        </div>
      </div>
      <div className={show}>
      <div>
      {messages.map(message => {
        if(message.sender === loadUserData().username || message.receiver === loadUserData().username){
          if(message.sender === loadUserData().username) {
            return (
              <div key={message.id} className="">

                <div className="bubble sender container row">
                  <div className="col s8">
                    <p dangerouslySetInnerHTML={{ __html: message.content }} />
                    <p className="muted">{message.created}</p>
                  </div>
                  <div className="col s4">
                    <img className="responsive-img sender-message-img circle" src={this.state.userImg} alt="avatar" />
                  </div>
                </div>
              </div>
            )
          } else {
            return (
              <div key={message.id} className="">

                <div className="bubble receiver container row">
                  <div className="col s4">
                    <img className="responsive-img receiver-message-img circle" src={this.state.conversationUserImage} alt="avatar" />
                  </div>
                  <div className="col s8">
                    <p dangerouslySetInnerHTML={{ __html: message.content }} />
                    <p className="muted">{message.created}</p>
                  </div>
                </div>
              </div>
            )
          }
        }else {
          return (
            <div></div>
          )
        }
        })
      }
      </div>
        <div style={{ float:"left", clear: "both" }}
          ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </div>
      <div className="center-align message-input container white">
        <ReactQuill
          id="textarea1"
          className="materialize-textarea print-view"
          placeholder="Send a message"
          theme="bubble"
          value={this.state.newMessage}
          onChange={this.handleMessage}
          modules={SingleConversation.modules}
          formats={SingleConversation.formats}
          />

        <button onClick={this.handleaddItem} className="btn">Send</button>
      </div>

    </div>
  );
}
}

// <input type="text" placeholder="Message here" value={this.state.newMessage} onChange={this.handleMessage} />
