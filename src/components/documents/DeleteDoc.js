import React, { Component } from "react";
import Header from "../Header";
import {
  isSignInPending,
  handlePendingSignIn
} from 'blockstack';

export default class DeleteDoc extends Component {

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
      this.props.loadDocToDelete();
    }

  render() {
    const loading = this.props.loading;
    const save = this.props.save;
    return (
      <div>
        <Header />
        <div className="container docs">
          <div className="card doc-card delete-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete Document
            </h5>
            <h6>Are you sure you want to delete <strong>{this.props.title}</strong>?
            </h6>
            <div className={save}>
            <button className="btn red" onClick={this.props.handleDeleteDoc}>
              Delete
            </button>
            <a href="/documents"><button className="btn grey">
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
    );
  }
}
