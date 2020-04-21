import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { register } from "../../actions/auth";
import { setAlert } from "../../actions/alert";
const langSupport = require("../../utils/languageSupport.json");

const Registration = ({ register, lang }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email) {
      register(name, email);
    } else {
      setAlert("Please provide required information", "error");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name" className='invisible'>Enter your full name</label>
        <input
          type="text"
          placeholder={langSupport[lang].register_name}
          id='name'
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="email" className='invisible'>Enter your email address</label>
        <input
          type="email"
          id='email'
          placeholder="johnnyappleseed@email.com"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">{langSupport[lang].register_button}</button>
      </form>
    </div>
  );
};

Registration.propTypes = {
  auth: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang
});

export default connect(mapStateToProps, { register })(Registration);
