import React from "react";
import { Route } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Loader from "./Loader";

import Auth from "./Auth/Auth";
import OrgSelector from "./Organization/OrgSelector";

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading, paymentMade },
  billing: { subscriptionEndDate },
  orgs: { organizations, orgSelector },
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      (!isAuthenticated && !loading) ? (
        <Auth />
      ) : organizations.length > 1 && orgSelector ? (
        <OrgSelector />
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
  billing: state.billing, 
  orgs: state.orgs
});

export default connect(mapStateToProps)(PrivateRoute);
