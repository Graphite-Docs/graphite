import React, { Component } from "react";
import Header from "../Header";
import {
  isSignInPending,
  handlePendingSignIn
} from 'blockstack';
import Loading from '../Loading';
import { Container, Button } from 'semantic-ui-react';

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
    if(!loading) {
      return (
        <div>
          <Header />
          <Container style={{marginTop: "65px", textAlign: "center"}}>
            <div className="card doc-card delete-card">
              <div className="double-space doc-margin delete-doc center-align">
              <h3>
                Delete Document
              </h3>
              <p>Are you sure you want to delete <strong>{'"'+ this.props.title + '"'}</strong>?
              </p>
              <div className={save}>
              <Button style={{borderRadius: "0", background: "red", color: "#fff"}} onClick={this.props.handleDeleteDoc}>
                Delete
              </Button>
              <a href="/documents"><Button style={{borderRadius: "0"}}>
                No, go back
              </Button></a>
              </div>
              </div>
            </div>
          </Container>

        </div>
      );
    } else {
      return(
        <Loading />
      )
    }
  }
}
