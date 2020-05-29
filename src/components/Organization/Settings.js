import React from "react";
import Navbar from "../Navbar";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import OrgInfo from "./OrgInfo";
import OrgUsers from "./OrgUsers";
import Plans from "../Billing/Plans";
const langSupport = require("../../utils/languageSupport.json");

const Settings = ({ lang, orgs: { organizations, selectedOrg } }) => {
  return (
    <div>
      <Navbar />
      <div className="clear-nav">
        <div className="container top-100">
          <h3>{langSupport[lang].nav_settings}</h3>
          <div className="top-40">
            {
              organizations.length > 0 ? 
              <div className="row">
                <OrgInfo />
                {
                  selectedOrg.users &&
                  <OrgUsers />
                }                
              </div> : 
              <div>
                <Plans />
              </div>
            }            
          </div>
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object,
  orgs: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang,
  profile: state.profile,
  orgs: state.orgs,
});

export default connect(mapStateToProps)(Settings);
