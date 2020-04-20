import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login, validateLogin } from "../../actions/auth";
import { setAlert } from "../../actions/alert";

const Login = ({ login }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if(email) {
      login(email, password);
    } else {
      setAlert('Please provide required information', 'error');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <label htmlFor="email" className='invisible'>Enter your email address</label>
        <input
          type="email"
          id='email'
          placeholder="johnnyappleseed@email.com"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password" className='invisible'>Enter your password</label>
        <input
          id='password'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

Login.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { login, validateLogin })(Login);
