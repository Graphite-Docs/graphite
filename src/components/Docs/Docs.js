import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logout } from "../../actions/auth";
import {
  loadDocs,
  deleteDoc,
  addNewTag,
  deleteTag,
  resetSingleDoc
} from "../../actions/docs";
import {
  shareDocWithLink,
  removeSharedLinkAccess,
} from "../../actions/sharedDocs";
import { v4 as uuidv4 } from "uuid";
import Loader from "../Loader";
import Navbar from "../Navbar";
import { setAlert } from "../../actions/alert";
const langSupport = require("../../utils/languageSupport.json");
const moment = require("moment");

const Docs = ({
  removeSharedLinkAccess,
  loadDocs,
  resetSingleDoc,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink,
  auth: { token, user, loading },
  docs: { documents, shareLink },
  history,
  lang,
}) => {
  const [deleteModalOpen, setDeleteModalState] = useState(false);
  const [shareModalOpen, setShareModalState] = useState(false);
  const [tagModalOpen, setTagModalState] = useState(false);
  const [docToDisplay, setDocToDisplay] = useState({});
  const [docForTag, setDocumentForTag] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [sharePermissions, setSharePermissions] = useState("can-edit");
  const [fullLink, setFullLink] = useState(null);

  useEffect(() => {
    loadDocs(token);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (shareLink) {
      //  construct the actual share link:
      const rootUrl = window.location.origin;
      const path = "/shared/link/";
      const fullLink = rootUrl + path + shareLink;
      setFullLink(fullLink);
    }
  }, [shareLink]);

  const handleNewDoc = async () => {
    const id = uuidv4();
    await resetSingleDoc();
    history.push(`/documents/${id}`);
  };

  const handleLoadDoc = (id) => {
    history.push(`/documents/${id}`);
  };

  const toggleActions = (doc_id) => {
    try {
      let menu = document.getElementById(doc_id);
      const style = getComputedStyle(menu);
      if (style.display !== "none") {
        menu.style.display = "none";
      } else {
        const menus = document.getElementsByClassName("doc-actions-drop");
        if (menus) {
          for (const thisMenu of menus) {
            thisMenu.style.display = "none";
          }
        }
        menu.style.display = "block";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (doc) => {
    //  Display modal for confirmation    
    setDocToDisplay(doc);
    setDeleteModalState(true);
  };

  const confirmDelete = () => {    
    deleteDoc(token, docToDisplay.id);    
    setDeleteModalState(false);
    // setDocToDisplay(null);
  };

  const handleShare = (doc) => {
    setDocToDisplay(doc);
    setShareModalState(true);
  };

  const confirmShare = (doc) => {
    doc["readOnly"] = sharePermissions === "can-edit" ? false : true;
    const { id, title, contentUrl, readOnly } = doc;
    shareDocWithLink(token, user, { id, title, contentUrl, readOnly });
  };

  const closeShareModal = () => {
    setShareModalState(false);
    setFullLink(null);
  };

  const openTagModal = (doc) => {
    setDocumentForTag(doc);
    setTagModalState(true);
  };

  const handleTag = () => {
    try {
      const tagId = uuidv4();
      const tagName = tagInput;
      addNewTag(token, docForTag.id, { tagId, tagName });
      setTagInput('');
      setTagModalState(false);
    } catch (error) {
      console.log(error);
      setAlert(error.message, "error");
    }
  };

  if (loading) {
    return <Loader />;
  } else {
    return (
      <div>
        <Navbar />
        <div className="clear-nav">
          <div className="container top-100">
            <h3>
              {langSupport[lang].your_docs}{" "}
              <span className="new-button">
                <button onClick={handleNewDoc}>{langSupport[lang].new}</button>
              </span>
            </h3>
            <div className="row top-40">
              {
                documents.length > 0 ?
                <div>

                </div> : 
                <div>
                  <h5>{langSupport[lang].no_docs}</h5>
                </div>
              }
              {documents.map((doc) => {
                return (
                  <div className="column" key={doc.id}>
                    <div className="card card-medium">
                      <div className="doc-actions">
                        <button
                          onClick={() => toggleActions(doc.id)}
                          className="not-button no-underline"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>

                        <div
                          style={{ display: "none" }}
                          className="doc-actions-drop global-menu"
                          id={doc.id}
                        >
                          <ul>
                            <li>
                              <button
                                title={langSupport[lang].delete}
                                className="not-button no-underline btn-left"
                                onClick={() => handleDelete(doc)}
                              >
                                <i className="far fa-trash-alt"></i>{" "}
                                {langSupport[lang].delete}
                              </button>
                            </li>
                            <li>
                              <button
                                className="not-button no-underline btn-left"
                                title={langSupport[lang].share}
                                onClick={() => handleShare(doc)}
                              >
                                <i className="fas fa-share-alt"></i>{" "}
                                {langSupport[lang].share}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <button className='not-button no-underline btn-left' onClick={() => handleLoadDoc(doc.id)}>
                        <h5>{doc.title ? doc.title : "Untitled"}</h5>
                      </button>

                      <div>
                        <ul className="tags">
                          {doc.tags !== null &&
                            doc.tags.length > 0 &&
                            doc.tags.map((tag) => {
                              return (
                                <li
                                  className="single-tag"
                                  key={tag.id}
                                  title={tag.name}
                                >
                                  {tag.name.length > 5
                                    ? `${tag.name.slice(0, 5)}...`
                                    : tag.name}{" "}
                                  <button
                                    className="not-button no-underline dark"
                                    onClick={() =>
                                      deleteTag(token, doc.id, tag.id)
                                    }
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </li>
                              );
                            })}
                        </ul>
                        <button
                          className="not-button no-underline dark add-tag"
                          onClick={() => openTagModal(doc)}
                        >
                          {langSupport[lang].add_tag}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/******** Dimmer ********/}
        <div
          style={{
            display:
              shareModalOpen || tagModalOpen || deleteModalOpen
                ? "block"
                : "none",
          }}
          className="dimmer"
        />

        {/******** Tag Modal ********/}
        <div
          style={{ display: tagModalOpen ? "block" : "none" }}
          className="modal"
        >
          <h3>{langSupport[lang].add_a_tag}</h3>
          <div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              type="text"
              placeholder={langSupport[lang].enter_tag_name}
            />
          </div>
          <button onClick={handleTag}>{langSupport[lang].add_tag}</button>
          <button
            onClick={() => setTagModalState(false)}
            className="btn-muted left-5"
          >
            {langSupport[lang].cancel}
          </button>
        </div>

        {/******** Delete Modal ********/}
        <div
          style={{ display: deleteModalOpen ? "block" : "none" }}
          className="modal"
        >
          <h3>
            {langSupport[lang].delete_confirm} <em>{docToDisplay.title}</em>?
          </h3>
          <p>{langSupport[lang].no_undo}</p>
          <button
            title={langSupport[lang].delete}
            className="btn-danger"
            onClick={confirmDelete}
          >
            <i className="far fa-trash-alt"></i> {langSupport[lang].delete}
          </button>
          <button
            onClick={() => setDeleteModalState(false)}
            className="btn-muted left-5"
          >
            {langSupport[lang].cancel}
          </button>
        </div>

        {/******** Share Modal ********/}
        <div
          style={{ display: shareModalOpen ? "block" : "none" }}
          className="modal"
        >
          <div>
            {fullLink ? (
              <div>
                <h3>{langSupport[lang].copy_link}</h3>
                <h5>{langSupport[lang].give_to}</h5>
                <p>{fullLink}</p>
                <p>
                  <strong>
                    <u>For security, this link will not be shown again.</u>
                  </strong>
                </p>
                <button onClick={closeShareModal} className="btn-muted left-5">
                  {langSupport[lang].done}
                </button>
              </div>
            ) : (
              <div>
                <h3>{langSupport[lang].share_with_link}</h3>
                <p>{langSupport[lang].share_encrypted}</p>
                <select onChange={(e) => setSharePermissions(e.target.value)}>
                  <option value="can-edit">{langSupport[lang].can_edit}</option>
                  <option value="can-view">{langSupport[lang].can_view}</option>
                </select>
                {docToDisplay && docToDisplay.id &&
                documents.filter((doc) => doc.id === docToDisplay.id)[0] && documents.filter((doc) => doc.id === docToDisplay.id)[0]
                  .shareLink ? (
                  <div>
                    <p>
                      {langSupport[lang].share_count_start}{" "}
                      <strong>
                        <u>
                          {
                            documents.filter(
                              (doc) => doc.id === docToDisplay.id
                            )[0].shareLink.length
                          }
                        </u>
                      </strong>{" "}
                      {documents.filter((doc) => doc.id === docToDisplay.id)[0] && documents.filter((doc) => doc.id === docToDisplay.id)[0].shareLink && documents.filter((doc) => doc.id === docToDisplay.id)[0].shareLink.length > 1
                        ? langSupport[lang].times
                        : langSupport[lang].time}
                      . {langSupport[lang].share_count_end}
                    </p>
                    <ul>
                      {documents
                        .filter((doc) => doc.id === docToDisplay.id)[0] && documents
                        .filter((doc) => doc.id === docToDisplay.id)[0]
                        .shareLink.map((link) => {
                          return (
                            <li key={link.shareId}>
                              {langSupport[lang].shared_on}:{" "}
                              {lang === "English"
                                ? moment(link.date).format("MM/DD/YYYY")
                                : moment(link.date).format("DD/MM/YYYY")}{" "}
                              <button
                                onClick={() => {
                                  removeSharedLinkAccess(
                                    token,
                                    docToDisplay,
                                    link
                                  );
                                }}
                                className="not-button"
                              >
                                Remove Access
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : (
                  <div />
                )}
                <button
                  title={langSupport[lang].share}
                  onClick={() => confirmShare(docToDisplay)}
                >
                  {langSupport[lang].share}
                </button>
                <button
                  onClick={() => setShareModalState(false)}
                  className="btn-muted left-5"
                >
                  {langSupport[lang].cancel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

Docs.propTypes = {
  auth: PropTypes.object.isRequired,
  docs: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  docs: state.docs,
  lang: state.lang,
});

export default connect(mapStateToProps, {
  logout,
  loadDocs,
  resetSingleDoc,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink,
  removeSharedLinkAccess,
})(withRouter(Docs));
