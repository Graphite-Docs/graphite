import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { uploadAvatar } from "../../actions/profile";
const blankAvatar = require("../../assets/img/blank_avatar.png");
const langSupport = require("../../utils/languageSupport.json");

const Profile = ({ auth: { user, token }, lang, uploadAvatar, profile: { loading } }) => {
  const { avatar } = user;

  const [userAvatar, setAvatar] = useState(blankAvatar);

  useEffect(() => {
    //  Check if user has avatar and set avatar state appropriately
    if (avatar) {
      setAvatar(avatar);
    } else {
      setAvatar(blankAvatar);
    }
    //eslint-disable-next-line
  }, [user]);

  const handleUpload = () => {
    const uploadEl = document.getElementById("avatar-upload");
    if (uploadEl) {
      uploadEl.click();
      uploadEl.onchange = (e) => {
        console.log(e.target.files[0]);

        uploadAvatar(token, user, e.target.files[0]);
      };
    }
  };

  return (
    <div>
      <Navbar />
      <div className="clear-nav">
        <div className="container top-100">
          <h3>{langSupport[lang].profile}</h3>
          <div className="row">
            <div className="column">
              <div className="avatar-section">
                <img src={userAvatar} alt="user avatar" />
                <div>
                  <button onClick={handleUpload}>
                    {loading ? "Uploading..." : "Change Avatar"}
                  </button>
                  <input
                    style={{ display: "none" }}
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                  />
                </div>
              </div>
            </div>
            <div className="column">
              <h3>Other Stuff</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang,
  profile: state.profile,
});

export default connect(mapStateToProps, { uploadAvatar })(Profile);
