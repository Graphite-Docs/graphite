import React, { Component } from "react";
import {
  isUserSignedIn,
} from "blockstack";
import Header from './Header';
import Onboarding from './Onboarding'

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Integrations extends Component {

  componentWillMount() {
    isUserSignedIn() ? this.props.loadIntegrations() : this.loadUserData();
  }
  componentDidMount() {
    window.$('.modal').modal();
  }

  render(){
    const { stealthyConnected, blockusignConnected, coinsConnected, noteRiotConnected, kanstackConnected, mediumConnected, mediumIntegrationToken, slackConnected, slackWebhookUrl } = this.props;
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
              <div className="col s4">
                <div className="center-align">
                  <img className="integrations-img" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="Stealthy logo" />
                  <h5>Stealthy</h5>
                </div>
              </div>
              <div className="col s8 app-description">
                <h6>Stealthy is a decentralized, end to end encrypted, p2p chat and video application built with security & privacy in mind. Secure decentralized communication. <a href="">Learn more.</a></h6>
                {stealthyConnected === true ? <button onClick={this.props.disconnectStealthy} className="btn btn-small grey">Disconnect</button> : <button onClick={this.props.connectStealthy} className="btn btn-small black">Connect</button>}
              </div>
            </div>
            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://pbs.twimg.com/profile_images/1009123830181384194/e_oJ72k1_400x400.jpg" alt="Blockusign logo" />
                <h5>Blockusign</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Blockusign is A decentralized (dApp) social document signing tool where you own and control your own documents, contracts and data. <a href="https://blockusign.co/signup.html">Learn more.</a></h6>
              {blockusignConnected === true ? <button onClick={this.props.disconnectBlockusign} className="btn btn-small grey">Disconnect</button> : <button onClick={this.props.connectBlockusign} className="btn btn-small black">Connect</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://browser.blockstack.org/images/app-icon-coins-256x256.png" alt="Coins logo" />
                <h5>Coins</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Coins is an encrypted cryptocurrency portfolio management tool created on top of Blockstack. Built from the ground up to measure your performance at varying scales, from fine-grain to high-level insights. <a href="">Learn more.</a></h6>
              {coinsConnected === true ? <button onClick={this.props.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Connect</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://note.riot.ai/static/img/icons/app-icon-noteriot-512x512.png" alt="Note Riot logo" />
                <h5>Note Riot</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Note riot allows you to create and store encrypted notes. Categorize, filter, and style notes with complete data ownership. <a href="">Learn more.</a></h6>
              {noteRiotConnected === true ? <button onClick={this.props.disconnectNoteRiot} className="btn btn-small grey">Disconnect</button> : <button className="btn btn-small black">Soon</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://kanstack.hankstoever.com/logo.png" alt="Kanstack logo" />
                <h5>Kanstack</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>A decentralized Kanban board built on Blockstack. Kanstack is offline friendly, encrypted, and open-source. <a href="https://kanstack.com/#/">Learn more.</a></h6>
              {kanstackConnected === true ? <button onClick={this.props.disconnectKanstack} className="btn btn-small grey">Disconnect</button> : <button onClick={this.props.connectKanstack} className="btn btn-small black">Connect</button>}
            </div>
            </div>
          </div>
          <div className="integrations-section">
            <h3 className="center-align">Traditional Integrations</h3>
            <h5 className="center-align">There are times where you will want to take advantage of traditional applications, times when the data does not need to be private but either needs to be spread far and wide as soon as possible or the data needs to be used to help your workflow in other ways.
            That is why Graphite offers the following traditional integrations.</h5>
            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png" alt="Wordpress logo" />
                <h5>Wordpress</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>WordPress combines simplicity for users and publishers with under-the-hood complexity for developers. This makes it flexible while still being easy-to-use. <a href="https://wordpress.org/about/features/">Learn more.</a></h6>
              {coinsConnected === true ? <button onClick={this.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button onClick={this.connecCoins} className="btn btn-small black">Connect</button>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://cdn-images-1.medium.com/max/1600/1*emiGsBgJu2KHWyjluhKXQw.png" alt="Medium logo" />
                <h5>Medium</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>Medium taps into the brains of the world’s most insightful writers, thinkers, and storytellers to bring you the smartest takes on topics that matter. <a href="https://medium.com/about">Learn more.</a></h6>
              {mediumConnected === true ? <button onClick={this.props.disconnectMedium} className="btn btn-small grey">Disconnect</button> : <a className="modal-trigger" href="#mediumModal"><button className="btn btn-small black">Connect</button></a>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://assets.brandfolder.com/oh0k24-4ytb20-26iscq/view.png" alt="Slack logo" />
                <h5>Slack</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>When your team needs to kick off a project, hire a new employee, deploy some code, review a sales contract, finalize next year'{/*'*/}s budget, measure an A/B test, plan your next office opening, and more, Slack has you covered. <a href="https://slack.com/about">Learn more.</a></h6>
              {slackConnected === true ? <button onClick={this.props.disconnectSlack} className="btn btn-small grey">Disconnect</button> : <a className="modal-trigger" href="#slackModal"><button className="btn btn-small black">Connect</button></a>}
            </div>
            </div>

            <div className="integration-options row">
            <div className="col s4">
              <div className="center-align">
                <img className="integrations-img" src="https://cdn.worldvectorlogo.com/logos/webhooks.svg" alt="Webhooks" />
                <h5>Webhooks</h5>
              </div>
            </div>
            <div className="col s8 app-description">
              <h6>A webhook (also called a web callback or HTTP push API) is a way for an app to provide other applications with real-time information. <a href="https://sendgrid.com/blog/whats-webhook/">Learn more.</a></h6>
              {coinsConnected === true ? <button onClick={this.disconnectCoins} className="btn btn-small grey">Disconnect</button> : <button onClick={this.props.connectCoins} className="btn btn-small black">Connect</button>}
            </div>
            </div>

          </div>
          </div>

          {/*Medium Modal */}
          <div id="mediumModal" className="modal">
            <div className="modal-content">
              <h4>Add Medium Integration Token</h4>
              <p>Your medium integration token can be generated by logging into Medium then going to the settings page. Look for the section that says "Integration Tokens", and generate one for Graphite there.</p>
              <input placeholder="ex: 2fr1fbgd8955cab8f2bf9097e1d7028783h095b65555aa80f22eazzs1e5c9f4e3f" type="text" value={mediumIntegrationToken} onChange={this.props.handleMediumIntegrationToken} />
            </div>
            <div className="modal-footer">
              <a onClick={this.props.connectMedium} className="modal-action modal-close waves-effect waves-green btn-flat">Save & Connect</a>
              <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
          </div>
          {/*End Medium Modal */}

          {/*Slack Modal*/}
          <div id="slackModal" className="modal">
            <div className="modal-content">
              <h4>Add Slack Integration Webhook URL</h4>
              <p>You can create your Slack integration webhook URL by going to <code>yoursitename.slack.com/apps/A0F7XDUAZ-incoming-webhooks?next_id=0</code>. Paste the URL generated in the section below.</p>
              <p>Any document shared to your entire team will send a slack notification to the channel of your choosing.</p>
              <input placeholder="ex: https://hooks.slack.com/jkhjka83289ojwerunsa70d" type="text" value={slackWebhookUrl} onChange={this.props.handleSlackWebhookUrl} />
            </div>
            <div className="modal-footer">
              <a onClick={this.props.connectSlack} className="modal-action modal-close waves-effect waves-green btn-flat">Save & Connect</a>
              <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
            </div>
          </div>
          {/*Slack Modal*/}
        </div>
      );
    } else {
      return (
        <Onboarding />
      )
    }
  }
}
