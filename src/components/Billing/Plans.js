import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Navbar from "../Navbar";
import moment from "moment";
import { Redirect } from "react-router-dom";
import { createOrg } from '../../actions/orgs';
import { validateEmail } from "../../utils/validations";
import { setAlert } from "../../actions/alert";
const langSupport = require("../../utils/languageSupport.json");

const Plans = ({
  auth: { token, isAuthenticated, loading, user },
  billing: { subscriptionType, subscriptionEndDate },
  orgs: { organizations },
  lang,
  restartSubscription,
  setAlert,
  createOrg
}) => {
  const [endDate, setEndDate] = useState("");
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");

  useEffect(() => {
    if (subscriptionEndDate) {
      const format = lang === "English" ? "MM/DD/YYYY" : "DD/MM/YYYY";
      setEndDate(moment(subscriptionEndDate * 1000).format(format));
    }
  }, [lang, subscriptionEndDate]);

  const handleRestart = (plan) => {
    restartSubscription(token, plan);
  };

  const handleUpgrade = () => {
    setUpgradeModal(true);
  };

  const handleClose = () => {
    setUpgradeModal(false);
    setOrgName("");
    setOrgName("");
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const emailValidated = validateEmail(orgEmail);
      if (orgEmail && orgName && emailValidated) {
        const newOrg = {
          name: orgName,
          contactEmail: orgEmail,
          billingPlan: "Professional",
          role: "Owner",
        };
        createOrg(newOrg, token, user.publicKey)
        setUpgradeModal(false);
      } else {
        setAlert("Please enter a valid email and organization name", "error");
      }
    } catch (error) {
      console.log(error);
      setAlert(error.message, "error");
    }
  };

  const currentDate = Date.now() / 1000;
  const PersonalPlanCard = () => {
    return (
      <div>
        <h4>{langSupport[lang].personal}</h4>
        <p>{langSupport[lang].personal_per_month}</p>
        <ul>
          <li>{langSupport[lang].feature_unlimited_docs}</li>
          <li>{langSupport[lang].feature_share_with_link}</li>
          <li>{langSupport[lang].feature_modern_editor}</li>
          <li>{langSupport[lang].feature_export_pdf}</li>
          <li>{langSupport[lang].feature_encrypted}</li>
        </ul>
      </div>
    );
  };

  const ProfessionalPlanCard = () => {
    return (
      <div>
        <h4>{langSupport[lang].professional}</h4>
        <p>{langSupport[lang].professional_per_month}</p>
        <ul>
          <li>{langSupport[lang].feature_personal_plus}</li>
          <li>{langSupport[lang].feature_unlimited_team}</li>
          <li>{langSupport[lang].feature_roles}</li>
          <li>{langSupport[lang].feature_word}</li>
        </ul>
      </div>
    );
  };
  if (!loading && isAuthenticated) {
    return (
      <div>
        <Navbar />
        <div className="clear-nav clear-bottom">
          {/******** Dimmer ********/}
          <div
            style={{
              display: upgradeModal ? "block" : "none",
            }}
            className="dimmer"
          />

          {/******** Upgrade Modal ********/}
          <div
            style={{ display: upgradeModal ? "block" : "none" }}
            className="modal"
          >
            <h3>Upgrade Now</h3>
            <p>
              After you upgrade, you will be invoiced for the month ($99). If
              you'd like to pay the year in advance, please{" "}
              <a className="not-button" href="mailto:contact@graphitedocs.com">
                contact us
              </a>
              .
            </p>
            <div>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="orgName">Organization Name</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    id="orgName"
                    type="text"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="orgEmail">Contact Email</label>
                  <input
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    id="orgEmail"
                    type="email"
                    placeholder="youremail@email.com"
                  />
                </div>
                <button type="submit">Upgrade</button>
                <button onClick={handleClose} className="btn-muted">
                  Cancel
                </button>
              </form>
            </div>
          </div>
          <div className="container top-100">
            <h3>{langSupport[lang].plans}</h3>
            {subscriptionEndDate ? (
              <div>
                <div className="center">
                  <h4>{langSupport[lang].account_cancelled}</h4>
                  {subscriptionEndDate > currentDate ? (
                    <p>
                      {langSupport[lang].subscription_access_start}
                      {`${subscriptionType.toUpperCase()} PLAN`}
                      {langSupport[lang].subscription_access_end}
                      <strong>
                        <u>{endDate}</u>
                      </strong>
                    </p>
                  ) : (
                    <p></p>
                  )}
                  <p>{langSupport[lang].select_a_plan}</p>
                </div>
                <div>
                  <div className="row">
                    <div className="column">
                      <div className="card">
                        <div className="plan-card">
                          <PersonalPlanCard />
                          <button onClick={() => handleRestart("personal")}>
                            {langSupport[lang].select_personal}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="column">
                      <div className="card">
                        <div className="plan-card">
                          <ProfessionalPlanCard />
                          <button onClick={() => handleRestart("professional")}>
                            {langSupport[lang].select_professional}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="column">
                  <div className="card">
                    <div className="plan-card">
                      <div className="active-select-container">
                        {organizations.length === 0 ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          <div />
                        )}
                      </div>
                      <PersonalPlanCard />
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="card">
                    <div className="plan-card">
                      <div className="active-select-container">
                        {organizations.length > 0 ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          <div />
                        )}
                      </div>
                      <ProfessionalPlanCard />
                      {organizations.length === 0 ? (
                        <button onClick={handleUpgrade} className="btn wrap">
                          {langSupport[lang].upgrade}
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else if (!loading) {
    return <Redirect to="/" />;
  } else {
    return <div>Loading...</div>;
  }
};

Plans.propTypes = {
  auth: PropTypes.object.isRequired,
  billing: PropTypes.object.isRequired,
  orgs: PropTypes.object.isRequired,
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  billing: state.billing,
  lang: state.lang,
  orgs: state.orgs,
});

export default connect(mapStateToProps, { setAlert, createOrg })(Plans);
