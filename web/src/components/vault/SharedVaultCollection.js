import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {Menu as MainMenu, Icon, Container, Table} from 'semantic-ui-react';
import Loading from '../Loading';

export default class SharedVaultCollection extends Component {

  componentDidMount() {
    this.props.loadSharedVault()
  }


  render() {
    const { loading } = this.props;
    let files = this.props.shareFileIndex;
    if(!loading) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-vault'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            Files shared by {this.props.user}
          </MainMenu.Item>
          </MainMenu>
          <Container>
          <div style={{marginTop: "65px", textAlign: "center"}}>
            <h3 className="center-align">Files {this.props.user} shared with you</h3>
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
                    files.slice(0).reverse().map(file => {

                    return(
                      <Table.Row key={file.id} style={{ marginTop: "35px"}}>
                        <Table.Cell><Link to={'/vault/single/shared/' + window.location.href.split('shared/')[1] + '/' + file.id}>{file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name}</Link></Table.Cell>
                        <Table.Cell>{this.props.user}</Table.Cell>
                        <Table.Cell>{file.uploaded}</Table.Cell>
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
    } else {
      return(
        <Loading />
      )
    }

  }
}
