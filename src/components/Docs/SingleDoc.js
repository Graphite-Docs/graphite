import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { saveDoc, loadDoc, setSaving } from "../../actions/docs";
import {
  shareDocWithLink,
  removeSharedLinkAccess,
  changeSharedLinkAccess,
} from "../../actions/sharedDocs";
import { Editor } from "@tinymce/tinymce-react";
const moment = require("moment");
let timeoutId;

const SingleDoc = ({
  auth: { user, token },
  docs: { singleDoc, newDoc, saving, loading },
  loadDoc,
  saveDoc,
  setSaving,
  removeSharedLinkAccess,
  changeSharedLinkAccess,
}) => {
  const [id, setId] = useState(window.location.href.split("documents/")[1]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  useEffect(() => {
    if (!newDoc) {
      loadDoc(token, id);
    }

    setId(window.location.href.split("documents/")[1]);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (singleDoc) {
      const { content } = singleDoc;
      setContent(content);
      setTitle(title);
    }
    //eslint-disable-next-line
  }, [singleDoc]);

  const handleEditorChange = (content, editor) => {
    if (!saving) {
      setSaving();
    }

    setContent(content);
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

  const shareDocLink = () => {
    // const document = {
    //   id, title, contentUrl
    // }
    // shareDocWithLink(token, user, {id, title, contentUrl});
  };

  const removeAccess = (link) => {
    removeSharedLinkAccess(token, singleDoc, link);
  };

  const changeAccess = (link) => {
    changeSharedLinkAccess(token, singleDoc, link);
  };

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <button onClick={shareDocLink}>Share</button>
        <div>
          {singleDoc &&
            singleDoc.shareLink &&
            singleDoc.shareLink.map((link) => {
              return (
                <span key={link.shareId}>
                  {moment(link.date).format("MM/DD/YYYY")}
                  <button onClick={() => changeAccess(link)}>
                    {link.readOnly ? "Make editable" : "Make read only"}
                  </button>
                  <button onClick={() => removeAccess(link)}>Delete</button>
                </span>
              );
            })}
        </div>
        <Editor
          apiKey={process.env.REACT_APP_TINY_MCE}
          initialValue={content}
          value={content}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
            external_plugins: singleDoc && singleDoc.shareLink.length > 0 ? {
              wave: "https://cdn2.codox.io/waveTinymce/plugin.min.js"
            } : null,
            wave: singleDoc && singleDoc.shareLink.length > 0 ? {
              docId: singleDoc && singleDoc.id ? singleDoc.id : 'loading...',
              username: user.name ? user.name : "Someone",
              apiKey: process.env.REACT_APP_WAVE_KEY,
              avatar: { vertical: true },
            } : null,
          }}
          onEditorChange={handleEditorChange}
        />
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
});

export default connect(mapStateToProps, {
  saveDoc,
  loadDoc,
  setSaving,
  shareDocWithLink,
  removeSharedLinkAccess,
  changeSharedLinkAccess,
})(SingleDoc);
