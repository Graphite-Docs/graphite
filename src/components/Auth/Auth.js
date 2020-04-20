import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Registration from "./Registration";
import EmailSent from "./EmailSent";
import Login from "./Login";
import StripePayment from "./StripePayment";

const Auth = ({ auth: { emailSent, paymentMade } }) => {
  const [authType, setAuthType] = useState("register");
  
  if(paymentMade === false) {
    return (
      <StripePayment />
    )
  } else {
    return (
      <div>
        Auth
        <button onClick={() => setAuthType("login")}>Login</button>
        <button onClick={() => setAuthType("register")}>Register</button>
        {emailSent && authType === 'register' ? (
          <EmailSent />
        ) : authType === "register" ? (
          <Registration />
        ) : (
          <Login />
        )}
      </div>
    );
  }
  
};

Auth.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Auth);
