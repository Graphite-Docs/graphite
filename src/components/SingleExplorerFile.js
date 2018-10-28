import React, { Component } from "react";
import {
  getFile,
  loadUserData
} from 'blockstack';
import ReactJson from 'react-json-view'


export default class SingleExplorerFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {}
    }
  }

  componentDidMount() {
    getFile(window.location.href.split('explorer/')[1], {decrypt: true})
      .then((fileContents) => {
        this.setState({file: JSON.parse(fileContents)})
      })
  }

  render(){
    const {file} = this.state;
    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/explorer" className="left brand-logo"><i className="material-icons">arrow_back</i></a>
            <ul className="left toolbar-menu">

              <li><a href="/explorer">Back to Explorer</a></li>
            </ul>
          </div>
        </nav>
      </div>
        <div className="docs container">
          <h5>Your file</h5>
          <p>See the file in your storage hub <a target="_blank" href={loadUserData().profile.apps[window.location.origin] + window.location.href.split('explorer/')[1]}>here</a></p>

          <ReactJson src={file} />
        </div>
      </div>
    )
  }
}
