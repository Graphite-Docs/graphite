import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validateEmail } from "../../utils/validations";
import { setAlert } from "../../actions/alert";
import { addUser, updateUser } from "../../actions/orgs";
const langSupport = require("../../utils/languageSupport.json");

const OrgUsers = ({
  orgs: { selectedOrg },
  auth,
  lang,
  setAlert,
  addUser,
  updateUser,
}) => {
  const [newUserModal, setNewUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
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

  const handleEdit = (user) => {
    setEditUserModal(true);
    setUserName(user.name);
    setUserEmail(user.email);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
  };

  const closeModal = (e) => {
    e.preventDefault();
    setEditUserModal(false);
    setNewUserModal(false);
    setUserName("");
    setUserEmail("");
    setUserRole("");
  };

  return (
    <div className="column">
      <div>
        <h5>
          <i className="far fa-user"></i> Users{" "}
          <button onClick={() => setNewUserModal(true)} className="left-5">
            Add
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
                        {user._id !== auth.user._id && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="not-button no-underline btn-left"
                          >
                            <i className="far fa-edit"></i>
                          </button>
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
          display: newUserModal || editUserModal ? "block" : "none",
        }}
        className="dimmer"
      />

      {/******** User Modal ********/}
      <div
        style={{ display: newUserModal ? "block" : "none" }}
        className="modal"
      >
        <h3>Add User</h3>
        <div>
          <form onSubmit={handleAdd}>
            <div>
              <label>User Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Marco Polo"
              />
            </div>
            <div>
              <label>User Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="marcopolo@email.com"
              />
            </div>
            <div>
              <select onChange={(e) => setUserRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            <div>
              <button type="submit">Send Invite</button>
              <button onClick={closeModal} className="btn-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/******** Edit User Modal ********/}
      <div
        style={{ display: editUserModal ? "block" : "none" }}
        className="modal"
      >
        <h3>Update User Information</h3>
        <div>
          <form onSubmit={handleUpdate}>
            <div>
              <label>User Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Marco Polo"
              />
            </div>
            <div>
              <label>User Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="marcopolo@email.com"
              />
            </div>
            <div>
              <button type="submit">Update User</button>
              <button onClick={closeModal} className="btn-muted">
                Cancel
              </button>
            </div>
          </form>
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

export default connect(mapStateToProps, { setAlert, addUser, updateUser })(
  OrgUsers
);
