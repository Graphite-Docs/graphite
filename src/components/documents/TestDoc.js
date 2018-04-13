import React, { Component } from "react";
import {
  getFile,
  putFile,
  lookupProfile,
} from 'blockstack';

export default class TestDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {
        title: "heyo",
        content: "yep"
      }
    }
    this.saveFile = this.saveFile.bind(this);
    this.loadFile = this.loadFile.bind(this);
  }

  saveFile() {
    putFile('subdomaintest.json', JSON.stringify(this.state.file), {encrypt: false})
    .then(() => {
        console.log("Saved!");
      })
      .catch(e => {
        console.log(e);
      });
  }

  loadFile() {
    const options = { username: "justin.personal.id", zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false};
    getFile("subdomaintest.json", options)
     .then((fileContents) => {
       console.log(JSON.parse(fileContents || '{}'));
     })
      .catch(error => {
        console.log(error);
      });
      lookupProfile("justin.personal.id", "https://core.blockstack.org/v1/names")
        .then((profile) => {

            console.log(profile);
        })
        .catch((error) => {
          console.log('could not resolve profile')
          window.Materialize.toast("That ID was not found. Please make sure you are typing the full ID.", 3000);
        })
  }

  render() {

    return (
      <div>
        <button onClick={this.saveFile}>Save</button>
        <button onClick={this.loadFile}>Load</button>
      </div>
    );
  }
}
