import React, { Component } from "react";
import Header from './Header';

// const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class PaymentSuccess extends Component {

  componentDidMount() {
    const object = {};
    object.email = window.location.href.split('?')[2];
    object.planType = window.location.href.split('?')[1];
    this.props.savePlan(object);
  }
  render(){
      return(
        <div>
          <Header />
          <h3 className="center-align">Thank you for signing up for the Graphite Pro Plan</h3>
        </div>
      );
  }
}
