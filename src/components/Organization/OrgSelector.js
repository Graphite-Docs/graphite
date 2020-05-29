import React from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Navbar from '../Navbar'
import { selectOrg } from '../../actions/orgs';
const langSupport = require("../../utils/languageSupport.json");

const OrgSelector = ({ orgs: { organizations }, selectOrg, history, lang }) => {

  const handleSelection = (org) => {
    selectOrg(org);
    if(window.location.href.includes('org-selection')) {
      history.push(`/`)
    }
  }

  return (
    <div>
      <Navbar />
    
      <div className="screen-center">
        <div className="card">
          <h3>{langSupport[lang].select_org}</h3>
          <p>{langSupport[lang].multiple_orgs}</p>
          {
            organizations.map((org) => {
              return (
                <button key={org._id} onClick={() => handleSelection(org)} className="not-button">
                  {org.name}
                </button>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

OrgSelector.propTypes = {
  orgs: PropTypes.object.isRequired,
  lang: PropTypes.string,
};

const mapStateToProps = (state) => ({
  orgs: state.orgs,
  lang: state.lang
});

export default connect(mapStateToProps, { selectOrg })(OrgSelector);