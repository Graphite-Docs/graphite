import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { uploadAvatar, updateName, updateEmail } from "../../actions/profile";
const blankAvatar = require("../../assets/img/blank_avatar.png");
const langSupport = require("../../utils/languageSupport.json");

const Profile = ({
  auth: { user, token },
  lang,
  uploadAvatar,
  updateName,
  updateEmail,
  profile: { loading },
}) => {
  const { avatar } = user;

  const [userAvatar, setAvatar] = useState(blankAvatar);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  useEffect(() => {
    //  Check if user has avatar and set avatar state appropriately
    if (avatar) {
      setAvatar(avatar);
    } else {
      setAvatar(blankAvatar);
    }

    setUpdatedName(user.name);
    setUpdatedEmail(user.email);
    //eslint-disable-next-line
  }, [user]);

  const handleUpload = () => {
    const uploadEl = document.getElementById("avatar-upload");
    if (uploadEl) {
      uploadEl.click();
      uploadEl.onchange = (e) => {

        uploadAvatar(token, e.target.files[0]);
        const reader = new FileReader();

        reader.onload = function (e) {
          uploadEl.setAttribute("src", e.target.result);
        };

        reader.readAsDataURL(e.target.files[0]);
      };
    }
  };

  const handleUpdateName = () => {
    setEditName(false);
    updateName(token, updatedName);
  };

  const handleUpdateEmail = () => {
    setEditEmail(false);
    updateEmail(token, updatedEmail);
  };

  return (
    <div>
      <Navbar />
      <div className="clear-nav">
        <div className="container top-100">
          <h3>{langSupport[lang].profile}</h3>
          <div className="row">
            <div className="column top-40">
              <div className="avatar-section">
                <img src={userAvatar} alt="user avatar" />
                <div>
                  <button onClick={handleUpload}>
                    {loading ? langSupport[lang].uploading : langSupport[lang].change_avatar}
                  </button>
                  <input
                    style={{ display: "none" }}
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                  />
                </div>
              </div>
              <div className="center top-25">
                {editName ? (
                  <span className='profile-info'>
                    <input                      
                      type="text"
                      onChange={(e) => setUpdatedName(e.target.value)}
                      value={updatedName}
                    />
                    <button
                      onClick={handleUpdateName}
                      className="not-button no-underline btn-left"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  </span>
                ) : (
                  <h5 className='profile-info'>
                    {updatedName ? updatedName : user.name}{" "}
                    <button
                      onClick={() => setEditName(true)}
                      className="not-button no-underline btn-left"
                    >
                      <i className="far fa-edit"></i>
                    </button>
                  </h5>
                )}
              </div>

              <div className="center top-25">
                {editEmail ? (
                  <span className='profile-info'>
                    <input
                      type="email"
                      onChange={(e) => setUpdatedEmail(e.target.value)}
                      value={updatedEmail}
                    />
                    <button
                      onClick={handleUpdateEmail}
                      className="not-button no-underline btn-left"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  </span>
                ) : (
                  <div className='profile-info'>
                    <h5>
                      {updatedEmail ? updatedEmail : user.email}{" "}
                      <button
                        onClick={() => setEditEmail(true)}
                        className="not-button no-underline btn-left"
                      >
                        <i className="far fa-edit"></i>
                      </button>
                    </h5>
                    <p className='muted'>{langSupport[lang].change_email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  lang: state.lang,
  profile: state.profile,
});

export default connect(mapStateToProps, { uploadAvatar, updateName, updateEmail })(Profile);
