import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { validateRegistration } from "../../actions/auth";
const langSupport = require("../../utils/languageSupport.json");

const Verify = ({validateRegistration, auth: { isAuthenticated }, history, lang}) => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = window.location.href.split("token=")[1];
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

    return (
      <div className='screen-center'>
        <div className='center bottom-20'>
          <img src={require('../../assets/img/logo_mark.svg')} alt='graphite mark' />
        </div>
        <h5 className='center'>{langSupport[lang].register_set_password}</h5>
        <form onSubmit={handleSubmit}>
          <label htmlFor='password' className='invisible'></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">{langSupport[lang].register_complete}</button>
        </form>
      </div>
    );
};

Verify.propTypes = {
  auth: PropTypes.object.isRequired, 
  lang: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang
});

export default connect(mapStateToProps, { validateRegistration })(Verify);
