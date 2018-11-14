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
          <Button secondary style={{ borderRadius: "0", color: "#fff" }} onClick={ handleSignIn.bind(this) }>
            Sign In with Blockstack
          </Button>
          <div style={{marginTop: "25px"}}>
          <p>Don'{/*'*/}t have an account yet? No problem! Sign up here:</p>
          <a style={{cursor: "pointer"}} onClick={ handleSignIn.bind(this) }>
            Sign Up
          </a>
          </div>
        </p>
        <h4 style={{marginTop: "55px"}}><a href='https://graphitedocs.com/about' target='_blank' rel="noopener noreferrer">About Graphite</a></h4>
      </Container>
    );
  }
}
