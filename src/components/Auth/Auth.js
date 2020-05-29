import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Registration from "./Registration";
import EmailSent from "./EmailSent";
import Login from "./Login";
import LangSelector from "../LangSelector";
const langSupport = require("../../utils/languageSupport.json");

const Auth = ({ auth: { emailSent }, lang }) => {
  const [authType, setAuthType] = useState("register");
    return (
      <div className="container">
        <div className='top-right-fixed'>
          <LangSelector />
        </div> 
        <div className="screen-center">
          <div className="bottom-25">
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
              <p>
                {langSupport[lang].register_switch_to_login}
                <button
                  className="not-button"
                  onClick={() => setAuthType("login")}
                >
                  {langSupport[lang].login_here_button}
                </button>
              </p>
            </div>
          ) : (
            <div>
              <Login />
              <p>
                {langSupport[lang].login_switch_to_register}{" "}
                <button
                  className="not-button"
                  onClick={() => setAuthType("register")}
                >
                  {langSupport[lang].register_here_button}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
};

Auth.propTypes = {
  auth: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang,
});

export default connect(mapStateToProps)(Auth);
