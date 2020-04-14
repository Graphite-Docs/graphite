import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { validateRegistration } from "../../actions/auth";

const Verify = ({validateRegistration, auth: { isAuthenticated }, history}) => {
  const [verifyType, setVerifyType] = useState("registration");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const type = window.location.href.split("type=")[1].split("&")[0];
    const token = window.location.href.split("token=")[1];

    setVerifyType(type);
    setToken(token);

    if(isAuthenticated) {
      handleRedirect();
    }
    //eslint-disable-next-line
  }, [isAuthenticated]);

  const handleRedirect = () => {
    history.push(`/`)
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    validateRegistration(password, token);
  };

  if(verifyType === 'registration') {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Complete Registration</button>
        </form>
      </div>
    );
  } else {
    // TODO - handle an else here if there is one
  }
};

Verify.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { validateRegistration })(Verify);
