import React, { Component } from "react";
import Header from './Header';
import {
  getFile,
} from 'blockstack';
var o = 0;
// eslint-disable-next-line

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Export extends Component {
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
      sheets: [],
      value: [],
      sheetsHere: false,
      docsHere: false,
      allData: []
    }

  }

  componentDidMount() {

  }


  compileDocs = () => {
    var i;
    for (i = 0; i < this.props.value.length; i++) {
      getFile('/documents/' + this.props.value[i].id + '.json')
        .then((fileContents) => {
          this.setState({ allData: [...this.state.allData, JSON.parse(fileContents)]})
          //eslint-disable-next-line
        }).then(() => {
          o++;
          //eslint-disable-next-line
        }).then(() => {
          if(o === this.props.value.length) {
            console.log("Bingo")
            console.log(this.state.allData);
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.allData));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href",     dataStr);
            downloadAnchorNode.setAttribute("download", "GraphiteDocs.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            this.setState({ allData: [] });
          }
        })
    }
  }

  compileSheets = () => {
    var i;

    for (i = 0; i < this.props.sheets.length; i++) {
      getFile('/sheets/' + this.props.sheets[i].id + '.json')
        .then((fileContents) => {
          this.setState({ allData: [...this.state.allData, JSON.parse(fileContents)]})
          //eslint-disable-next-line
        }).then(() => {
          o++;
          //eslint-disable-next-line
        }).then(() => {
          if(o === this.props.sheets.length) {
            console.log("Bingo")
            console.log(this.state.allData);
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.allData));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href",     dataStr);
            downloadAnchorNode.setAttribute("download", "GraphiteSheets.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            this.setState({ allData: [] });
          }
        })
    }
  }

  compileFiles = () => {
    var i;

    for (i = 0; i < this.props.files.length; i++) {
      getFile(this.props.files[i].id + '.json')
        .then((fileContents) => {
          this.setState({ allData: [...this.state.allData, JSON.parse(fileContents)]})
          //eslint-disable-next-line
        }).then(() => {
          //eslint-disable-next-line
          o++;
          //eslint-disable-next-line
        }).then(() => {
          if(o === this.props.files.length) {
            console.log("Bingo")
            console.log(this.state.allData);
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.allData));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href",     dataStr);
            downloadAnchorNode.setAttribute("download", "GraphiteVault.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            this.setState({ allData: [] });
          }
        })
    }
  }

  compileContacts = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.props.contacts));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "GraphiteContacts.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


  render() {
    return (
      <div>
        <Header />
        <div className="container exports">
        <div className="row">
          <div className="center-align">
            <h3>Download all your files as JSON</h3>
            <h5>Easily import into other systems or keep a backup on your computer</h5>
          </div>
          <div className="col s6 center-align">
            <a className="black-text" onClick={this.compileDocs}><div id="doccontainer" className="card export-card hoverable">
              <h5>Download Documents</h5>
            </div></a>
          </div>
          <div className="col s6 center-align">
            <a className="black-text" onClick={this.compileSheets}><div id="sheetcontainer" className="card export-card hoverable">
              <h5>Download Sheets</h5>
            </div></a>
          </div>
          <div className="col s6 center-align">
            <a className="black-text" onClick={this.compileFiles}><div id="sheetcontainer" className="card export-card hoverable">
              <h5>Download Files</h5>
            </div></a>
          </div>
          <div className="col s6 center-align">
            <a className="black-text" onClick={this.compileContacts}><div id="sheetcontainer" className="card export-card hoverable">
              <h5>Download Contacts</h5>
            </div></a>
          </div>
        </div>
        </div>
      </div>
    )
  }
}
