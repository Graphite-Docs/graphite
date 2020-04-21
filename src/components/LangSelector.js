import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setLang } from "../actions/lang";
const langSupport = require("../utils/languageSupport.json");
const languages = Object.keys(langSupport);

const LangSelector = ({ lang, setLang }) => {
  const [menuState, setMenuState] = useState(false);

  const toggleMenu = () => {
    setMenuState(!menuState);
  };

  const handleLanguage = (lang) => {
    toggleMenu();
    setLang(lang);
  }

  return (
    <div className="lang-drop">
      <section>
        <ul className="navigation-list">
          <li className="navigation-item">
            <button className="not-button no-underline" onClick={toggleMenu}>{lang}<i className="fas fa-caret-down"></i></button>
            <div style={{ display: menuState ? "block" : "none" }} className="menu-drop lang" id='lang-drop'>
              <ul>
                {languages.map((language) => {
                  return <li key={language}><button onClick={() => handleLanguage(language)} className='not-button no-underline btn-left'>{language}</button></li>;
                })}
              </ul>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
};

LangSelector.propTypes = {
  lang: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  lang: state.lang,
});

export default connect(mapStateToProps, { setLang })(LangSelector);
