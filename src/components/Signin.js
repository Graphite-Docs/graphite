import React, { Component } from 'react';
import { Container, Button, Image } from 'semantic-ui-react'
import logo from '../assets/images/Logo.svg'

export default class Signin extends Component {
  render() {
    const { handleSignIn } = this.props;

    return (
      <Container style={{ textAlign: "center", marginTop: "200px" }}>
        <Image src={logo} style={{ maxWidth: "65%", margin: "auto"}}/>
        <p>
        Graphite is a decentralized and encrypted replacement for Google's{/* '*/} G-Suite. Built on Blockstack and powered by the Bitcoin Blockchain.
        </p>
        <p>
          <Button style={{ borderRadius: "0", background: "#282828", color: "#fff" }} onClick={ handleSignIn.bind(this) }>
            Sign In with Blockstack
          </Button>
        </p>
        <h4 style={{marginTop: "55px"}}><a href='https://graphitedocs.com/about' target='_blank' rel="noopener noreferrer">About Graphite</a></h4>
      </Container>
    );
  }
}
