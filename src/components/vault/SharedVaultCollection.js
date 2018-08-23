import React, { Component } from "react";
import { Link } from 'react-router-dom';

export default class SharedVaultCollection extends Component {

  componentDidMount() {
    this.props.loadSharedVault()
  }


  render() {
    console.log(window.location.href.split('shared/')[1]);
    let files = this.props.shareFileIndex;
      return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/shared-vault" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                  <ul className="left toolbar-menu">
                    <li><a>Files shared by {this.props.user}</a></li>
                  </ul>

              </div>
            </nav>
          </div>
          <div className="container docs">
          <div className="container">
            <h3 className="center-align">Files {this.props.user} shared with you</h3>

            <table className="bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Shared By</th>
                  <th>Date Shared</th>
                </tr>
              </thead>
              <tbody>
            {
              files.slice(0).reverse().map(file => {

              return(
                <tr key={file.id}>
                  <td><Link to={'/vault/single/shared/' + file.id}>{file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name}</Link></td>
                  <td>{this.props.user}</td>
                  <td>{file.uploaded}</td>
                </tr>
              );
              })
            }
            </tbody>
          </table>


          </div>
          </div>
        </div>
      );
  }
}
