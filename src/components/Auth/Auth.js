import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Registration from "./Registration";
import EmailSent from "./EmailSent";
import Login from "./Login";

const Auth = ({ auth: { emailSent } }) => {
  const [authType, setAuthType] = useState("register");

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
};

Auth.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Auth);
