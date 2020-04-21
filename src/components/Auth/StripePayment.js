import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { handleSubscription, logout } from "../../actions/auth";
const langSupport = require("../../utils/languageSupport.json");

const StripePayment = ({ auth: { user }, handleSubscription, logout, lang }) => {
  return (
    <div className="screen-center">
      <div className="center">
        <img
          src={require("../../assets/img/logo_mark.svg")}
          alt="graphite mark"
        />
      </div>
      <div className="center top-20">
        <h5>{langSupport[lang].payment_one_last_step}</h5>
        <p>
          {langSupport[lang].payment_last_step_p}
        </p>
      
      <button onClick={() => handleSubscription(user)}>{langSupport[lang].payment_start_now_button}</button><br/>
      <button className="btn-secondary btn-muted" onClick={logout}>
        {langSupport[lang].log_out}
      </button>
      </div>
    </div>
  );
};

StripePayment.propTypes = {
  auth: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang
});

export default connect(mapStateToProps, { handleSubscription, logout })(
  StripePayment
);
