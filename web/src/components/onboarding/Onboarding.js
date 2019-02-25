import React, { Component } from "react";
import { Button, Icon, Modal, Image, Card } from "semantic-ui-react";
import Loading from "../shared/Loading";
import storageOptions from "./storageOptions.json";
import { handleStorage } from './storage/connectStorage';

const keys = require("../helpers/keys.js");

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: this.props.open
    };
  }

  componentDidMount() {
    handleStorage()
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  render() {
    if (window.location.href.includes("code")) {
      return <Loading />;
    } else {
      return (
        <Modal
          trigger={<Button style={{display: "none"}} onClick={this.handleOpen}>Show Modal</Button>}
          open={this.state.modalOpen}
          onClose={this.handleClose}
          closeOnEscape={false}
          closeOnDimmerClick={false}
        >
          <Modal.Content style={{ maxWidth: "70%", margin: "auto" }}>
            <h1>Let's get started</h1>
            <h3 style={{ marginBottom: "25px" }}>
              Welcome to Graphite! The first step to owning your data is
              choosing where your data will be stored.
              <Modal
                trigger={
                  <a style={{ cursor: "pointer" }}>
                    <Icon style={{ fontSize: "14px" }} name="info" />
                  </a>
                }
                closeIcon
              >
                <Modal.Header>How's this work?</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <p>
                      Graphite gives data ownership back to you. We do not store
                      your content. We allow you to store it wherever you would
                      like.
                    </p>
                    <p>
                      The cloud storage providers listed may be centralized, but
                      your data is encrypted and inaccessible to those
                      companies. If you would prefer full decentralization,
                      select IPFS as your storage choice.
                    </p>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            </h3>
            {storageOptions.map(option => {
              let key;
              if (option.name === "Google Drive") {
                key = keys.GOOGLE_CLIENT_ID;
              } else if (option.name === "Dropbox") {
                key = "";
              } else if (option.name === "Box") {
                key = "";
              }
              let grayedOut;
              if(option.comingSoon === true) {
                grayedOut = {
                  background: "#eee", 
                  color: "#000", 
                  cursor: "not-allowed"
                }
              }
              return (
                <Card style={grayedOut} key={option.name}>
                  <Button
                    href={option.comingSoon ? "#" : option.name === 'IPFS' ? `${window.location.origin}/?code=ipfs?state=12345` : option.link + key}
                    labelPosition="left"
                    style={option.comingSoon ? {margin: "10px", cursor: "not-allowed"} : { margin: "10px" }}
                  >
                    <Image
                      style={{
                        height: "20px",
                        marginTop: "-3px",
                        marginRight: "10px"
                      }}
                      src={option.icon}
                    />
                    {option.name}
                  </Button>
                  <br />
                </Card>
              );
            })}
            <div style={{ marginTop: "25px" }}>
              <p>
                Not sure which to choose? No problem! Click Skip to continue,
                and we'll use IPFS until you tell us to change it.
              </p>
              <p>Interested in a custom solution? Graphite Pro might be right for you. <a href='mailto: contact@graphitedocs.com'>Contact us</a> to learn more.</p>
              <Button style={{ borderRadius: "0" }}>Skip</Button>
            </div>
          </Modal.Content>
        </Modal>
      );
    }
  }
}
