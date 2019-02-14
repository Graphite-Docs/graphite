import React, { Component } from "react";
import Header from './shared/Header';
import Loading from './shared/Loading';
import GDocs from './documents/GDocs';
import { Container } from 'semantic-ui-react';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class OAUTH extends Component {
  componentDidMount() {
    // if(window.location.href.includes("medium")) {
    //   const object = {};
    //   object.integration = window.location.pathname.split('/')[2];
    //   object.state = window.location.href.split('=')[1];
    //   object.code = window.location.href.split('=')[2];
    //   this.props.connectMedium(object.code);
    // } else if (window.location.href.includes('slack')) {
    //   this.props.connectSlack(window.location.href.split('=')[1].split('&')[0]);
    // }

  }


  render(){
    const { filteredGDocs, importAll } = this.props;

    return (
      <div>
      <Header />
        <Container>
          {
            filteredGDocs.length > 0 ?
            <GDocs
              filteredGDocs={filteredGDocs}
              importAll={importAll}
              filterGDocsList={this.props.filterGDocsList}
              singleGDoc={this.props.singleGDoc}
              importAllGDocs={this.props.importAllGDocs}
            /> :
            <div>
              {window.location.href.includes('gdocs') ? <h3 style={{textAlign: "center", marginTop: "45px"}}>Fetching Google Docs</h3> : <h3 style={{textAlign: "center", marginTop: "45px"}}>Saving Integration...</h3>}
              <Loading />
            </div>
          }
        </Container>
      </div>
    )
  }
}
