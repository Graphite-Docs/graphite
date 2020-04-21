import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login, validateLogin } from "../../actions/auth";
import { setAlert } from "../../actions/alert";
const langSupport = require("../../utils/languageSupport.json");

const Login = ({ login, lang }) => {
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
          placeholder={langSupport[lang].login_password}
        />
        <button type="submit">{langSupport[lang].login_button}</button>
      </form>
    </div>
  );
};

Login.propTypes = {
  auth: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang
});

export default connect(mapStateToProps, { login, validateLogin })(Login);
