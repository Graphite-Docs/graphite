import React, { Component } from "reactn";
import { Link } from 'react-router-dom';
import { initialShared } from '../helpers/sharedDocs';
import {Menu as MainMenu, Icon, Container, Table} from 'semantic-ui-react';
import Loading from '../shared/Loading';

export default class SharedCollection extends Component {

  componentDidMount() {
    initialShared();
  }

  renderView() {
    const { loading, docs } = this.global;
    const user = window.location.href.split('shared/')[1].includes('did:') ? window.location.href.split('shared/')[1].split('uport')[1].split('#')[0] : window.location.href.split('shared/')[1].split('#')[0]
    if (docs.length > 0 && !loading) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-docs'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color:"#fff"}}>
            Documents shared by {user}
          </MainMenu.Item>
          </MainMenu>
          <Container>
          <div style={{marginTop: "65px", textAlign: "center"}}>
            <h3 className="center-align">Documents {user} shared with you</h3>

            <Table unstackable style={{borderRadius: "0"}}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Static File</Table.HeaderCell>
                  <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                  {
                    docs.slice(0).reverse().map(doc => {

                    return(
                      <Table.Row key={doc.id} style={{ marginTop: "35px"}}>
                        <Table.Cell><Link to={'/documents/single/shared/'+ window.location.href.split('shared/')[1].split('#')[0] + '/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"}</Link></Table.Cell>
                        <Table.Cell>{user}</Table.Cell>
                        <Table.Cell>{doc.rtc === true ? "False" : "True"}</Table.Cell>
                        <Table.Cell>{doc.shared}</Table.Cell>
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
    } else if(!loading && docs.length < 1) {
      return (
        <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/shared-docs" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


                <ul className="left toolbar-menu">
                  <li><a>Documents shared by {user}</a></li>
                </ul>

            </div>
          </nav>
        </div>
        <div className="container docs">
          <h3 className="center-align">Nothing shared by {user}</h3>
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
