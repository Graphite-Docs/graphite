import React, { Component } from "react";
import Header from './Header';
import Loading from './Loading';
import { Grid, Container, Button } from 'semantic-ui-react';
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
    const { loading }= this.state;
    if(!loading) {
      return (
        <div>
          <Header />
          <Container style={{textAlign: "center", marginTop: "65px"}}>
          <h1 style={{marginBottom: "35px"}}>Decrypt and export your data in JSON</h1>
          <Grid columns={2} stackable>
            <Grid.Column>
              <Button onClick={this.compileDocs} secondary style={{borderRadius: "0"}}>Download Documents</Button>
            </Grid.Column>
            <Grid.Column>
              <Button onClick={this.compileSheets} secondary style={{borderRadius: "0"}}>Download Sheets</Button>
            </Grid.Column>
            <Grid.Column>
              <Button onClick={this.compileFiles} secondary style={{borderRadius: "0"}}>Download Files</Button>
            </Grid.Column>
            <Grid.Column>
              <Button onClick={this.compileContacts} secondary style={{borderRadius: "0"}}>Download Contacts</Button>
            </Grid.Column>
          </Grid>
          <h1 style={{marginTop: "45px"}}>Explore All Your Files</h1>
          <p>See your files, decrypted and in their JSON form AND see them encrypted safely in your storage hub.</p>
          <a href="/explorer"><Button secondary style={{borderRadius: "0"}}>Explore Your Files</Button></a>
          </Container>
        </div>
      )
    } else {
      return (
        <Loading />
      )
    }
  }
}
