import React, { Component } from "react";
import Header from './Header';
import Pricing from './Pricing';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Onboarding extends Component {

  componentDidMount() {
    window.$('.tooltipped').tooltip({delay: 50});
    window.$('.modal').modal();
  }

  render(){
      return(
        <div>
          <Header />
          <div className="container onboarding-page">
            <div className="center-align">
              <h3>This page requires access to Graphitre Pro</h3>
              <button className="btn black onboarding-button modal-trigger" href="#pricingModal">View Pricing</button>
              <div>
                <div>
                  <h5>Graphite Pro includes all of the Graphite features you are used to plus the following:</h5>
                </div>
                <div>
                  <div>
                    <p>Phone and email support<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Dedicated phone and email support from a real person. Mon-Fri, 9am-9pm Central Time."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Team management<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Add teammates that are separate from your other contacts, and collaborate with them."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Team member roles and permissions<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Control what level of access each person on your team has to documents and files."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                </div>
                <div>
                  <div>
                    <p>Secure authentication for entire team<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Free Blockstack IDs to allow for secure, decentralized single-sign-on authentication."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Team audit history<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="View last login and other actions taken by members of your team."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>One-click sharing to entire team<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Don't just share to a single person, share to the entire team with one click."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Integrations<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Integrations with decentralized apps and traditional apps like Wordpress, Medium, Slack, and webhook access."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Calendar<span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Simple calendar with event creation and management."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                  <div>
                    <p>Business messaging through <a href="https://www.stealthy.im">Stealthy</a><span><a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Explore all the features of Stealthy both in Graphite and through a dedicated mobile app."><i className="more-info material-icons">info</i></a></span></p>
                  </div>
                </div>
              </div>
              <button className="btn black onboarding-button modal-trigger" href="#pricingModal">View Pricing</button>
            </div>
          </div>
          {/* Pricing Modal */}
          <div id="pricingModal" className="modal">
            <Pricing />
          </div>
          {/*End Pricing Modal */}
        </div>
      );
  }
}
