import React, { Component } from "react";
import {
  isUserSignedIn
} from "blockstack";
import { Grid, Container, Segment, Image, Button, Modal, Input } from 'semantic-ui-react';
import Header from './Header';
import Loading from './Loading'
import gdocs from '../images/logo_docs_128px.png';
const uuidv4 = require('uuid/v4');
const keys = require("./helpers/keys.js");

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Integrations extends Component {

  componentWillMount() {
    isUserSignedIn() ? this.props.loadIntegrations() : this.loadUserData();
  }

  render(){
    let redirectUri;
    if(window.location.href.includes('http://127')) {
      redirectUri = "http://127.0.0.1:3000/integrations/medium";
    } else if(window.location.href.includes('https://serene')) {
      redirectUri = "https://serene-hamilton-56e88e.netlify.com/integrations/medium";
    } else {
      redirectUri = "https://app.graphitedocs.com/integrations/medium";
    }
    const { loading, gDocsConnected, webhookConnected, stealthyConnected, mediumConnected, slackConnected } = this.props;

    if(!loading) {
      return(
        <div>
          <Header />
          <Container>
            <div style={{marginTop: "65px", marginBottom: "35px"}}>
            <h1 className="center-align">Integrations</h1>
            <h3 className="center-align">Connect your favorite apps with the click of a button. Once connected,
            all your shared files can be easily referenced and accessed through the
            integrations you have enabled.</h3>

            <Grid stackable columns={2}>
              <Grid.Column>
                <Segment style={{textAlign: "center", height: "460px"}}>
                  <Image style={{maxWidth: "45%", margin: "auto"}} src='https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png' />
                  <h3>Stealthy</h3>
                  <p>Stealthy is a decentralized, end to end encrypted, p2p chat and video application built with security & privacy in mind. Secure decentralized communication. <a href="">Learn more.</a></p>
                  {stealthyConnected === true ?
                    <Button className='integration-button' style={{borderRadius: "0"}} onClick={this.props.disconnectStealthy}>Disconnect</Button> :
                    <Button className='integration-button' secondary style={{borderRadius: "0"}} onClick={this.props.connectStealthy}>Connect</Button>
                  }
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment style={{textAlign: "center", height: "460px"}}>
                  <Image style={{maxWidth: "45%", margin: "auto"}} src='https://cdn-images-1.medium.com/max/1600/1*emiGsBgJu2KHWyjluhKXQw.png' />
                  <h3>Medium</h3>
                  <p>Medium taps into the brains of the world’s most insightful writers, thinkers, and storytellers to bring you the smartest takes on topics that matter. <a href="https://medium.com/about">Learn more.</a></p>
                  {mediumConnected ?
                    <Button className='integration-button' secondary style={{borderRadius: "0"}} onClick={this.props.disconnectMedium}>Disconnect</Button> :
                    <a href={'https://medium.com/m/oauth/authorize?client_id='+ keys.MEDIUM_CLIENT_ID_DEV + '&scope=basicProfile,publishPost&state=' + uuidv4() + '&response_type=code&redirect_uri=' + redirectUri}><Button className='integration-button' secondary style={{borderRadius: "0"}}>Connect</Button></a>
                  }
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment style={{textAlign: "center", height: "460px"}}>
                  <Image style={{maxWidth: "45%", margin: "auto"}} src='https://assets.brandfolder.com/oh0k24-4ytb20-26iscq/view.png' />
                  <h3>Slack</h3>
                  <p>When your team needs to kick off a project, hire a new employee, deploy some code, plan your next office opening, and more, Slack has you covered. <a href="https://slack.com/about">Learn more.</a></p>
                  {slackConnected === true ? <Button className='integration-button' style={{borderRadius: "0"}} onClick={this.props.disconnectSlack}>Disconnect</Button> : <a href={'https://slack.com/oauth/authorize?client_id=' + keys.SLACK_CLIENT_ID_DEV + '&scope=incoming-webhook'}><Button className='integration-button' secondary style={{borderRadius: "0"}}>Connect</Button></a>}
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment style={{textAlign: "center", height: "460px"}}>
                  <Image style={{maxWidth: "45%", margin: "auto"}} src='https://cdn.worldvectorlogo.com/logos/webhooks.svg' />
                  <h3>Webhooks</h3>
                  <p>A webhook (also called a web callback or HTTP push API) is a way for an app to provide other applications with real-time information. <a href="https://sendgrid.com/blog/whats-webhook/">Learn more.</a></p>
                  {webhookConnected === true ? <Button className='integration-button' style={{borderRadius: "0"}} onClick={this.props.disconnectWebhooks}>Disconnect</Button> :
                  <Modal trigger={<Button secondary style={{borderRadius: "0"}}>Connect</Button>} closeIcon>
                    <Modal.Header>Add Webhooks Integration</Modal.Header>
                    <Modal.Content>
                      <Modal.Description>
                      <h4>Add Webhook URL</h4>
                      <p>This integration allows you to post the following data to a webhook url of your choosing, which you can then use to trigger other actions in other systems.</p>
                      <ul>
                        <li>Document tile</li>
                        <li>Document content</li>
                        <li>Document collaborators</li>
                        <li>Document word count</li>
                      </ul>
                      <Input placeholder="ex: https://hooks.zapier.com/mynewwebhook" onChange={this.props.handleWebhookUrl} />
                      <Button onClick={this.props.connectWebhook} secondary style={{borderRadius: "0"}}>Save</Button>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                  }
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment style={{textAlign: "center", height: "460px"}}>
                  <Image style={{maxWidth: "45%", margin: "auto"}} src={gdocs} />
                  <h3>Google Docs</h3>
                  <p>Pull in all or any of your Google Docs. This integration will fetch a maximum of 1,000 documents and will give you full control over which files to import.</p>
                  {gDocsConnected === true ? <Button className='integration-button' style={{borderRadius: "0"}} onClick={this.props.disconnectGDocs}>Disconnect</Button> :
                  window.location.href.includes('local') ?
                    <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><Button className='integration-button' secondary style={{borderRadius: "0"}}>Fetch Docs</Button></a> :
                  window.location.href.includes('serene') ?
                    <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=https%3A%2F%2Fserene-hamilton-56e88e.netlify.com%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><Button className='integration-button' secondary style={{borderRadius: "0"}}>Fetch Docs</Button></a> :
                  window.location.href.includes('graphite') ?
                    <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=https%3A%2F%2Fapp.graphitedocs.com%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><Button className='integration-button' secondary style={{borderRadius: "0"}}>Fetch Docs</Button></a> :
                  null}
                </Segment>
              </Grid.Column>
            </Grid>
            </div>
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
