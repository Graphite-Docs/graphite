import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
const langSupport = require("../../utils/languageSupport.json");

const EmailSent = ({ lang }) => {
  console.log(lang)
  return (
    <div>
      {langSupport[lang].register_email_sent}
    </div>
  )
}

EmailSent.propTypes = {
  lang: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  lang: state.lang,
});

export default connect(mapStateToProps)(EmailSent);