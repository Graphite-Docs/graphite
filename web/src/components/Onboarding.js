import React, { Component } from "react";
import Header from './Header';
import Pricing from './Pricing';
import { Container, Button, Modal, Icon } from 'semantic-ui-react';


// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Onboarding extends Component {

  render(){
      return(
        <div>
          <Header />
          <Container>
            <div style={{textAlign: "center", marginTop: "45px"}}>
              <h1>This page requires access to Graphitre Pro</h1>
              <Modal closeIcon trigger={<Button secondary style={{borderRadius: "0"}}>View Pricing</Button>}>
                <Modal.Header>Roles and Access</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <Pricing />
                  </Modal.Description>
                </Modal.Content>
              </Modal>
              <div style={{marginTop: "20px"}}>
                <div>
                  <h5>Graphite Pro includes all of the Graphite features you are used to plus the following:</h5>
                </div>
                <div>
                  <div>
                    <p>Phone and email support<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Dedicated phone and email support from a real person. Mon-Fri, 9am-9pm Central Time."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Team management<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Add teammates that are separate from your other contacts, and collaborate with them."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Team member roles and permissions<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Control what level of access each person on your team has to documents and files."><Icon name='info' /></a></span></p>
                  </div>
                </div>
                <div>
                  <div>
                    <p>Secure authentication for entire team<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Free Blockstack IDs to allow for secure, decentralized single-sign-on authentication."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Team audit history<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="View last login and other actions taken by members of your team."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>One-click sharing to entire team<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Don't just share to a single person, share to the entire team with one click."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Integrations<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Integrations with decentralized apps and traditional apps like Wordpress, Medium, Slack, and webhook access."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Calendar<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Simple calendar with event creation and management."><Icon name='info' /></a></span></p>
                  </div>
                  <div>
                    <p>Business messaging through <a href="https://www.stealthy.im">Stealthy</a><span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Explore all the features of Stealthy both in Graphite and through a dedicated mobile app."><Icon name='info' /></a></span></p>
                  </div>
                </div>
              </div>
              <Modal closeIcon trigger={<Button secondary style={{borderRadius: "0", marginTop: "25px"}}>View Pricing</Button>}>
                <Modal.Header>Roles and Access</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <Pricing />
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            </div>
          </Container>
        </div>
      );
  }
}
