import React, { Component } from 'react';
import {
isSignInPending,
loadUserData,
Person,
getFile,
putFile,
lookupProfile,
signUserOut,
} from 'blockstack';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link } from 'react-router-dom';
import Dropzone from 'react-dropzone'
import PDF from 'react-pdf-js';
import { Player } from 'video-react';
import XLSX from 'xlsx';
const Quill = ReactQuill.Quill;
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
const mammoth = require("mammoth");
const str2ab = require('string-to-arraybuffer')

export default class SingleVaultFile extends Component {
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
      files: [],
      grid: [[]],
      value: [],
      name: "",
      link: "",
      lastModified: "",
      lastModifiedDate: "",
      size: "",
      type: "",
      index: "",
      pages: "",
      page: "",
      content: "",
      hideButton: "",
      loading: "hide"
  	};
    this.saveNewFile = this.saveNewFile.bind(this);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.downloadPDF = this.downloadPDF.bind(this);
    this.handleaddItem = this.handleaddItem.bind(this);
    this.handleaddTwo = this.handleaddTwo.bind(this);
  }

  componentDidMount() {
    getFile(this.props.match.params.id + '.json', {decrypt: true})
      .then((file) => {
        console.log(JSON.parse(file || '{}'));
        this.setState({name: JSON.parse(file || '{}').name, lastModifiedDate: JSON.parse(file || '{}').lastModifiedDate, size: JSON.parse(file || '{}').size, link: JSON.parse(file || '{}').link, type: JSON.parse(file || '{}').type})
        if(this.state.type.includes("officedocument")) {
          var abuf4 = str2ab(this.state.link)
            mammoth.convertToHtml({arrayBuffer: abuf4})
            .then((result) => {
                var html = result.value; // The generated HTML
                var messages = result.messages;
                this.setState({content: html});
                console.log(this.state.content);
            })
            .done();
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages });
  }

  onPageComplete(page) {
    this.setState({ page });
  }

  handlePrevious() {
    this.setState({ page: this.state.page - 1 });
  }

  handleNext() {
    this.setState({ page: this.state.page + 1 });
  }

  downloadPDF() {

    var dlnk = document.getElementById('dwnldLnk');
    dlnk.href = this.state.link;

    dlnk.click();

}

  handleaddItem() {
    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         this.setState({ value: JSON.parse(fileContents || '{}').value });
       } else {
         console.log("No docs");
       }
     })
     .then(() => {
       this.handleaddTwo();
     })
      .catch(error => {
        console.log(error);
      });
  }

handleaddTwo() {
  this.setState({ show: "hide" });
  this.setState({ hideButton: "hide", loading: "" })
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const rando = Date.now();
  const object = {};
  object.title = this.state.name;
  object.content = this.state.content;
  object.id = rando;
  object.created = month + "/" + day + "/" + year;

  this.setState({ value: [...this.state.value, object] });
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
      console.log("e");
      console.log(e);
      alert(e.message);
    });
}

  renderPagination(page, pages) {
    let previousButton = <li className="previous" onClick={this.handlePrevious}><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    if (page === 1) {
      previousButton = <li className="previous disabled"><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    }
    let nextButton = <li className="next" onClick={this.handleNext}><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    if (page === pages) {
      nextButton = <li className="next disabled"><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    }
    return (
      <nav>
        <ul className="pager">
          {previousButton}
          {nextButton}
        </ul>
      </nav>
      );
  }

  render() {
    var thisStyle = {
      display: "none"
    };
    const type = this.state.type;
    const { handleSignOut } = this.props;
    const { person } = this.state;
    const loading = this.state.loading;
    const hideButton = this.state.hideButton;
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    return (
      !isSignInPending() ?
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/vault" className="brand-logo"><i className="material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><a>{this.state.name.toUpperCase()}</a></li>
                {
                  type.includes("image") ? <li><a href={this.state.link} download={this.state.name}><i className="material-icons">cloud_download</i></a></li> :
                  type.includes("pdf") ? <li><a href="#" onClick={this.downloadPDF} title={this.state.name}><i className="material-icons">cloud_download</i></a></li> :
                  type.includes("officedocument") ? <li><a href="#" onClick={this.downloadPDF} title={this.state.name}><i className="material-icons">cloud_download</i></a></li> :
                  type.includes("excel") ? <li><a href="#" onClick={this.downloadPDF} title={this.state.name}><i className="material-icons">cloud_download</i></a></li> :
                  <li></li>
                }
                <li><a><i className="material-icons">share</i></a></li>
              </ul>

          </div>
        </nav>
      </div>
      <div className="file-view">
      <div className="center-align container">
        <div>
        {
          type.includes("image") ? <div className="single-file-div"><img className="z-depth-4 responsive-img" src={this.state.link} alt={this.state.name} /></div> :
          type.includes("pdf") ?
            <div className="single-file-div">
              <PDF
                file={this.state.link}
                onDocumentComplete={this.onDocumentComplete}
                onPageComplete={this.onPageComplete}
                page={this.state.page}
              />
            {pagination}
            <a id='dwnldLnk' download={this.state.name} style={thisStyle} />
            </div> :
          type.includes("officedocument") ?
          <div className="left-align">
          <div className={hideButton}>
            <button onClick={this.handleaddItem} className="btn black center-align">Edit in Documents</button>
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
            <div className="card single-file-doc">
              <div
                className="print-view no-edit"
                dangerouslySetInnerHTML={{ __html: this.state.content }}
              />
            </div>
            <a id='dwnldLnk' download={this.state.name} style={thisStyle} />
          </div> :
          type.includes("video") ?
            <div className="single-file-div">
              <Player
                playsInline
                src={this.state.link}
              />
            </div> :
          type.includes("excel") ?
            <div>
              <img className="icon-image" src="https://image.flaticon.com/icons/svg/1/1396.svg" alt="excel file" />
              <a id='dwnldLnk' download={this.state.name} style={thisStyle} />
            </div> :
          <div />
        }
        </div>
        </div>
      </div>
      </div>
       : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }
}
