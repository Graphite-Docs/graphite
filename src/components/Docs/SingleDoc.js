import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { saveDoc, loadDoc, setSaving, resetSingleDoc } from "../../actions/docs";
import {
  shareDocWithLink,
  removeSharedLinkAccess,
} from "../../actions/sharedDocs";
import { Editor } from "@tinymce/tinymce-react";
const langSupport = require("../../utils/languageSupport.json");
const moment = require("moment");
let timeoutId;

const SingleDoc = ({
  auth: { user, token },
  docs: { singleDoc, saving, loading, shareLink },
  loadDoc,
  saveDoc,
  setSaving,
  resetSingleDoc,
  lang,
  removeSharedLinkAccess,
  shareDocWithLink,
  history
}) => {
  const [id, setId] = useState(window.location.href.split("documents/")[1]);
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("<p></p>");
  const [shareModalOpen, setShareModalState] = useState(false);
  const [sharePermissions, setSharePermissions] = useState("can-edit");
  const [fullLink, setFullLink] = useState(null);
  useEffect(() => {
    loadDoc(user, token, id);
    setId(window.location.href.split("documents/")[1]);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (singleDoc) {
      const updateTitle = singleDoc.title && singleDoc.title !== "";
      if(updateTitle) {
        setTitle(singleDoc.title);    
      } 
      
      const updateContent = singleDoc.content && singleDoc.content !== "";
      if(updateContent) {
        setContent(singleDoc.content);
      }
    }
  }, [singleDoc]);

  useEffect(() => {
    if (singleDoc && singleDoc.title !== title) {
      saveTimer();
    }
    //  eslint-disable-next-line
  }, [title]);

  useEffect(() => {
    if (singleDoc && singleDoc.content !== content) {
      saveTimer();
    }
    //  eslint-disable-next-line
  }, [content]);

  useEffect(() => {
    if (shareLink) {
      //  construct the actual share link:
      const rootUrl = window.location.origin;
      const path = "/shared/link/";
      const fullLink = rootUrl + path + shareLink;
      setFullLink(fullLink);
    }
  }, [shareLink]);

  const handleEditorChange = (content, editor) => {
    if (!saving) {
      setSaving();
    }
    setContent(content);
  };

  const handleTitleChange = async (e) => {
    if (!saving) {
      setSaving();
    }
    const updatedTitle = e.target.value;
    setTitle(updatedTitle);
  };

  const saveTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Runs 3 seconds (3000 ms) after the last change
      const docToSave = {
        title,
        id,
        content,
      };
      saveDoc(token, user, docToSave);
    }, 3000);
  };

  const closeShareModal = () => {
    setShareModalState(false);
    setFullLink(null);
  };

  const confirmShare = (doc) => {
    doc["readOnly"] = sharePermissions === "can-edit" ? false : true;
    const { id, title, contentUrl, readOnly } = doc;
    shareDocWithLink(token, user, { id, title, contentUrl, readOnly });
  };

  const handleBack = () => {
    history.push(`/`);
    resetSingleDoc()
  }

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <div className="doc-title">
          <button onClick={handleBack} className='not-button no-underline btn-left' to="/">
            <i className="fas fa-arrow-left"></i>
          </button>
          <input
            type="text"
            onChange={handleTitleChange}
            value={title}
            placeholder="Your title"
          />
          {saving ? "Saving..." : "Saved"}
        </div>
        <Editor
          id="tiny-editor"
          apiKey={process.env.REACT_APP_TINY_MCE}
          initialValue={content}
          value={content}
          init={{
            branding: false,
            content_style: window.innerWidth > 700 ? 'body { padding-top: 25px; padding-bottom: 25px; padding-left: 105px; padding-right: 105px; }' : 'body {}',
            height: "100vh",
            plugins: [
              "advlist autolink lists link image charmap print preview anchor pagebreak searchreplace",
              "searchreplace visualblocks code fullscreen formatpainter spellchecker hr toc",
              "insertdatetime media table paste code help wordcount quickbars directionality",
            ],
            menu: {
              custom: { title: "Share", items: "shareItem" },
            },
            menubar: "file edit insert format tools custom",
            setup: (editor) => {
              editor.ui.registry.addMenuItem("shareItem", {
                text: "Share With Link",
                onAction: () => setShareModalState(true),
              });
            },
            removed_menuitems: "newdocument",
            toolbar:
              "undo redo | print | formatpainter | formatselect | fontselect | fontsizeselect | bold italic backcolor | forecolor | link | quickimage | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | spellchecker | ltr rtl",            
          }}
          onEditorChange={handleEditorChange}
        />

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
                {singleDoc && singleDoc.id && singleDoc.shareLink ? (
                  <div>
                    <p>
                      {langSupport[lang].share_count_start}{" "}
                      <strong>
                        <u>{singleDoc.shareLink.length}</u>
                      </strong>{" "}
                      {singleDoc.shareLink.length > 1
                        ? langSupport[lang].times
                        : langSupport[lang].time}
                      . {langSupport[lang].share_count_end}
                    </p>
                    <ul>
                      {singleDoc.shareLink.map((link) => {
                        return (
                          <li key={link.shareId}>
                            {langSupport[lang].shared_on}:{" "}
                            {lang === "English"
                              ? moment(link.date).format("MM/DD/YYYY")
                              : moment(link.date).format("DD/MM/YYYY")}{" "}
                            <button
                              onClick={() => {
                                removeSharedLinkAccess(token, singleDoc, link);
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
                  onClick={() => confirmShare(singleDoc)}
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

SingleDoc.propTypes = {
  auth: PropTypes.object.isRequired,
  docs: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  docs: state.docs,
  lang: state.lang,
});

export default connect(mapStateToProps, {
  saveDoc,
  loadDoc,
  setSaving,
  shareDocWithLink,
  removeSharedLinkAccess,
  resetSingleDoc
})(SingleDoc);
