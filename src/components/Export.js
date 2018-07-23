import React, { Component } from "react";
import Header from './Header';
import {
  getFile,
} from 'blockstack';
import $ from 'jquery';

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
      docsHere: false
    }

  }

  componentDidMount() {
    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
       if(fileContents) {
         console.log("Files are here");
         this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
         this.setState({ sheetsHere: true });
       } else {
         console.log("Nothing to see here");
         // this.setState({ value: {} });
         // this.setState({ filteredValue: {} })
         // console.log(this.state.value);
         this.setState({ loading: "hide" });
       }
     })
      .catch(error => {
        console.log(error);
      });

      getFile("documents.json", {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           console.log("Files are here");
           this.setState({ value: JSON.parse(fileContents || '{}').value });
           this.setState({ docsHere: true });
         } else {
           console.log("No saved files");
         }
       })
        .catch(error => {
          console.log(error);
        });
  }





  render() {
    const docs = this.state.value;
    var dataDocs = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(docs));
    $('<a href="data:' + dataDocs + '" download="docsdownload.json">Download Docs</a>').appendTo('#doccontainer');
    var dataSheets = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.sheets));
    $('<a href="data:' + dataSheets + '" download="sheetsdownload.json">Download Sheets</a>').appendTo('#sheetcontainer');

    console.log(this.state.sheets);
    return (
      <div>
        <Header />
        <div className="container exports">
        <div className="row">
          <div className="col s6 center-align">
            <div id="doccontainer" className="card export-card hoverable">

            </div>
          </div>
          <div className="col s6 center-align">
            <div id="sheetcontainer" className="card export-card hoverable">

            </div>
          </div>
        </div>
        </div>
      </div>
    )
  }
}
