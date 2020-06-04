import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validateEmail } from "../../utils/validations";
import { setAlert } from "../../actions/alert";
import { addUser, deleteUser } from "../../actions/orgs";
const langSupport = require("../../utils/languageSupport.json");

const OrgUsers = ({
  orgs: { selectedOrg },
  auth,
  lang,
  setAlert,
  addUser,
  deleteUser,
}) => {
  const [newUserModal, setNewUserModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [resendModal, setResendModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Admin");

  const handleAdd = (e) => {
    e.preventDefault();
    const { token } = auth;
    try {
      if (userName.length > 0 && userRole && validateEmail(userEmail)) {
        const newUser = { userName, userEmail, userRole };
        addUser(token, selectedOrg, newUser);
        closeModal(e);
      } else {
        setAlert(langSupport[lang].valid_email_name, "error");
      }
    } catch (error) {
      console.log(error);
      setAlert(error.message, "error");
    }
  };

  const handleDeleteModal = (user) => {
    setDeleteUserModal(true);
    setUserEmail(user.email);
    setUserName(user.name);
  };

  const handleDelete = (e) => {
    const { token } = auth;
    deleteUser(token, selectedOrg, userEmail);
    closeModal(e);
  };

  const closeModal = (e) => {
    e.preventDefault();
    setDeleteUserModal(false);
    setNewUserModal(false);
    setResendModal(false);
    setUserName("");
    setUserEmail("");
    setUserRole("");
  };

  const handleResend = (user) => {
    setResendModal(true);
    setUserEmail(user.email);
    setUserName(user.name);
    setUserRole(user.organizations[0].role);
  };

  return (
    <div className="column">
      <div>
        <h5>
          <i className="far fa-user"></i> {langSupport[lang].users}{" "}
          <button onClick={() => setNewUserModal(true)} className="left-5">
            {langSupport[lang].add}
          </button>
        </h5>
        {selectedOrg.role !== "User" && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th scope="col">{langSupport[lang].name}</th>
                  <th scope="col">{langSupport[lang].email}</th>
                  <th scope="col">{langSupport[lang].role}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {selectedOrg.users.map((user) => {
                  const email =
                    user.email.length > 10
                      ? `${user.email.slice(0, 10)}...`
                      : user.email;
                  const showHover = user.email.length > 10 ? true : false;
                  return (
                    <tr key={user._id}>
                      <td data-label="Name">{user.name}</td>
                      <td
                        className={showHover && "hover"}
                        data-label="Email"
                        title={user.email}
                      >
                        {email} {showHover && <span>{user.email}</span>}
                      </td>
                      <td data-label="Role">{user.organizations[0].role}</td>
                      <td>
                        {user._id !== auth.user._id &&
                        user.organizations[0].pending &&
                        user.organizations[0].role !== "Owner" ? (
                          <span
                            onClick={() => handleResend(user)}
                            className="pending"
                          >
                            Pending <i className="far fa-paper-plane"></i>
                          </span>
                        ) : (
                          user._id !== auth.user._id &&
                          user.organizations[0].pending === false && (
                            <button
                              onClick={() => handleDeleteModal(user)}
                              className="not-button no-underline btn-left"
                            >
                              <i className="far fa-trash-alt"></i>
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/******** Dimmer ********/}
      <div
        style={{
          display:
            newUserModal || deleteUserModal || resendModal ? "block" : "none",
        }}
        className="dimmer"
      />

      {/******** User Modal ********/}
      <div
        style={{ display: newUserModal ? "block" : "none" }}
        className="modal"
      >
        <h3>{langSupport[lang].add_user}</h3>
        <div>
          <form onSubmit={handleAdd}>
            <div>
              <label>{langSupport[lang].register_name}</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Marco Polo"
              />
            </div>
            <div>
              <label>{langSupport[lang].email}</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="marcopolo@email.com"
              />
            </div>
            <div>
              <label>{langSupport[lang].role}</label>
              <select onChange={(e) => setUserRole(e.target.value)}>
                <option value="Admin">{langSupport[lang].admin}</option>
                <option value="User">{langSupport[lang].user}</option>
              </select>
            </div>
            <div>
              <button type="submit">{langSupport[lang].send_invite}</button>
              <button onClick={closeModal} className="btn-muted">
                {langSupport[lang].cancel}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/******** Delete User Modal ********/}
      <div
        style={{ display: deleteUserModal ? "block" : "none" }}
        className="modal"
      >
        <h3>
          {langSupport[lang].delete} <u>{userName}</u>?
        </h3>
        <div>
          <p>{langSupport[lang].no_undo}</p>
          <button onClick={handleDelete} className="btn-danger">
            {langSupport[lang].delete}
          </button>
          <button onClick={closeModal} className="btn-muted">
            {langSupport[lang].cancel}
          </button>
        </div>
      </div>

      {/******** Resend Modal ********/}
      <div
        style={{ display: resendModal ? "block" : "none" }}
        className="modal"
      >
        <h3>{langSupport[lang].resend_invite}</h3>
        <div>
          <p>{langSupport[lang].confirm_resend} {userName}?</p>
          <div>
            <button onClick={handleAdd}>{langSupport[lang].resend_invite}</button>
            <button onClick={closeModal} className="btn-muted">
              {langSupport[lang].cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OrgUsers.propTypes = {
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

export default connect(mapStateToProps, { setAlert, addUser, deleteUser })(
  OrgUsers
);
