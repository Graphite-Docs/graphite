import React, { Component } from 'reactn';
import { Image, Container, Button } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import logoSquare from '../../../../assets/images/graphite-mark.svg';
import Walkthrough from '../Walkthrough';
const invites = require('../../helpers/invites');

class Invites extends Component {
  componentDidMount() {
    if(window.location.href.includes('invite/accept')) {
      invites.decodeToken();
    } else {
      invites.saveToken();
    }
  }
  renderNav = () => {
    return(
      <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
        <MainMenu.Item>
          <Image src={logoSquare} style={{ maxHeight: "50px" }} />
        </MainMenu.Item>
        <MainMenu.Menu position='right'>
        <MainMenu.Item>
          <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
        </MainMenu.Item>
        </MainMenu.Menu>
      </MainMenu>
    )
  }
  render() {
      const { welcome } = this.global;
      if(window.location.href.includes('accept')) {
        if(welcome) {
          return(
            <Walkthrough />
          );
        } else {
          return (
            <div>
              {this.renderNav()}
              <h1 className="center margin-top-85">Accepting invite...</h1>
            </div>
          );
        }
      } else {
        return (
          <div>
              {this.renderNav()}
              <div className="margin-top-100">
                <Container>
                  <div className="center">
                    <h1>You're one step closer to joining your team!</h1>
                    <h3>Hit the accept button and you'll be able to use an existing Blockstack ID to accept the invite or create a new ID to accept the invite.</h3>
                    <p className="margin-top-25">Not sure what a Blockstack ID is? Read up on it <a href="https://blockstack.org/what-is-blockstack/" target="_blank" rel="noreferrer noopener">here</a>.</p>
                    <Button onClick={invites.acceptInvite} className="margin-top-25" secondary style={{borderRadius: "0", color: "#fff"}}>Accept Invite</Button>
                  </div>
                </Container>
              </div>
          </div>
         );
      }
  }
}

export default Invites;
