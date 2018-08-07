import React, { Component } from "react";
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import { toXML } from 'jstoxml';
import { getMonthDayYear } from '../helpers/getMonthDayYear';
import axios from 'axios';
const wordcount = require("wordcount");
const { decryptECIES } = require('blockstack/lib/encryption');

export default class SingleJournoDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userToLoad: "",
      totalPosts: "",
      title: "",
      content: "",
      index: "",
      contacts: [],
      comments: [],
      loading: "",
      publishModal: "hide",
      singlePublicPost: {},
      publishedPostCollection: [],
      integrations: [],
      integrationURL: "",
      modalContent: "",
      integrationsList: "hide",
      webhook: false
    }

    this.loadFile = this.loadFile.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.publishRSS = this.publishRSS.bind(this);
    this.postRSS = this.postRSS.bind(this);
    this.convertRSS = this.convertRSS.bind(this);
    this.publishJSON = this.publishJSON.bind(this);
    this.postJSON = this.postJSON.bind(this);
    this.publishWebhook = this.publishWebhook.bind(this);
    this.postWebhook = this.postWebhook.bind(this);
    this.savePublished = this.savePublished.bind(this);
  }



  componentDidMount() {

    getFile('integrations.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ integrations: JSON.parse(fileContents || '{}') });
        } else {
          this.setState({ integrations: [] });
        }
      })

    getFile(loadUserData().username + 'publishedPostscollection.json', {decrypt: false})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ publishedPostCollection: JSON.parse(fileContents || '{}')})
        } else {
          this.setState({ publishedPostCollection: []})
        }
      })

    getFile('singlejournodocid.json', {decrypt: true})
      .then((fileContents) => {
        if(fileContents) {
          this.setState({ userToLoad: JSON.parse(fileContents || '{}')})
        }
      })
      .then(() => {
        this.loadFile();
      })
      .catch(error => {
        console.log(error);
      })

    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );
    const span = document.createElement("span");
    span.className += "ql-formats";
    const button = document.createElement("button");
    button.innerHTML = "&#x1F4AC;";
    button.className += "comment-button";
    span.appendChild(button);
    const element = document.getElementsByClassName("ql-toolbar")[0];
    element.appendChild(span);

    window.$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens
    }
   );
  }

  loadFile() {
    const user = this.state.userToLoad;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    const fullFile = loadUserData().username + 'submitted.json';
    getFile(fullFile, options)
      .then((fileContents) => {
        this.setState({ loading: "hide"})
        let privateKey = loadUserData().appPrivateKey;
        if(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))).length > 0) {
          this.setState({ totalPosts: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))), loading: "hide" })
        } else {
          this.setState({ totalPosts: [], loading: "hide" })
        }
      })
      .then(() => {
        let posts = this.state.totalPosts;
        const thisDoc = posts.find((post) => { return post.id == this.props.match.params.id});
        let index = thisDoc && thisDoc.id;
        function findObjectIndex(post) {
            return post.id == index;
        }
        this.setState({ title: thisDoc && thisDoc.title, id: thisDoc && thisDoc.id, content: thisDoc && thisDoc.content, author: thisDoc && thisDoc.author, index: posts.findIndex(findObjectIndex) })
      })
      .catch(error => {
        console.log(error);
      })
  }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }

    this.attachQuillRefs();
    //TODO work on comment permission here
    document.getElementsByClassName("comment-button")[0].onclick = () => {
       var range = this.quillRef.getSelection();
       var text = this.quillRef.getText(range.index, range.length);
       this.quillRef.format('background', 'yellow');
       this.setState({ highlightedText: text, showCommentModal: "", selection: range });
    };
    window.$('.button-collapse').sideNav({
        menuWidth: 400, // Default is 300
        edge: 'right', // Choose the horizontal origin
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true, // Choose whether you can drag to open on touch screens
      }
    );
  }


  attachQuillRefs = () => {
   if (typeof this.reactQuillRef.getEditor !== 'function') return;
   this.quillRef = this.reactQuillRef.getEditor();
 }
 //
 // insertText = () => {
 //    var range = this.quillRef.getSelection();
 //    var text = this.quillRef.getText(range.index, range.length);
 //    this.setState({ highlightedText: text, showCommentModal: "", selection: range });
 // }
 //
 // cancelComment = () => {
 //   this.quillRef.format('background', 'white');
 //   this.setState({showCommentModal: "hide", commentInput: "" });
 // }

 savePublished() {
   putFile(loadUserData().username + 'publishedPostscollection.json', JSON.stringify(this.state.publishedPostCollection), {encrypt: false})
     .then(() => {
       console.log("Published post added to collection");
       window.Materialize.toast('Published!', 4000);
     })
     .catch(error => {
       console.log(error);
     })
 }

  publishWebhook() {
    this.setState({webhook: false})
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.publishDate = getMonthDayYear();
    object.author = this.state.author;
    object.id = this.state.id;
    object.published = true;
    const objectTwo = {};
    objectTwo.id = this.state.id;
    objectTwo.published = true;
    this.setState({ singlePublicPost: object, publishedPostCollection: [...this.state.publishedPostCollection, objectTwo] })
    setTimeout(this.postWebhook, 300);
  }

  postWebhook() {
    this.setState({ integrationsList: "hide", modalContent: "", publishModal: "hide"});
    let link = this.state.integrationURL;
    axios.post(link, JSON.stringify(this.state.publishedPostCollection))
    .then(function (response) {
      console.log(response);
      window.Materialize.toast("Article published!", 4000);

    })
    .catch(function (error) {
      console.log(error);
    });
    this.savePublished();
  }

  publishJSON() {
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.publishDate = getMonthDayYear();
    object.author = this.state.author;
    object.id = this.state.id;
    object.published = true;
    const objectTwo = {};
    objectTwo.id = this.state.id;
    objectTwo.published = true;
    this.setState({ singlePublicPost: object, publishedPostCollection: [...this.state.publishedPostCollection, objectTwo] })
    setTimeout(this.postJSON, 300);
  }

  postJSON() {
    let file = this.props.match.params.id;
    putFile(file + '.json', JSON.stringify(this.state.publishedPostCollection), {encrypt: false})
      .then(() => {
        console.log(loadUserData())
        this.setState({publishModal: "hide"})
      })
    this.savePublished();
  }

  publishRSS() {
    const object = {};
    object.title = this.state.title;
    object.description = this.state.content;
    object.publishDate = getMonthDayYear();
    object.author = this.state.author;
    object.id = this.state.id;
    object.published = true;
    const objectTwo = {};
    objectTwo.id = this.state.id;
    objectTwo.published = true;
    this.setState({ publishedPostCollection: [...this.state.publishedPostCollection, objectTwo] })
    let XML = toXML({
      _name: 'rss',
      _attrs: {
        version: '2.0'
      },
      _content: {
        channel: [
          {
            title: "Post"
          },
          {
            pubDate: () => new Date()
          },
          {
            language: 'en'},
          {
            item: {
              title: object.title,
              description: object.description,
              pubDate: () => new Date()
            }
          },
          {
            item: {
              title: 'Author',
              description: object.author,
            }
          }
        ]
      }
    });
    console.log(XML);
    this.setState({ singlePublicPost: XML })
    setTimeout(this.convertRSS, 300);

  }

  convertRSS() {
    this.setState({singleRSS: toXML(this.state.singlePublicPost)});
    setTimeout(this.postRSS, 300);
  }

  postRSS() {
    let file = this.props.match.params.id;
    putFile(file + '.xml', toXML(this.state.singlePublicPost), {encrypt: false})
      .then(() => {
        console.log(loadUserData())
        this.setState({publishModal: "hide"})
      })
      .catch(error => {
        console.log(error);
      })

      this.savePublished();
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.handleAutoAdd, 1500)
  }
  handleChange(value) {
      this.setState({ content: value });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.handleAutoAdd, 1500)
    }
  //
  // handleCommentInput(e) {
  //   this.setState({ commentInput: e.target.value });
  // }

  // addComment() {
  //   const today = new Date();
  //   const day = today.getDate();
  //   const month = today.getMonth() + 1;
  //   const year = today.getFullYear();
  //   const object = {};
  //   object.id = Date.now();
  //   object.commenter = loadUserData().username;
  //   object.date = month + '/' + day + '/' + year;
  //   object.selection = this.state.selection;
  //   object.highlightedText = this.state.highlightedText;
  //   object.comment = this.state.commentInput;
  //   this.setState({ comments: [...this.state.comments, object ]});
  //   setTimeout(this.saveComment, 700);
  // }
  //
  // saveComment() {
  //   const file = this.props.match.params.id;
  //   const fullFile = file + 'comments.json';
  //   putFile(fullFile, JSON.stringify(this.state.comments), {encrypt: true})
  //     .then(() => {
  //       this.setState({
  //         showCommentModal: "hide",
  //         commentInput: "",
  //         highlightedText: "",
  //         selection: ""
  //       });
  //       window.Materialize.toast("Comment saved", 3000);
  //     })
  //     .catch(e => {
  //       console.log("e");
  //       console.log(e);
  //     });
  // }
  //
  // getCommentSelection() {
  //   this.quillRef.setSelection(this.state.reviewSelection);
  //   window.$('.button-collapse').sideNav('hide');
  // }
  //
  // resolveComment() {
  //   this.quillRef.setSelection(this.state.reviewSelection);
  //   let value = this.state.comments;
  //   const thisDoc = value.find((doc) => { return doc.id == this.state.commentId});
  //   let index = thisDoc && thisDoc.id;
  //   function findObjectIndex(doc) {
  //       return doc.id == index;
  //   }
  //   this.setState({ deleteIndex: value.findIndex(findObjectIndex) });
  //   this.deleteComment();
  // }
  //
  // deleteComment() {
  //   // var text = this.quillRef.getText(range.index, range.length);
  //   this.quillRef.format('background', 'white');
  //   const updatedComments = update(this.state.comments, {$splice: [[this.state.deleteIndex, 1]]});
  //   this.setState({comments: updatedComments, commentId: "" });
  //   window.$('.button-collapse').sideNav('hide');
  //   setTimeout(this.saveNewCommentsArray, 500);
  // }
  //
  // saveNewCommentsArray() {
  //   const file = this.props.match.params.id;
  //   const fullFile = file + 'comments.json';
  //   putFile(fullFile, JSON.stringify(this.state.comments), {encrypt: true})
  //     .then(() => {
  //       this.setState({
  //         showCommentModal: "hide",
  //         commentInput: "",
  //         highlightedText: "",
  //         selection: ""
  //       });
  //       window.Materialize.toast("Resolved!", 3000);
  //     })
  //     .catch(e => {
  //       console.log("e");
  //       console.log(e);
  //     });
  // }


  print(){
    window.print();
  }

  render() {
    console.log(this.state.integrations);
    SingleJournoDoc.modules = {
      toolbar: [
        //[{ font: Font.whitelist }],
        [{ header: 1 }, { header: 2 }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ align: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['video'],
        ['image'],
        ['link'],
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }
    let words;
    if(this.state.content) {
      words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    } else {
      words = 0;
    }

    const {webhook, integrations, modalContent, integrationsList, publishModal, comments, remoteStorage, loading, save, autoSave, contacts, hideStealthy} = this.state
    webhook === false ? console.log("No integration selected") : this.publishWebhook();
    const remoteStorageActivator = remoteStorage === true ? "" : "hide";
    // var content = "<p style='text-align: center;'>" + this.state.title + "</p> <div style='text-indent: 30px;'>" + this.state.content + "</div>";
    // var htmlString = window.$('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' + content + '</body>').get().outerHTML;

    // var htmlDocument = '<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><xml><word:WordDocument><word:View>Print</word:View><word:Zoom>90</word:Zoom><word:DoNotOptimizeForBrowser/></word:WordDocument></xml></head><body>' + content + '</body></html>';
    // var dataUri = 'data:text/html,' + encodeURIComponent(htmlDocument);

      // const {length} = contacts
      // let users = '&length=' + length
      // let k = 0
      // for (const i of contacts) {
      //   users += '&id' + k + "=" + i.contact
      //   k += 1
      // }
      // // const to = (sharedWith && sharedWith[sharedWith.length - 1] && sharedWith[sharedWith.length - 1].contact) ? sharedWith[sharedWith.length - 1].contact : ''
      // const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
      //   'http://localhost:3030/?app=gd04012018' :
      //   'https://www.stealthy.im/?app=gd04012018';
      // const stealthyUrl = stealthyUrlStub + users;
      //
      // // const stealthyModule = (length > 0) ? (
      // const stealthyModule =  (
      //   <div className={stealthy}>
      //     <div id='stealthyCol' className='card'>
      //     <div className={revealModule}>
      //       <iframe title="Stealthy" src={stealthyUrl} id='stealthyFrame' />
      //     </div>
      //     </div>
      //   </div>
      // )
      // ) : null

      // let docFlex;
      // if(this.state.hideStealthy === true) {
      //   docFlex = "test-doc-card";
      // } else {
      //   docFlex = "test-with-module";
      // }

      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href='/journalism' className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

                <ul className="left toolbar-menu">
                <li className="document-title">{this.state.title.length > 15 ? this.state.title.substring(0,15)+"..." :  this.state.title}</li>
                <li><a className="small-menu muted">{autoSave}</a></li>
                </ul>
                <ul className="right toolbar-menu small-toolbar-menu auto-save">
                <li><a className="dropdown-button" data-activates="dropdown1"><i className="small-menu material-icons">more_vert</i></a></li>
                <li><a className="small-menu tooltipped stealthy-logo" data-position="bottom" data-delay="50" data-tooltip="Stealthy Chat" onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>
                </ul>

                {/*Share Menu Dropdown*/}
                <ul id="dropdown2"className="dropdown-content collection cointainer">
                <li><span className="center-align">Select a contact to share with</span></li>
                <a href="/contacts"><li><span className="muted blue-text center-align">Or add new contact</span></li></a>
                <li className="divider" />
                {contacts.slice(0).reverse().map(contact => {
                    return (
                      <li key={contact.contact}className="collection-item">
                        <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                        <p>{contact.contact}</p>
                        </a>
                      </li>
                    )
                  })
                }
                </ul>
                {/*Share Menu Dropdown*/}

                {/* Dropdown menu content */}
                <ul id="dropdown1" className="dropdown-content single-doc-dropdown-content">
                  <li><a onClick={() => this.setState({ publishModal: ""})}>Publish</a></li>
                  <li><a>Schedule</a></li>
                  <li><a>Send Back</a></li>
                </ul>
              {/* End dropdown menu content */}

              {/*Publish Modal */}
              <div className={publishModal}>
                <div id="modal1" className="project-page-modal modal">
                  <div className="modal-content black-text">
                  <a onClick={() => this.setState({publishModal: "hide"})} className="btn-floating modalClose grey"><i className="publish-modal-close material-icons">close</i></a>
                    <div className={modalContent}>
                      <h4>Choose Publication Method</h4>
                      <div className="center-align container row">
                        <p className="col s4"><a onClick={() => this.setState({ integrationsList: "", modalContent: "hide"})} className="black-text"><img className="destination" alt="img" src="http://sflanders.net/wp-content/uploads/2016/11/webhook-512.png"/><br/>Webhooks</a></p>
                        <p className="col s4"><a className="black-text" onClick={this.publishRSS}><img className="destination" alt="img" src="https://www.freeiconspng.com/uploads/rss-logo-icon-png-19.png"/><br/>RSS</a></p>
                        <p className="col s4"><a className="black-text" onClick={this.publishJSON}><img className="destination" alt="img" src="http://debugonweb.com/wp-content/uploads/2017/10/logo-json.png"/><br/>JSON</a></p>
                      </div>
                    </div>
                    <div className={integrationsList}>
                    <h5>Select your destination</h5>
                    <div className="integrations-div">
                      <ul className="collection integrations-collection">
                      {integrations.slice(0).reverse().map(int => {
                          return (
                            <li key={int.id}>
                            <a className="black-text" onClick={() => this.setState({ integrationURL: int.url, webhook: true})}>{int.name}</a>
                            </li>
                          )
                        })
                      }
                      </ul>
                    </div>
                      <div>
                        <button onClick={() => this.setState({integrationsList: "hide", modalContent: ""})}className="btn-flat">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/*End Publish Modal */}

              {/*Show Comments Modal*/}
              <ul id="slide-out" className="comments-side-nav side-nav">
                {comments.slice(0).reverse().map(comment => {
                    return (
                      <li key={comment.id}>
                        <p className="black-text commenter">From {comment.commenter}</p>
                        <p className="black-text highlightedComment">{comment.highlightedText}</p>
                        <p className="black-text comment">{comment.comment}</p>
                        <button onClick={() => this.setState({ reviewSelection: comment.selection })} className="black-text btn-flat">Review</button>
                        <button onClick={() => this.setState({ reviewSelection: comment.selection, commentId: comment.id })} className="btn-flat">Resolve</button>
                        <p className="divider"></p>
                      </li>
                    )
                  })
                }
              </ul>
              {/*End Show Comments Modal*/}

              {/*Add Comment Modal*/}
              {/*<div className={showCommentModal}>
                <div id="modal1" className="modal">
                  <div className="">
                    <div className="modal-content">
                      <blockquote className="black-text">
                        {this.state.highlightedText}
                      </blockquote>
                      <h5 className="black-text">Add Comment</h5>

                        <textarea defaultValue={this.state.commentInput} onChange={this.handleCommentInput} className="materialize-textarea black-text" placeholder="Your comment"/>

                    </div>
                    <div className="modal-footer">
                      <a onClick={this.addComment} className="btn-flat modal-action">Save Comment</a>
                      <a onClick={this.cancelComment} className="modal-action grey-text btn-flat">Cancel</a>
                    </div>
                  </div>
                </div>
              </div>*/}
              {/*End Add Comment Modal*/}
            </div>
          </nav>
        </div>
        {/*Remote storae widget*/}
          <div className={remoteStorageActivator} id="remotestorage">
            <div id='remote-storage-element-id'></div>
          </div>
          {/*Remote storae widget*/}
          <div className="test-docs">
            <div className='test-doc-card'>
              <div className="double-space doc-margin">

                {this.state.title === "Untitled" ? <textarea className="doc-title materialize-textarea" placeholder="Give it a title" type="text" onChange={this.handleTitleChange} /> : <textarea className="doc-title materialize-textarea" placeholder="Title" type="text" value={this.state.title} onChange={this.handleTitleChange} />}


                  <ReactQuill
                    ref={(el) => { this.reactQuillRef = el }}
                    modules={SingleJournoDoc.modules}
                    id="textarea1"
                    className="materialize-textarea"
                    placeholder="Write something great"
                    value={this.state.content}
                    onChange={this.handleChange}
                    theme="bubble" />


              <div className="right-align wordcounter">
                <p className="wordcount">{words} words</p>
              </div>
              <div className={save}>
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
              {/*stealthyModule*/}
            </div>
          </div>
          </div>
      );
  }
}
