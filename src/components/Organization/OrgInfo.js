import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import { validateEmail } from "../../utils/validations";
import { updateOrg } from "../../actions/orgs";
const langSupport = require("../../utils/languageSupport.json");

const OrgInfo = ({
  orgs: { selectedOrg },
  lang,
  setAlert,
  updateOrg,
  auth: { token },
}) => {
  const [editOrgInfo, setEditOrgInfo] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [mainContact, setMainContact] = useState("");

  useEffect(() => {
    if (selectedOrg.name) {
      setOrgName(selectedOrg.name);
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (selectedOrg.contactEmail) {
      setMainContact(selectedOrg.contactEmail);
    }
  }, [selectedOrg]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (orgName && mainContact && validateEmail(mainContact)) {
      const updatedOrgData = {
        id: selectedOrg._id,
        name: orgName,
        contactEmail: mainContact,
      };
      updateOrg(token, updatedOrgData);
      setEditOrgInfo(false);
    } else {
      setAlert(langSupport[lang].valid_email_name, "error");
    }
  };

  const cancelChanges = () => {
    setOrgName(selectedOrg.name);
    setMainContact(selectedOrg.contactEmail);
    setEditOrgInfo(false);
  };

  return (
    <div className="column">
      <div>
        <h5>
          <i className="far fa-building"></i> {langSupport[lang].org_info}
        </h5>
        <div>
          {editOrgInfo ? (
            <div>
              <form onSubmit={handleUpdate}>
                <div className="form-spacing">
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <div className="form-spacing">
                  <input
                    type="email"
                    required
                    value={mainContact}
                    onChange={(e) => setMainContact(e.target.value)}
                  />
                </div>
                <button type="submit">{langSupport[lang].save_changes}</button>
                <button className="btn-secondary" onClick={cancelChanges}>
                  {langSupport[lang].cancel}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <p>
                <strong>{langSupport[lang].org_name}: </strong>
                <br />
                {selectedOrg.name}{" "}
                {selectedOrg.role !== "User" && (
                  <button
                    onClick={() => setEditOrgInfo(true)}
                    className="not-button no-underline btn-left"
                  >
                    <i className="far fa-edit"></i>
                  </button>
                )}
              </p>
              <p>
                <strong>{langSupport[lang].org_contact}: </strong>
                <br />
                {selectedOrg.contactEmail}{" "}
                {selectedOrg.role !== "User" && (
                  <button
                    onClick={() => setEditOrgInfo(true)}
                    className="not-button no-underline btn-left"
                  >
                    <i className="far fa-edit"></i>
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrgInfo.propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object,
  orgs: PropTypes.object.isRequired,
  alerts: PropTypes.array,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang,
  profile: state.profile,
  orgs: state.orgs,
});

export default connect(mapStateToProps, { setAlert, updateOrg })(OrgInfo);
