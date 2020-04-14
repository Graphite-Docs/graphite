import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validateRegistration } from "../../actions/auth";

const Password = ({ auth: { token }, validateRegistration }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    validateRegistration(password, token);
  };

  return (
    <div>
      Password
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
};

Password.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { validateRegistration })(Password);
