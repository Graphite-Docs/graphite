import React from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { handleSubscription } from '../../actions/auth';

const StripePayment = ({ auth: { user }, handleSubscription }) => {

  return (
    <div>
      <h3>One more step. You need to start your Graphite trial subscription. Just $15.99 per month but pay nothing for the first 14 days.</h3>
      <button onClick={() => handleSubscription(user)}>Start Now</button>
    </div>
  );
};

StripePayment.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { handleSubscription })(StripePayment);