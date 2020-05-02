import React from "react";
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Navbar from "../Navbar";
import { cancelAccount } from "../../actions/billing";
const langSupport = require("../../utils/languageSupport.json");

const Cancel = ({
  auth: { token },
  billing: { subscriptionEndDate, loading },
  lang,
  cancelAccount
}) => {
  return (
    <div>
      <Navbar />
      <div className="clear-nav">
        <div className="container top-100">
          {
          loading ? 
          <p>Loading...</p> :
          subscriptionEndDate ? (
            <div>
              <h3>{langSupport[lang].already_cancelled}</h3>
              <p>{langSupport[lang].restart}</p>
              <Link to='/plans'><button>{langSupport[lang].restart_subscription}</button></Link>
            </div>
          ) : (
            <div>
              <h3>{langSupport[lang].see_you_leave}</h3>
              <p>
                {langSupport[lang].if_you_go}
              </p>
              <button onClick={() => cancelAccount(token)}>
                {langSupport[lang].cancel_account}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Cancel.propTypes = {
  auth: PropTypes.object.isRequired,
  billing: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  billing: state.billing,
  lang: state.lang
});

export default connect(mapStateToProps, { cancelAccount })(Cancel);
