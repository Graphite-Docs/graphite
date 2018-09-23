import React, { Component } from "react";
import {
  isUserSignedIn
} from "blockstack";
import Header from './Header';
import Onboarding from './Onboarding'
import Pricing from './Pricing';
import gdocs from '../images/logo_docs_128px.png';
const uuidv4 = require('uuid/v4');
const keys = require("./helpers/keys.js");

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Integrations extends Component {

  componentWillMount() {
    isUserSignedIn() ? this.props.loadIntegrations() : this.loadUserData();
  }
  componentDidMount() {
    window.$('.modal').modal();
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
    const { gDocsConnected, webhookConnected, stealthyConnected, blockusignConnected, coinsConnected, noteRiotConnected, kanstackConnected, mediumConnected, slackConnected, userRole, graphitePro } = this.props;
    if(1+1===2) {
      return(
        <div>
          <Header />
          <div className="container">
            <div className="integrations-section">
            <h3 className="center-align">Encrypted Integrations</h3>
            <h5 className="center-align">Connect your favorite apps with the click of a button. Once connected,
            all your shared files can be easily referenced and accessed through the
            integrations you have enabled. All without sacrificing end-to-end encryption and privacy.</h5>
            <div className="integration-options row">
              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="Stealthy logo" />
                  <h5>Stealthy</h5>
                  <div className="app-description">
                    <h6>Stealthy is a decentralized, end to end encrypted, p2p chat and video application built with security & privacy in mind. Secure decentralized communication. <a href="">Learn more.</a></h6>
                    {stealthyConnected === true ? <button onClick={this.props.disconnectStealthy} className="btn btn-small grey">Disconnect</button> : <button onClick={this.props.connectStealthy} className="btn btn-small black">Connect</button>}
                  </div>
                </div>
              </div>

            <div className="col card medium s12 m6 l4">
              <div className="center-align">
                <img className="integrations-img" src="https://pbs.twimg.com/profile_images/1009123830181384194/e_oJ72k1_400x400.jpg" alt="Blockusign logo" />
                <h5>Blockusign</h5>
                <div className="app-description">
                  <h6>Blockusign is A decentralized (dApp) social document signing tool where you own and control your own documents, contracts and data. <a href="https://blockusign.co/signup.html">Learn more.</a></h6>
                  {blockusignConnected === true ? <button onClick={this.props.disconnectBlockusign} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Soon</button>}
                </div>
              </div>
            </div>

              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://browser.blockstack.org/static/75459315a786fbe42b49b90798358bb6.png" alt="Coins logo" />
                  <h5>Coins</h5>
                  <div className="app-description">
                    <h6>Coins is an encrypted cryptocurrency portfolio management tool created on top of Blockstack. Built from the ground up to measure your performance at varying scales, from fine-grain to high-level insights. <a href="">Learn more.</a></h6>
                    {coinsConnected === true ? <button onClick={this.props.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Soon</button>}
                  </div>
                </div>
              </div>

              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://note.riot.ai/static/img/icons/app-icon-noteriot-512x512.png" alt="Note Riot logo" />
                  <h5>Note Riot</h5>
                  <div className="app-description">
                    <h6>Note riot allows you to create and store encrypted notes. Categorize, filter, and style notes with complete data ownership. <a href="">Learn more.</a></h6>
                    {noteRiotConnected === true ? <button onClick={this.props.disconnectNoteRiot} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Soon</button>}
                  </div>
                </div>
              </div>

            <div className="col card medium s12 m6 l4">
              <div className="center-align">
                <img className="integrations-img" src="https://kanstack.hankstoever.com/logo.png" alt="Kanstack logo" />
                <h5>Kanstack</h5>
                <div className="app-description">
                  <h6>A decentralized Kanban board built on Blockstack. Kanstack is offline friendly, encrypted, and open-source. <a href="https://kanstack.com/#/">Learn more.</a></h6>
                  {kanstackConnected === true ? <button onClick={this.props.disconnectKanstack} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Soon</button>}
                </div>
              </div>
            </div>
            </div>
          </div>
          {userRole !== "User" ?
          <div className="integrations-section">
            <h3 className="center-align">Traditional Integrations</h3>
            <h5 className="center-align">There are times where you will want to take advantage of traditional applications, times when the data does not need to be private but either needs to be spread far and wide as soon as possible or the data needs to be used to help your workflow in other ways.
            That is why Graphite offers the following traditional integrations.</h5>
            {/*<div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png" alt="Wordpress logo" />
                <h5>Wordpress</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>WordPress combines simplicity for users and publishers with under-the-hood complexity for developers. This makes it flexible while still being easy-to-use. <a href="https://wordpress.org/about/features/">Learn more.</a></h6>
              {wordpressConnected === true ? <button onClick={this.props.disconnectWordpress} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connecCoins} className="btn btn-small black">Connect</button>}
            </div>
            </div>*/}

            <div className="integration-options row">
              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://cdn-images-1.medium.com/max/1600/1*emiGsBgJu2KHWyjluhKXQw.png" alt="Medium logo" />
                  <h5>Medium</h5>
                  <div className="app-description">
                    <h6>Medium taps into the brains of the world’s most insightful writers, thinkers, and storytellers to bring you the smartest takes on topics that matter. <a href="https://medium.com/about">Learn more.</a></h6>
                    {Object.keys(mediumConnected).length >0 ? <button onClick={this.props.disconnectMedium} className="btn btn-small grey">Disconnect</button> : graphitePro ? <a href={'https://medium.com/m/oauth/authorize?client_id='+ keys.MEDIUM_CLIENT_ID_DEV + '&scope=basicProfile,publishPost&state=' + uuidv4() + '&response_type=code&redirect_uri=' + redirectUri}><button className="btn btn-small black">Connect</button></a> : <button className="btn black modal-trigger" href="#pricingModal">Sign up for Graphite Pro</button>}
                  </div>
                </div>
              </div>

              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://assets.brandfolder.com/oh0k24-4ytb20-26iscq/view.png" alt="Slack logo" />
                  <h5>Slack</h5>
                  <div className="app-description">
                    <h6>When your team needs to kick off a project, hire a new employee, deploy some code, plan your next office opening, and more, Slack has you covered. <a href="https://slack.com/about">Learn more.</a></h6>
                    {slackConnected === true ? <button onClick={this.props.disconnectSlack} className="btn btn-small grey">Disconnect</button> : graphitePro ? <a href={'https://slack.com/oauth/authorize?client_id=' + keys.SLACK_CLIENT_ID_DEV + '&scope=incoming-webhook'}><button className="btn btn-small black">Connect</button></a> : <button className="btn black modal-trigger" href="#pricingModal">Sign up for Graphite Pro</button>}
                  </div>
                </div>
              </div>

              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src="https://cdn.worldvectorlogo.com/logos/webhooks.svg" alt="Webhooks" />
                  <h5>Webhooks</h5>
                  <div className="app-description">
                    <h6>A webhook (also called a web callback or HTTP push API) is a way for an app to provide other applications with real-time information. <a href="https://sendgrid.com/blog/whats-webhook/">Learn more.</a></h6>
                    {webhookConnected === true ? <button onClick={this.props.disconnectWebhooks} className="btn btn-small grey">Disconnect</button> : graphitePro ? <a href="#webhookModal" className="modal-trigger"><button className="btn btn-small black">Connect</button></a> : <button className="btn black modal-trigger" href="#pricingModal">Sign up for Graphite Pro</button>}
                  </div>
                </div>
              </div>

              <div className="col card medium s12 m6 l4">
                <div className="center-align">
                  <img className="integrations-img" src={gdocs} alt="Google Docs Integration" />
                  <h5>Google Docs</h5>
                  <div className="app-description">
                    <h6>Pull in all or any of your Google Docs. This integration will fetch a maximum of 1,000 documents and will give you full control over which files to import.</h6>
                    {gDocsConnected === true ? <button onClick={this.props.disconnectGDocs} className="btn btn-small grey">Disconnect</button> :
                    graphitePro && window.location.href.includes('local') ?
                      <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><button className="btn btn-small black">Fetch Docs</button></a> :
                    graphitePro && window.location.href.includes('serene') ?
                      <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=https%3A%2F%2Fserene-hamilton-56e88e.netlify.com%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><button className="btn btn-small black">Fetch Docs</button></a> :
                    graphitePro && window.location.href.includes('graphite') ?
                      <a href={"https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline&include_granted_scopes=true&state=123456&redirect_uri=https%3A%2F%2Fapp.graphitedocs.com%2Fintegrations%2Fgdocs&response_type=code&client_id=" + keys.GOOGLE_CLIENT_ID} className="modal-trigger"><button className="btn btn-small black">Fetch Docs</button></a> :
                    <button className="btn black modal-trigger" href="#pricingModal">Sign up for Graphite Pro</button>}
                  </div>
                </div>
              </div>

            </div>


          </div>:
          <div className="hide" />

          }

          </div>

          {/*Medium Modal */}
          <div id="webhookModal" className="modal">
            <div className="modal-content">
              <h4>Add Webhook URL</h4>
              <p>This integration allows you to post the following data to a webhook url of your choosing, which you can then use to trigger other actions in other systems.</p>
              <ul>
                <li>Document tile</li>
                <li>Document content</li>
                <li>Document collaborators</li>
                <li>Document word count</li>
              </ul>
              <input placeholder="ex: https://hooks.zapier.com/mynewwebhook" type="text" onChange={this.props.handleWebhookUrl} />
            </div>
            <div className="modal-footer">
              <a onClick={this.props.connectWebhook} className="modal-action modal-close waves-effect waves-green btn-flat">Save Webhook</a>
              <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
          </div>
          {/*End Webhook Modal */}



          {/* Pricing Modal */}
          <div id="pricingModal" className="modal">
            <Pricing />
          </div>
          {/*End Pricing Modal */}
        </div>
      );
    } else {
      return (
        <Onboarding />
      )
    }
  }
}
