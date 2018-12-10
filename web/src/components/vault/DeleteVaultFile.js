import React, { Component } from 'react';
import {
isSignInPending,
} from 'blockstack';

export default class DeleteVaultFile extends Component {

  componentDidMount() {
    this.props.initialDeleteLoad();
  }

  render() {
    const loading = this.props.loading;
    const save = this.props.save;
    return (
      !isSignInPending() ?
      <div>
        <div className="container docs">
          <div className="card doc-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete File
            </h5>
            <h6>Are you sure you want to delete <strong>{this.props.name}</strong>?
            </h6>
            <div className={save}>
            <button className="btn red" onClick={this.props.handleDeleteVaultItem}>
              Delete
            </button>
            <a href="/vault"><button className="btn grey">
              No, go back
            </button></a>
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
        </div>

      </div>
       : null
    );
  }
}
