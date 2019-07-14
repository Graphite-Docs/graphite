import React, { Component } from 'reactn';
import { Container, Button, Image, Icon, Card, Modal } from "semantic-ui-react";
import logo from "../../../assets/images/graphite_full.svg";
import { signIn } from '../helpers/auth';

let buttonStyle = {
  background: "#230D2E",
  color: "#fff",
  borderRadius: "0",
  margin: "5px"
};

class SignIn extends Component {
  componentDidMount() {
    let body = document.getElementsByTagName("body");
    body[0].style.background = "#eee";
  }
  render() {
      return (
        <div>
         <Container className='margin-top-45 center'>
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
                <h1 className='margin-top-25'>Let's get to work...</h1>
                <div className='margin-top-45'>
                <Button
                  onClick={signIn}
                  style={buttonStyle}
                >
                Continue With Blockstack
                </Button>
                </div>
                <p style={{ fontSize: "14px", marginTop: "45px" }}>
                  What is Blockstack? <span> </span>
                  <Modal
                    closeIcon
                    trigger={<button className='link-button' style={{ cursor: "pointer", color: "#4183c4" }}>Click here</button>}
                  >
                    <Modal.Content>
                      <Modal.Description>
                        <h3>What is Blockstack?</h3>
                        <p>tl;dr - Blockstack is a way to sign into multiple apps similar to signing in with Google or Facebook. But without all the misuse of your data.</p>
                        <p>
                          Blockstack provides user-owned digital identities. When you create a Blockstack username, you are generating encryption keys that 
                          are only accessible by you. The name itself is owned by you, not Blockstack or Graphite. That ownership can be proven on the bitcoin blockchain.
                        </p>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                  <span> </span> to get a quick rundown.
                </p>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Modal
                closeIcon
                trigger={
                  <button className='link-button'>
                    <Icon name="info" />
                    Learn More
                  </button>
                }
              >
                <Modal.Content>
                  <Modal.Description>
                    <h3>What is this all about?</h3>
                    <p>
                      Graphite does not maintain a database of usernames and
                      passwords. Your login credentials are wholly owned by you.
                      This means, you will need to create a decentralized identity
                      with Blockstack and log in with that.
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
                      Blockstack is a member of the Decentralized Identity Foundation. Learn more about
                      decentralized identifiers <a href="https://identity.foundation" target="_blank" rel="noopener noreferrer">here</a>.
                    </p>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            </Card.Content>
          </Card>

          <h4 style={{ marginTop: "55px" }}>
            Looking for uPort authentication? That's part of <a href="https://graphitedocs.com/labs" target="_blank" rel="noopener noreferrer">Graphite Labs</a>.
          </h4>

          <h4 style={{ marginTop: "55px" }}>
            <a
              href="https://graphitedocs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Graphite
            </a>
          </h4>
        </Container>
        </div>
       );
  }
}

export default SignIn;
