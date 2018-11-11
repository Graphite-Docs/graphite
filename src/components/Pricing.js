import React, { Component } from "react";
import {
  teamPlan,
  professionalPlan,
  enterprisePlan
} from './helpers/paymentsDev';
import {
  isUserSignedIn,
  loadUserData
} from 'blockstack'
import { Card, Button } from 'semantic-ui-react';
// import Header from './Header';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Pricing extends Component {

  componentDidMount() {
    this.teamPlan = teamPlan.bind(this);
    this.professionalPlan = professionalPlan.bind(this);
    this.enterprisePlan = enterprisePlan.bind(this);
    isUserSignedIn ? teamPlan() : loadUserData();
    isUserSignedIn ? professionalPlan() : loadUserData();
    isUserSignedIn ? enterprisePlan() : loadUserData();
  }

  render(){
      return(
        <div>
        <Card.Group centered>
          <Card>
            <Card.Content>
              <Card.Header>Team Plan</Card.Header>
              <Card.Description>
              <div className="card">
                  <div className="card-content center">
                    <h2 className='blue-text'><small>$</small>19.99</h2>
                    <p>Per Month</p>
                  </div>
                <ul className='collection center'>
                  <li className='collection-item'>
                    <strong>All Graphite Pro features plus:</strong>
                  </li>
                  <li className='collection-item'>
                    <strong>Up to 5 Users</strong>
                  </li>
                </ul>
              </div>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className='ui two buttons'>
              {window.location.origin === "http://localhost:3000" || window.location.origin === 'http://127.0.0.1:3000' ?
                <form id="teamPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-dev-team-plan" method="POST" ></form> :
                window.location.origin === "https://serene-hamilton-56e88e.netlify.com" ?
                <form id="teamPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-staging-team-plan" method="POST" ></form> :
                <form id="teamPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-team-plan" method="POST" ></form>
              }
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Card.Header>Professional</Card.Header>
              <Card.Description>
              <div className="card-content center">
                <h2 className='red-text '><small>$</small>39.99</h2>
                <p>Per Month</p>
              </div>
              <ul className='collection center'>
                <li className='collection-item'>
                  <strong>All Graphite Pro features plus:</strong>
                </li>
                <li className='collection-item'>
                  <strong>Up to 15 Users</strong>
                </li>
              </ul>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className='ui two buttons'>
              {window.location.origin === "http://localhost:3000" || window.location.origin === 'http://127.0.0.1:3000' ?
                <form id="proPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-dev-pro-plan" method="POST" ></form>:
                window.location.origin === "https://serene-hamilton-56e88e.netlify.com" ?
                <form id="proPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-staging-pro-plan" method="POST" ></form>:
                <form id="proPlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-pro-plan" method="POST" ></form>
              }
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Card.Header>Enterprise</Card.Header>
              <Card.Description>
              <div className="card-content center">
                <h2 className='purple-text '><small>$</small>59.99</h2>
                <p>Per month</p>
              </div>
              <ul className='collection center'>
                <li className='collection-item'>
                  <strong>All Graphite Pro features plus:</strong>
                </li>
                <li className='collection-item'>
                  <strong>Up to 25 Users*</strong>
                </li>
              </ul>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className='ui two buttons'>
              {window.location.origin === "http://localhost:3000" ?
                <form id="enterprisePlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-dev-enterprise-plan" method="POST" ></form>:
                window.location.origin === "https://serene-hamilton-56e88e.netlify.com" ?
                <form id="enterprisePlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-staging-enterprise-plan" method="POST" ></form>:
                <form id="enterprisePlan" action="https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/graphite-pro-pro-enterprise-plan" method="POST" ></form>
              }
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <Card.Header>Self-Hosted and Self-Managed</Card.Header>
              <Card.Description>
              <div className="card-content center">
                <h2 className='green-text '><small></small>Free</h2>
              </div>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>

                <Button href="https://github.com/Graphite-Docs/graphite">Github</Button>

            </Card.Content>
          </Card>
        </Card.Group>
        </div>
      );
  }
}
