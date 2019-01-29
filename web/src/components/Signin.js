import React, { Component } from "react";
import { Container, Button, Image, Icon, Card } from "semantic-ui-react";
import logo from "../assets/images/graphite_full.svg";
import authProviders from './onboarding/authProviders.json'

export default class Signin extends Component {
  componentDidMount() {
    let body = document.getElementsByTagName("body");
    body[0].style.background = "#eee";
  }

  render() {

    return (
      <Container style={{ textAlign: "center", marginTop: "50px" }}>
        <Image src={logo} style={{ maxWidth: "65%", margin: "auto" }} />
        <Card style={{width: "65%", minHeight: "300px", margin: "auto", marginTop: "45px"}}>
          <Card.Content>
            <Card.Description>
              <h1 style={{marginTop: "25px"}}>Let's get to work...</h1>
              <div style={{marginTop: "45px"}}>
                {
                  authProviders.map(provider => {
                    let buttonStyle = {
                      background: provider.colorScheme,
                      color: "#fff",
                      borderRadius: "0",
                      margin: "5px"
                    }
                    return (
                      <div key={provider.name}>
                        <Button onClick={() => this.props.handleAuth(provider.name)} style={buttonStyle}>Continue With {provider.name}</Button> <br/>
                      </div>
                    )
                  })
                }
              </div>
              <p style={{fontSize: "14px", marginTop: "45px"}}>Not sure where to start? <a>Click here</a> to create a decentralized ID and get started. You can change it anytime.</p>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <a>
              <Icon name="info" />
              Learn More
            </a>
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
  }
}
