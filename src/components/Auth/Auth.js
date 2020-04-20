import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Registration from "./Registration";
import EmailSent from "./EmailSent";
import Login from "./Login";
import StripePayment from "./StripePayment";

const Auth = ({ auth: { emailSent, paymentMade } }) => {
  const [authType, setAuthType] = useState("register");

  if (paymentMade === false) {
    return (
      <div className="container">
        <StripePayment />
      </div>
    );
  } else {
    return (
      <div className="container">
        <div className="screen-center">
          <div className='bottom-25'>
            <div className="center">
              <img
                src={require("../../assets/img/full_logo.svg")}
                alt="graphite logo"
              />
            </div>
          </div>
          {emailSent && authType === "register" ? (
            <EmailSent />
          ) : authType === "register" ? (
            <div>
            <Registration />
            <p>Already have an account? <button
                className="not-button"
                onClick={() => setAuthType("login")}
              >
                Login here.
              </button></p>
            </div>
          ) : (
            <div>
            <Login />
            <p>Need to sign up? <button
                className="not-button"
                onClick={() => setAuthType("register")}
              >
                Register here.
              </button></p>
            </div>
          )}
        </div>
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
