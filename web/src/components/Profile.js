import React, { Component } from 'react';
import Header from './Header';
import {
  loadUserData
} from 'blockstack';
import { Container, Button, Modal, Card, Icon, Form } from 'semantic-ui-react';
import Loading from './Loading';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  state={}

  componentDidMount() {
    this.props.loadProfile();
  }

  handleChange = ( e, { value }) => this.setState({ value }, () => {
    this.props.handleEmailSetting(this.state.value);
  });

  render() {
    const { loading } = this.props;
    if(!loading) {
      return (
        <div>
          <Header />
          <Container style={{textAlign: "center", marginTop: "45px"}}>
            <h1 className="center-align">Profile</h1>
            <h3 className="note center-align">Any updates made here are public</h3>
            <Card.Group centered>
              <Card>
                <Card.Content style={{textAlign: "center"}}>
                  <h3>Basic Info</h3>
                  <h4>This info represents your decentralized identity, used to log into Graphite and other apps.</h4>
                  <h5>Name</h5>
                  <p>{loadUserData().profile.name ? loadUserData().profile.name : "Anonymous"}</p>
                  <h5>Username</h5>
                  <p>{loadUserData().username}</p>
                  <h5>Identity Address</h5>
                  <p style={{wordWrap: "break-word"}}>{loadUserData().identityAddress}</p>
                  <h5>Decentralized Identifier</h5>
                  <p style={{wordWrap: "break-word"}}>{loadUserData().decentralizedID}</p>
                  <a href='https://browser.blockstack.org/profiles' target='_blank' rel="noopener noreferrer"><Button secondary style={{borderRadius: "0"}}>Edit</Button></a>

                  </Card.Content>
              </Card>
              <Card>
                <Card.Content style={{textAlign: "center"}}>
                  <h4>Settings</h4>
                  <h5>Email Notifications <span className="note">
                  <Modal trigger={<a style={{cursor: "pointer"}} ><Icon name='info' /></a>} closeIcon>
                    <Modal.Header>Email Notifications</Modal.Header>
                    <Modal.Content>
                      <Modal.Description>
                      <p style={{wordWrap: "break-word"}}>By adding your email address here, you are exposing that email in a publicly accessible file, stored in your Gaia storage hub.
                      The email will never be used for anything other than sending a notification that a new file has been shared, but if you are not comfortable with your
                      email address being discoverable, do not opt into this and do not enter your email address.</p>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                  </span></h5>
                  <p>When someone shares files with you</p>
                  <Form>
                    <Form.Group inline>
                      <label>Enable Email Notifications</label>
                      <Form.Radio
                        label='Yes'
                        value='yes'
                        checked={this.props.emailOK === true}
                        onChange={this.handleChange}
                      />
                      <Form.Radio
                        label='No'
                        value='no'
                        checked={this.props.emailOK === false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Input fluid label='Email' value={this.props.profileEmail} onChange={this.props.handleProfileEmail} placeholder='sally@email.com' />
                    </Form.Group>
                    <Form.Button secondary style={{borderRadius: "0"}} onClick={this.props.saveProfile}>Save</Form.Button>
                  </Form>
                  </Card.Content>
              </Card>
            </Card.Group>
          </Container>
        </div>
      );
    } else {
      return (
        <Loading />
      )
    }

  }
}
