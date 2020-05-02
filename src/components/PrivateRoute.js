import React from "react";
import { Route } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Loader from "./Loader";

import Auth from "./Auth/Auth";
import Cancel from "./Billing/Cancel";

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading, paymentMade },
  billing: { subscriptionEndDate },
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      (!isAuthenticated && !loading) ||
      (isAuthenticated && !loading && paymentMade === false) ? (
        <Auth />
      ) : subscriptionEndDate && (subscriptionEndDate * 1000) < Date.now() ? (
        <Cancel />
      ) : loading ? (
        <Loader />
      ) : (
        <Component {...props} />
      )
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  billing: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  billing: state.billing
});

export default connect(mapStateToProps)(PrivateRoute);
