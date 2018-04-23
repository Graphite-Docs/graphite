import React, { Component } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  loadUserData,
  getFile,
  putFile
} from 'blockstack';
import update from 'immutability-helper';
const wordcount = require("wordcount");
const Font = ReactQuill.Quill.import('formats/font');
const { encryptECIES } = require('blockstack/lib/encryption');
Font.whitelist = ['Ubuntu', 'Raleway', 'Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);

export default class SingleDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: [],
      value: [],
      contacts: [],
      title : "",
      content:"",
      updated: "",
      words: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      shareFile: [],
      show: "",
      pubKey: "",
      singleDoc: {},
      confirmAdd: false,
      singlePublic: {},
      publicShare: "hide",
      gaiaLink: "",
      hideStealthy: true,
      hideContact: "",
      revealModule: "innerStealthy",
      to: "",
      blogPost: {},
      blogIndex: [],
      blogModal: "hide",
      docFlex: "card doc-card"
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleAutoAdd = this.handleAutoAdd.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.shareDoc = this.shareDoc.bind(this);
    this.sharedInfo = this.sharedInfo.bind(this);
    this.handleBack = this.handleBack.bind(this); //this is here to resolve auto-save and home button conflicts
    this.sharePublicly = this.sharePublicly.bind(this);
    this.savePublic = this.savePublic.bind(this);
    this.stopSharing = this.stopSharing.bind(this);
    this.saveStop = this.saveStop.bind(this);
    this.postBlog = this.postBlog.bind(this);
    this.saveBlogIndex = this.saveBlogIndex.bind(this);
    this.saveBlogPost = this.saveBlogPost.bind(this);
  }



  componentDidMount() {

    // const options = { username: "jehunter5811.id", zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    //   getFile("blogteam.json", options)
    //    .then((fileContents) => {
    //      if(JSON.parse(fileContents || '{}').length > 0) {
    //        this.setState({ team: JSON.parse(fileContents || '{}') });
    //      } else {
    //        this.setState({ team: []});
    //      }
    //    })
    //     .catch(error => {
    //       console.log(error);
    //     });

    // let file = 'blogposts/index.json';
    // getFile(file, {decrypt: false})
    //  .then((fileContents) => {
    //    let indexFile = JSON.parse(fileContents || '{}');
    //    if(indexFile.length > 0) {
    //      this.setState({ blogIndex: JSON.parse(fileContents || '{}') });
    //    } else {
    //      this.setState({ blogIndex: [] });
    //    }
    //  })
    //   .catch(error => {
    //     console.log(error);
    //   });
    getFile("contact.json", {decrypt: true})
     .then((fileContents) => {
       let file = JSON.parse(fileContents || '{}');
       let contacts = file.contacts;
       if(contacts.length > 0) {
         this.setState({ contacts: JSON.parse(fileContents || '{}').contacts });
       } else {
         this.setState({ contacts: [] });
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile(this.props.match.params.id + 'sharedwith.json', {decrypt: true})
       .then((fileContents) => {
          this.setState({ sharedWith: JSON.parse(fileContents || '{}') })
       })
        .catch(error => {
          console.log("shared with doc error: ")
          console.log(error);
        });

      getFile("documentscollection.json", {decrypt: true})
       .then((fileContents) => {
          this.setState({ value: JSON.parse(fileContents || '{}').value })
          let value = this.state.value;
          const thisDoc = value.find((doc) => { return doc.id == this.props.match.params.id});
          let index = thisDoc && thisDoc.id;
          console.log(index);
          function findObjectIndex(doc) {
              return doc.id == index;
          }
          this.setState({index: value.findIndex(findObjectIndex)})
       })
        .catch(error => {
          console.log(error);
        });

    const thisFile = this.props.match.params.id;
    const fullFile = '/documents/' + thisFile + '.json';
    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       console.log(fileContents);
        this.setState({
          title: JSON.parse(fileContents || '{}').title,
          content: JSON.parse(fileContents || '{}').content
       })
     })
      .catch(error => {
        console.log(error);
      });
      this.printPreview = () => {
        if(this.state.printPreview == true) {
          this.setState({printPreview: false});
        } else {
          this.setState({printPreview: true});
        }
      }
    }

  componentDidUpdate() {
    if(this.state.confirmAdd === true) {
      this.sharedInfo();
    }
  }

//Pick up blog work here

  postBlog() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.words = wordcount(this.state.content);
    object.posted = month + "/" + day + "/" + year;
    object.author = loadUserData().username;
    this.setState({ blogPost: object });
    setTimeout(this.saveBlogPost, 500);
  }

  saveBlogPost() {
    const params = this.props.match.params.id;
    let file = params + '/' + this.state.title.replace(/\s+/g, '-').toLowerCase();
    putFile(file + '.json', JSON.stringify(this.state.blogPost), {encrypt: false})
      .then(() => {
        this.saveBlogIndex();
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  saveBlogIndex() {
    let file = 'blogposts/index.json';
    putFile(file, JSON.stringify(this.state.blogIndex), {encrypt: false})
      .then(() => {
        console.log("done saving blog");
        this.setState({ blogModal: "hide" });
        window.Materialize.toast('Document posted!', 4000)
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
  }

  sharePublicly() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.words = wordcount(this.state.content);
    object.shared = month + "/" + day + "/" + year;
    this.setState({singlePublic: object})
    setTimeout(this.savePublic, 700);

  }

  stopSharing() {
    this.setState({ singlePublic: {}})
    setTimeout(this.saveStop, 700);
  }

  saveStop() {
    const user = loadUserData().username;
    const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + userShort + params + '.json'
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
      .then(() => {
        window.Materialize.toast(this.state.title + " is no longer publicly shared.", 4000);
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  savePublic() {
    var gaiaLink;
    const profile = loadUserData().profile;
    const apps = profile.apps;
    gaiaLink = apps["https://app.graphitedocs.com"];
    console.log("Shared: ")
    const user = loadUserData().username;
    const userShort = user.slice(0, -3);
    const params = this.props.match.params.id;
    const directory = 'public/';
    const file = directory + userShort + params + '.json'
    putFile(file, JSON.stringify(this.state.singlePublic), {encrypt: false})
      .then(() => {
        console.log("Shared Public Link")
        this.setState({gaiaLink: gaiaLink + file, publicShare: "", shareModal: "hide"});
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  copyLink() {
    var copyText = document.getElementById("gaia");
    copyText.select();
    document.execCommand("Copy");
    window.Materialize.toast("Link copied to clipboard", 1000);
  }

  sharedInfo(){
    this.setState({ confirmAdd: false });
    const user = this.state.receiverID;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}

    getFile('key.json', options)
      .then((file) => {
        this.setState({ pubKey: JSON.parse(file)})
        console.log("Step One: PubKey Loaded");
      })
        .then(() => {
          this.loadMyFile();
        })
        .catch(error => {
          console.log("No key: " + error);
          window.Materialize.toast(this.state.receiverID + " has not logged into Graphite yet. Ask them to log in before you share.", 4000);
          this.setState({ shareModal: "hide", loading: "hide", show: "" });
        });
  }

  loadMyFile() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;

    getFile(file, {decrypt: true})
     .then((fileContents) => {
        this.setState({ shareFile: JSON.parse(fileContents || '{}') })
        console.log("Step Two: Loaded share file");
        this.setState({ loading: "", show: "hide" });
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const object = {};
        object.title = this.state.title;
        object.content = this.state.content;
        object.id = Date.now();
        object.receiverID = this.state.receiverID;
        object.words = wordcount(this.state.content);
        object.shared = month + "/" + day + "/" + year;
        const objectTwo = {};
        objectTwo.contact = this.state.receiverID;
        this.setState({ shareFile: [...this.state.shareFile, object], sharedWith: [...this.state.sharedWith, objectTwo] });
        setTimeout(this.shareDoc, 700);
     })
      .catch(error => {
        console.log(error);
        console.log("Step Two: No share file yet, moving on");
        this.setState({ loading: "", show: "hide" });
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const object = {};
        object.title = this.state.title;
        object.content = this.state.content;
        object.id = Date.now();
        object.receiverID = this.state.receiverID;
        object.words = wordcount(this.state.content);
        object.shared = month + "/" + day + "/" + year;
        this.setState({ shareFile: [...this.state.shareFile, object] });
        setTimeout(this.shareDoc, 700);
      });
  }

  shareDoc() {
    const user = this.state.receiverID;
    const userShort = user.slice(0, -3);
    const fileName = 'shareddocs.json'
    const file = userShort + fileName;
    putFile(file, JSON.stringify(this.state.shareFile), {encrypt: true})
      .then(() => {
        console.log("Step Three: File Shared: " + file);
        this.setState({ shareModal: "hide", loading: "hide", show: "" });
      })
      .catch(e => {
        console.log("e");
        console.log(e);
      });
      const publicKey = this.state.pubKey;
      const data = this.state.shareFile;
      const encryptedData = JSON.stringify(encryptECIES(publicKey, JSON.stringify(data)));
      const directory = '/shared/' + file;
      putFile(directory, encryptedData, {encrypt: false})
        .then(() => {
          console.log("Shared encrypted file " + directory);
          window.Materialize.toast('Document shared with ' + this.state.receiverID, 4000);
        })
        .catch(e => {
          console.log(e);
        });
      putFile(this.props.match.params.id + 'sharedwith.json', JSON.stringify(this.state.sharedWith), {encrypt: true})
        .then(() => {
          console.log("Shared With File Updated")
        })
        .catch(e => {
          console.log(e);
        });
  }

  shareModal() {
    this.setState({
      shareModal: ""
    });
  }

  hideModal() {
    this.setState({
      shareModal: "hide",
      blogModal: "hide"
    });
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

  handleIDChange(e) {
      this.setState({ receiverID: e.target.value })
    }

  handleBack() {
    if(this.state.autoSave === "Saving") {
      setTimeout(this.handleBack, 500);
    } else {
      window.location.replace("/documents");
    }
  }

  handleAutoAdd() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const object = {};
    object.title = this.state.title;
    object.content = this.state.content;
    object.id = parseInt(this.props.match.params.id, 10);
    object.updated = month + "/" + day + "/" + year;
    object.words = wordcount(this.state.content);
    this.setState({singleDoc: object});
    this.setState({autoSave: "Saving..."});
    const objectTwo = {};
    objectTwo.title = this.state.title;
    objectTwo.contacts = this.state.sharedWith;
    objectTwo.id = parseInt(this.props.match.params.id, 10);
    objectTwo.updated = month + "/" + day + "/" + year;
    objectTwo.words = wordcount(this.state.content);
    const index = this.state.index;
    const updatedDoc = update(this.state.value, {$splice: [[index, 1, objectTwo]]});
    this.setState({value: updatedDoc});
    this.autoSave();
    console.log("after save")
    console.log(this.state.value);
  };

  autoSave() {
    const file = this.props.match.params.id;
    const fullFile = '/documents/' + file + '.json';
    putFile(fullFile, JSON.stringify(this.state.singleDoc), {encrypt: true})
      .then(() => {
        console.log("Autosaved");
        this.saveCollection();
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  saveCollection() {
    putFile("documentscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        this.setState({autoSave: "Saved"});
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });

  }


  print(){
    const curURL = window.location.href;
    window.replaceState(window.state, '', '/');
    window.print();
    window.replaceState(window.state, '', curURL);
  }

  renderView() {

    SingleDoc.modules = {
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
    SingleDoc.formats = [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image', 'video'
    ]
    const user = loadUserData().username;
    const words = wordcount(this.state.content.replace(/<(?:.|\n)*?>/gm, ''));
    const {blogModal, loading, save, autoSave, shareModal, publicShare, show, contacts, hideStealthy, revealModule} = this.state
    const stealthy = (hideStealthy) ? "hide" : ""
    let blogTags = [
      "Technology",
      "Computers",
      "Decentralization",
      "Art"
    ]
    var content = "<p style='text-align: center;'>" + this.state.title + "</p>" + "<div style='text-indent: 30px;'>" + this.state.content + "</div>";
    var htmlString = window.$('<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">').html('<body>' +

    content +

    '</body>'

    ).get().outerHTML;

    var htmlDocument = '<html xmlns:office="urn:schemas-microsoft-com:office:office" xmlns:word="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><xml><word:WordDocument><word:View>Print</word:View><word:Zoom>90</word:Zoom><word:DoNotOptimizeForBrowser/></word:WordDocument></xml></head><body>' + content + '</body></html>';
    var dataUri = 'data:text/html,' + encodeURIComponent(htmlDocument);

    if(this.state.printPreview === true) {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleBack} className="arrow-back left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a className="small-menu" onClick={this.printPreview}>Back to Editing</a></li>
                  <li><a onClick={this.print}><i className="material-icons">local_printshop</i></a></li>
                  <li><a download={this.state.title + ".doc"}  href={dataUri}><img className="wordlogo" src="https://png.icons8.com/metro/540//doc.png" alt="download" /></a></li>
                  <li><a onClick={this.shareModal}><i className="material-icons">share</i></a></li>
                  {/* TODO fix hard-coded username
                  {loadUserData().username === "jehunter5811.id" ? <li><a onClick={() => this.setState({ blogModal: "" })}>Blog</a></li> : <li />}
                  */}
                </ul>

            </div>
          </nav>
        </div>

        <div className={publicShare}>
        <div id="modal1" className="modal bottom-sheet">
          <div className="modal-content">

            <div className={show}>

              <button onClick={() => this.setState({ publicShare: "hide" })} className="btn grey">Done</button>
            </div>
            <div className={show}>
              <div className="container">
                <h4 className="contacts-share center-align">Public Link</h4>
                <p>Ask the person you are sharing with to visit <a href="https://app.graphitedocs.com/publicdoc" target="_blank" rel="noopener">https://app.graphitedocs.com/publicdoc</a> and provide this link to them: </p>
                <p><input type="text" value={this.state.gaiaLink} id="gaia" /><button className="btn" onClick={this.copyLink}>Copy Link</button></p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Share modal */}
        <div className={shareModal}>
          <div id="modal1" className="modal bottom-sheet">
            <div className="modal-content">
              <h4>Share</h4>
              <p>Select the person to share with or <a onClick={this.sharePublicly}>share publicly</a>*</p>
              <p><span className="note"><a onClick={() => window.Materialize.toast('Public files are not encrypted but will be available to anyone with the share link, even if they are not on Blockstack', 4000)}>*Learn more</a></span></p>
              <div className={show}>
                <button className="btn" onClick={this.stopSharing}>Stop Sharing Publicly</button>
                <button onClick={this.hideModal} className="btn grey">Cancel</button>
              </div>
              <div className={show}>
                <div className="container">
                  <h4 className="contacts-share center-align">Your Contacts</h4>
                  <ul className="collection cointainer">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item avatar">
                          <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                          <p><img src={contact.img} alt="avatar" className="circle" /></p>
                          <span className="title black-text">{contact.contact}</span>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
              </div>
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

          {/* End share modal */}

          {/* Blog Modal */}
          <div className={blogModal}>
            <div id="modal1" className="modal">
              <div className="modal-content">
                <h4>Post Blog</h4>
                <p>You are a user on your team's blog, so you can post this document to your team's public-facing blog.</p>
              </div>
              <div className="modal-footer">
                <a onClick={this.postBlog} className="modal-action modal-close waves-effect waves-green btn-flat">Post</a>
                <a onClick={() => this.setState({blogModal: "hide"})} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* Blog Modal */}

        <div className="container docs">
          <div className="card doc-card">
            <div className="double-space doc-margin">
              <p className="center-align print-view">
              {this.state.title}
              </p>
              <div>
                <div
                  className="print-view no-edit"
                  dangerouslySetInnerHTML={{ __html: this.state.content }}
                />
              </div>
              </div>
              </div>
        </div>

        </div>
      );
    } else {

      const {contacts} = this.state
      const {length} = contacts
      let users = '&length=' + length
      let k = 0
      for (const i of contacts) {
        users += '&id' + k + "=" + i.contact
        k += 1
      }
      // const to = (sharedWith && sharedWith[sharedWith.length - 1] && sharedWith[sharedWith.length - 1].contact) ? sharedWith[sharedWith.length - 1].contact : ''
      const stealthyUrlStub = (process.env.NODE_ENV !== 'production') ?
        'http://localhost:3030/?app=gd04012018' :
        'https://www.stealthy.im/?app=gd04012018';
      const stealthyUrl = stealthyUrlStub + users;

      // const stealthyModule = (length > 0) ? (
      const stealthyModule =  (<div className={stealthy}>
          <div id='stealthyCol' className='card'>
          <div className={revealModule}>
            <iframe title="Stealthy" src={stealthyUrl} id='stealthyFrame' />
          </div>
        </div>
        </div>
      )
      // ) : null

      let docFlex;
      if(this.state.hideStealthy === true) {
        docFlex = "card doc-card";
      } else {
        docFlex = "card with-module";
      }

      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a onClick={this.handleBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

                <ul className="left toolbar-menu">
                <li><input className="print-title small-menu" placeholder="Title" type="text" value={this.state.title} onChange={this.handleTitleChange} /></li>
                <li><a className="small-menu" onClick={this.printPreview}>Options</a></li>
                </ul>
                <ul className="right toolbar-menu small-toolbar-menu auto-save">
                <li><a className="small-menu stealthy-logo"  onClick={() => this.setState({hideStealthy: !hideStealthy})}><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>
                <li><a className="small-menu muted">{autoSave}</a></li>
                </ul>

            </div>
          </nav>
        </div>
          <div className="container docs">
            <div className={docFlex}>
              <div className="double-space doc-margin">
              <h4 className="align-left">
              </h4>
              <ReactQuill
                modules={SingleDoc.modules}
                formats={SingleDoc.formats}
                id="textarea1"
                className="materialize-textarea"
                placeholder="Write something great"
                value={this.state.content}
                onChange={this.handleChange} />

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
              {stealthyModule}
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
