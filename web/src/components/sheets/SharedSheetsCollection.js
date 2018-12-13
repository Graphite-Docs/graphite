import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {
  loadUserData,
  getFile,
  putFile,
  lookupProfile,
  signUserOut,
} from 'blockstack';
import Loading from '../Loading';
import {Menu as MainMenu, Icon, Container, Table} from 'semantic-ui-react';

const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SharedSheetsCollection extends Component {
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
        sharedSheets: [],
        shareFile: [],
        sheets: [],
        filteredSheets: [],
        tempSheetId: "",
        redirect: false,
        loading: false,
        user: "",
        filteredValue: [],
        img: avatarFallbackImage
      }


    }

    componentDidMount() {
      this.setState({ user: this.props.match.params.id, loading: true });
      getFile("sheetscollection.json", {decrypt: true})
       .then((fileContents) => {
         if(fileContents) {
           console.log("Loaded");
           this.setState({ sheets: JSON.parse(fileContents || '{}').sheets });
           // this.setState({filteredValue: this.state.value})
           this.setState({ loading: "hide" });
         } else {
           console.log("No sheets");
           this.setState({ loading: "hide" });
         }
       })
        .catch(error => {
          console.log(error);
        });

      let fileID = loadUserData().username;
      let fileString = 'sharedsheets.json'
      let file = fileID.slice(0, -3) + fileString;
      const directory = '/shared/' + file;
      const options = { username: this.props.match.params.id, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
      const privateKey = loadUserData().appPrivateKey;
      getFile(directory, options)
       .then((fileContents) => {
         lookupProfile(this.state.user, "https://core.blockstack.org/v1/names")
           .then((profile) => {
             let image = profile.image;
             console.log(profile);
             if(profile.image){
               this.setState({img: image[0].contentUrl})
             } else {
               this.setState({ img: avatarFallbackImage })
             }
           })
           .catch((error) => {
             console.log('could not resolve profile')
           })
          this.setState({ shareFile: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))), loading: false })
          console.log("loaded");
          this.save();
       })
        .catch(error => {
          console.log(error);
        });
    }

  save() {
    putFile("sheetscollection.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log("saved");
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  renderView() {
    let sheets = this.state.shareFile;
    const { loading } = this.state;
    if (sheets.length > 0 && !loading) {
      return (
        <div>

        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-sheets'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            Sheets shared by {this.state.user}
          </MainMenu.Item>
          </MainMenu>
          <Container>
          <div style={{marginTop: "65px", textAlign: "center"}}>
            <h3 className="center-align">Sheets {this.state.user} shared with you</h3>

            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                  {
                    sheets.slice(0).reverse().map(sheet => {

                    return(
                      <Table.Row key={sheet.id} style={{ marginTop: "35px"}}>
                        <Table.Cell><Link to={'/sheets/single/shared/'+ window.location.href.split('shared/')[1] + '/' + sheet.id}>{sheet.title.length > 20 ? sheet.title.substring(0,20)+"..." :  sheet.title}</Link></Table.Cell>
                        <Table.Cell>{this.state.user}</Table.Cell>
                        <Table.Cell>{sheet.shared}</Table.Cell>
                      </Table.Row>
                    );
                    })
                  }
              </Table.Body>
            </Table>
            </div>
          </Container>

        </div>
      );
    } else if(!loading) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-sheets'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            Back
          </MainMenu.Item>
          </MainMenu>
        <div className="container docs">
          <h3 className="center-align">Nothing shared by {this.state.user}</h3>
        </div>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }
  }


  render() {

    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
