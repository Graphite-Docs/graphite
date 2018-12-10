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
  handlePendingSignIn,
  signUserOut
} from "blockstack";
import SingleConversation from './SingleConversation';
// const Font = ReactQuill.Quill.import('formats/font');
// Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
// ReactQuill.Quill.register(Font, true);

const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Conversations extends Component {
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
      messages: [],
      sharedMessages: [],
      tempMessages: [],
      myMessages: [],
      combinedMessages: [],
      count: "",
      filteredValue: [],
      tempDocId: "",
      redirect: false,
      newMessage: "",
      receiver: "",
      conversationUser: "",
      conversationUserImage: avatarFallbackImage,
      userImg: avatarFallbackImage,
      filteredContacts: [],
      contacts: [],
      newContact: "",
      add: false,
      loading: "hide",
      show: "",
      messageCount: "",
      sharedCount: "",
      newCount: "",
      scroll: true,
      newContactImg: avatarFallbackImage,
      audio: false,
      deleteMessageId: "",
      index: ""
    }
    this.handleaddItem = this.handleaddItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
    this.handleNewContact = this.handleNewContact.bind(this);
    this.newContact = this.newContact.bind(this);
    this.filterList = this.filterList.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.noScroll = this.noScroll.bind(this);
    // this.deleteMessage = this.deleteMessage.bind(this);
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    const publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey)
    putFile('key.json', JSON.stringify(publicKey), {encrypt: false})
    .then(() => {
        console.log("Saved");
      })
      .catch(e => {
        console.log(e);
      });
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
         this.setState({ filteredContacts: this.state.contacts });
       } else {
         console.log("No contacts");
       }
     })
      .catch(error => {
        console.log(error);
      });

      this.fetchMine();
      if(this.state.myMessages.length === 0) {
        this.refresh = setInterval(() => this.fetchMine(), 1000);
      }

      this.refresh = setInterval(() => this.fetchData(), 2000);

      // this.deleteMessage = () => {
      //   let message = this.state.myMessages;
      //   const thisMessage = message.find((a) => { return a.id == this.state.deleteMessageId});
      //   let index = thisMessage && thisMessage.id;
      //   function findObjectIndex(a) {
      //       return a.id == index;
      //   }
      //   this.setState({index: message.findIndex(findObjectIndex)})
      //   this.confirmDelete();
      // }

      this.confirmDelete = () => {
        // this.setState({ messages: [...this.state.myMessages, this.state.myMessages.splice(this.state.index, 1)]})
        //
        // this.setState({deleteMessageId: ""});
        //
        // setTimeout(this.saveNewFile, 500);
      }

  }

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
      })
        .catch(error => {
          console.log(error);
          // Materialize.toast(this.state.conversationUser + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
          this.setState({ conversationUser: "" });
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
          console.log(error)
        })
      const fileName = loadUserData().username.slice(0, -3) + '.json';
      const privateKey = loadUserData().appPrivateKey;
      const directory = '/shared/messages/' + fileName;
      getFile(directory, options)
        .then((file) => {
          this.setState({ tempMessages: JSON.parse(decryptECIES(privateKey, JSON.parse(file))) });
          let temp = this.state.tempMessages;
          if(this.state.newCount < 1) {
            this.setState({ newCount: temp.messages.length })
            this.setState({ sharedMessages: temp.messages});
          } else {
            if(this.state.newCount < temp.messages.length) {
              let newMessageCount = temp.messages.length - this.state.newCount;
              this.setState({ sharedMessages: temp.messages});
              this.setState({ newCount: this.state.newCount + newMessageCount })
              var audio = new Audio('https://notificationsounds.com/soundfiles/0fcbc61acd0479dc77e3cccc0f5ffca7/file-sounds-1078-case-closed.mp3');
              audio.play();
              if(document.hidden){
                this.changeFavicon();
              }
            } else {
              this.setState({ newCount: this.state.newCount});
            }
          }
          if(document.hidden === false) {
            this.favBack();
          }
          this.setState({ combinedMessages: [...this.state.myMessages, ...this.state.sharedMessages] });
          this.setState({ loading: "hide", show: "" });
        })
        .catch((error) => {
          console.log(error);
        })
  }

  newContact() {
    this.setState({add: true});
  }

  handleaddItem() {
    const today = new Date();
    const object = {};
    let combinedMessages;
    if(this.state.combinedMessages.length <1) {
      combinedMessages = this.state.myMessages;
    } else {
      combinedMessages = this.state.combinedMessages;
    }
    function compare(a,b) {
      return a.id - b.id
    }
    let messages = combinedMessages.sort(compare);
    var ids = messages.map(a => a.id);
    if(ids.length > 0) {
      let random = Math.random()*0.08;
      let calc = 1 + random;
      let newID = ids.slice(-1)[0]*calc;
      object.id = parseInt(newID.toFixed(0), 10);
    } else {
      object.id = Date.now();
    }
    object.content = this.state.newMessage;
    object.created = today.toString();
    object.sender = loadUserData().username;
    object.receiver = this.state.conversationUser;

    this.setState({ messages: [...this.state.myMessages, object] });
    this.setState({newMessage: ""});
    setTimeout(this.saveNewFile, 500);
}

  saveNewFile() {
    const fileName = this.state.conversationUser.slice(0, -3) + '.json';
    putFile(fileName, JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        this.setState({deleteShow: "hide"});
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
    const directory = '/shared/messages/' + fileName;
    putFile(directory, encryptedData)
      .then(() => {
      })
      .catch(e => {
        console.log(e);
      });
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "instant" });
    setTimeout(this.noScroll, 3000);
  }

  noScroll() {
    this.setState({scroll: false});
  }

  handleMessage(value) {
    this.setState({ newMessage: value })
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleNewContact(e) {
    this.setState({ newContact: e.target.value })
  }

  filterList(event){
    var updatedList = this.state.contacts;
    updatedList = updatedList.filter(function(item){
      return item.contact.toLowerCase().search(
        event.target.value.toLowerCase()) !== -1;
    });
    this.setState({filteredContacts: updatedList});
  }

changeFavicon() {
  // document.getElementById('favicon').href = iconNew;
    document.title = "(*) Graphite";
}
favBack() {
  document.title = "Graphite";
}


  renderView() {

    if(this.state.newCount > 0 && this.state.scroll === true) {
      this.scrollToBottom();
    }
    let combinedMessages;
    if(this.state.combinedMessages.length <1) {
      combinedMessages = this.state.myMessages;
    } else {
      combinedMessages = this.state.combinedMessages;
    }
    function compare(a,b) {
      return a.id - b.id
    }
    let messages = combinedMessages.sort(compare);
    let show = this.state.show;
    let loading = this.state.loading;
    if(this.state.conversationUser === "") {
      return(
        <h5 className="center-align">Select a contact to start or continue a conversation.</h5>
      );
    } else {
      SingleConversation.modules = {
        toolbar: [
          [{ 'header': '1'}, {'header': '2'}, { 'font': Font.whitelist }],
          [{size: []}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'},
           {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'video'],
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

      return (
        <div>
          <div className="container loader">
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
                  <div key={message.id} className="main-covo">

                    <div className="bubble sender row">
                      <div className="col s12">
                        <p className="convo-p muted">To: {this.state.conversationUser}</p>
                        <p className="convo-p muted">{message.created} </p>
                        <h6 dangerouslySetInnerHTML={{ __html: message.content }} />
                      </div>

                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={message.id} className="">

                    <div className="bubble receiver row">

                      <div className="col s12">
                        <p className="convo-p muted">From: {this.state.conversationUser}</p>
                        <p className="convo-p muted">{message.created} </p>
                        <h6 dangerouslySetInnerHTML={{ __html: message.content }} />
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
              className="materialize-textarea convo-textarea print-view"
              placeholder="Send a message"
              theme="bubble"
              value={this.state.newMessage}
              onChange={this.handleMessage}
              modules={SingleConversation.modules}
              formats={SingleConversation.formats}
              />

            <button onClick={this.handleaddItem} className="convo-button btn">Send</button>
          </div>

        </div>
      );
    }
  }


  render(){
    console.log(this.state.combinedMessages)
    let contacts = this.state.filteredContacts;
    const userData = loadUserData();
    const person = new Person(userData.profile);
    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo left text-white">Graphite.<img className="pencil" src="https://i.imgur.com/2diRYIZ.png" alt="pencil" /></a>

            <ul id="nav-mobile" className="right">
            <ul id="dropdown1" className="dropdown-content">
              <li><a href="/export">Export All Data</a></li>
              <li className="divider"></li>
              <li><a onClick={ this.handleSignOut }>Sign out</a></li>
            </ul>
            <ul id="dropdown2" className="dropdown-content">
            <li><a href="/documents"><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /><br />Documents</a></li>
            <li><a href="/sheets"><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /><br />Sheets</a></li>
            <li><a href="/contacts"><img src="https://i.imgur.com/st3JArl.png" alt="contacts-icon" className="dropdown-icon" /><br />Contacts</a></li>
            <li><a href="/conversations"><img src="https://i.imgur.com/cuXF1V5.png" alt="conversations-icon" className="dropdown-icon-bigger" /><br />Conversations</a></li>
            <li><a href="/vault"><img src="https://i.imgur.com/9ZlABws.png" alt="vault-icon" className="dropdown-icon-file" /><br />Vault</a></li>
            </ul>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown2"><i className="material-icons apps">apps</i></a></li>
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><img alt="dropdown1" src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" /><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        </div>
        <div>
            <div className="row">
              <div className="col s3 convo-left">
              <div className="card conversations-card">
                <div className="convo-sidebar center-align">
                  <img src="https://i.imgur.com/cuXF1V5.png" alt="conversations-icon" className="conversations-icon-image" />
                </div>
                {contacts.slice(0).reverse().map(contact => {
                    return (
                      <div key={contact.contact}>

                        <div className="contact-row">
                        <a onClick={() => this.setState({ scroll: true, conversationUser: contact.contact, newCount: 0, combinedMessages: [], conversationUserImage: avatarFallbackImage, myMessages: [] })} className="conversation-click black-text">
                          <div className="row no-margin">
                            <div className="col s4 center-align">
                              <a className="conversation-click" onClick={() => this.setState({ user: contact.contact, combinedMessages: [], conversationUserImage: avatarFallbackImage })}><img className="responsive-img circle conversations-img" src={contact.img} alt="profile" /></a>
                            </div>
                            <div className="col s8">
                              <a onClick={() => this.setState({ scroll: true, conversationUser: contact.contact, newCount: 0, combinedMessages: [], conversationUserImage: avatarFallbackImage, myMessages: [] })} className="conversation-click black-text"><h5 className="conversation-contact">{contact.contact.length > 14 ? contact.contact.substring(0,14)+"..." :  contact.contact}</h5></a>
                            </div>
                          </div>
                        </a>
                        </div>
                      </div>
                    )
                  })
                }
                </div>
              </div>

              <div className="col s9 convo-right">
                <div className="card convo-card">
                  {this.renderView()}
                </div>
              </div>
              </div>


        </div>
      </div>
    )
  }
}
