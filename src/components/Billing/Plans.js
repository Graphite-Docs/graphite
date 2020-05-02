import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Navbar from "../Navbar";
import moment from "moment";
const langSupport = require("../../utils/languageSupport.json");

const Plans = ({
  auth: { token },
  billing: { subscriptionType, subscriptionEndDate, cancelled },
  lang
}) => {
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if(subscriptionEndDate) {
      const format = lang === 'English' ? "MM/DD/YYYY" : "DD/MM/YYYY";      
      setEndDate(moment(subscriptionEndDate * 1000).format(format))
    }    
  }, [lang, subscriptionEndDate])
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
          <li>{langSupport[lang].feature_team_access}</li>
          <li>{langSupport[lang].feature_unlimited_team}</li>
          <li>{langSupport[lang].feature_roles}</li>
          <li>{langSupport[lang].feature_word}</li>
          <li>{langSupport[lang].feature_desktop_app}</li>
        </ul>
      </div>
    );
  };
  return (
    <div>
      <Navbar />
      <div className="clear-nav clear-bottom">
        <div className="container top-100">
          <h3>{langSupport[lang].plans}</h3>
          {subscriptionEndDate ? (
            <div>
              <div className="center">
                <h4>{langSupport[lang].account_cancelled}</h4>
                {
                  subscriptionEndDate > currentDate ? 
                  <p>{langSupport[lang].subscription_access_start}{subscriptionType}{langSupport[lang].subscription_access_end}<strong><u>{endDate}</u></strong></p> : 
                  <p></p>
                }
                <p>{langSupport[lang].select_a_plan}</p>
              </div>
              <div>
                <div className="row">
                  <div className="column">
                    <div className="card">
                      <div className="plan-card">
                        <PersonalPlanCard />
                        <button>{langSupport[lang].select_personal}</button>
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="card">
                      <div className="plan-card">
                        <ProfessionalPlanCard />
                        <button>{langSupport[lang].select_professional}</button>
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
                      {subscriptionType === "personal" ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <div />
                      )}
                    </div>
                    <PersonalPlanCard />
                    {
                      subscriptionType !== 'personal' ?
                      <button>{langSupport[lang].downgrade}</button> : 
                      <div />
                    }
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="card">
                  <div className="plan-card">
                    <div className="active-select-container">
                      {subscriptionType === "professional" ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <div />
                      )}
                    </div>
                    <ProfessionalPlanCard />
                    {
                      subscriptionType !== 'professional' ?
                      <button>{langSupport[lang].upgrade}</button> : 
                      <div />
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Plans.propTypes = {
  auth: PropTypes.object.isRequired,
  billing: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  billing: state.billing,
  lang: state.lang
});

export default connect(mapStateToProps)(Plans);
