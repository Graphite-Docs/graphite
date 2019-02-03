import React, { Component } from "react";
import { Container, Button, Image, Icon, Card, Modal } from "semantic-ui-react";
import Loading from './Loading';
import logo from "../assets/images/graphite_full.svg";
import authProviders from "./onboarding/authProviders.json";
import {
  blockstackSignIn
} from './helpers/authentication';

export default class Signin extends Component {

  componentDidMount() {
    let body = document.getElementsByTagName("body");
    body[0].style.background = "#eee";
    blockstackSignIn();
  }

  render() {
    let loading = window.location.href.includes('authResponse');
    if(!loading) {
      return (
        <Container style={{ textAlign: "center", marginTop: "50px" }}>
          <Image src={logo} style={{ maxWidth: "65%", margin: "auto" }} />
          <Card
            style={{
              width: "65%",
              minHeight: "300px",
              margin: "auto",
              marginTop: "45px"
            }}
          >
            <Card.Content>
              <Card.Description>
                <h1 style={{ marginTop: "25px" }}>Let's get to work...</h1>
                <div style={{ marginTop: "45px" }}>
                  {authProviders.map(provider => {
                    let buttonStyle = {
                      background: provider.colorScheme,
                      color: "#fff",
                      borderRadius: "0",
                      margin: "5px"
                    };
                    return (
                      <div key={provider.name}>
                        <Button
                          onClick={() => this.props.handleAuth(provider.name)}
                          style={buttonStyle}
                        >
                          Continue With {provider.name}
                        </Button>{" "}
                        <br />
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: "14px", marginTop: "45px" }}>
                  Not sure where to start?
                  <Modal
                    closeIcon
                    trigger={<a style={{ cursor: "pointer" }}> Click here </a>}
                  >
                    <Modal.Content>
                      <Modal.Description>
                        <h3>Which provider should I sign in with?</h3>
                        <p>
                          <strong>uPort:</strong> uPort is a project being built
                          under the ConsenSys umbrella. It supports decentralized
                          identities anchored to the ethereum blockchain. This is
                          a good choice if you like two-factor authentication and
                          have access to a smartphone.
                        </p>
                        <p>
                          <strong>Blockstack:</strong> Blockstack is building its
                          own blockchain. While identities created through
                          Blockstack are anchored to the bitcoin blockchain now,
                          they will be anchored to Blockstack's Stacks blockchain
                          in the future. Blockstack is a good choice if you prefer
                          in-browser authentication without needing a smartphone.
                        </p>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                  for a breif rundown and suggestions based on your needs.
                </p>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Modal
                closeIcon
                trigger={
                  <a>
                    <Icon name="info" />
                    Learn More
                  </a>
                }
              >
                <Modal.Content>
                  <Modal.Description>
                    <h3>What is this all about?</h3>
                    <p>
                      Graphite does not maintain a database of usernames and
                      passwords. Your login credentials are wholly owned by you.
                      This means, you will need to create a decentralized identity
                      with one of the supported providers and log in with that
                      provider.
                    </p>
                    <p>
                      Unlike logging in with Google or Facebook, these identities
                      you create are portable and unrestricted. No one can take
                      them away from you. In today's world, Google or Facebook or
                      any number of services can lock you out of your account.
                      When you are logging in with a decentralized identity,
                      that's no longer an issue.
                    </p>
                    <p>
                      uPort and Blockstack are just the first two providers
                      Graphite supports. There are many more out there building
                      based on shared, global standards. Learn more about
                      decentralized identifiers at the{" "}
                      <a
                        href="https://identity.foundation"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Decentralized Identity Foundation
                      </a>.
                    </p>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            </Card.Content>
          </Card>

          <h4 style={{ marginTop: "55px" }}>
            <a
              href="https://graphitedocs.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Graphite
            </a>
          </h4>
        </Container>
      );
    } else {
      return (
        <Loading />
      )
    }

  }
}
