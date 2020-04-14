import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logout } from "../../actions/auth";
import {
  loadDocs,
  newDocument,
  deleteDoc,
  addNewTag,
  deleteTag
} from "../../actions/docs";
import { shareDocWithLink } from '../../actions/sharedDocs';
import { v4 as uuidv4 } from "uuid";

const Docs = ({
  logout,
  loadDocs,
  newDocument,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink,
  auth: { token, user },
  docs: { documents },
  history,
}) => {
  useEffect(() => {
    loadDocs(token);
    //eslint-disable-next-line
  }, []);

  const handleNewDoc = () => {
    const id = uuidv4();
    const newDoc = {
      id,
      title: "Untitled",
      content: "",
    };

    newDocument(token, user, newDoc);

    history.push(`/documents/${id}`);
  };

  const handleLoadDoc = (id) => {
    history.push(`/documents/${id}`);
  };

  const addTag = (id) => {
    const tagId = uuidv4();
    const tagName = uuidv4();
    addNewTag(token, id, { tagId, tagName });
  };

  const shareDocLink = (doc) => {
    
    const {
      id, title, contentUrl
    } = doc;
    shareDocWithLink(token, user, {id, title, contentUrl});
  }

  return (
    <div>
      Docs
      <button onClick={logout}>Log out</button>
      <h3>
        Your documents{" "}
        <span>
          <button onClick={handleNewDoc}>New</button>
        </span>
      </h3>
      <ul>
        {documents.map((doc) => {
          return (
            <li key={doc.id}>
              <span>
                <span onClick={() => handleLoadDoc(doc.id)}>
                  {doc.title ? doc.title : "Untitled"}
                </span>
                <span>
                  Tags:
                  {doc.tags !== null &&
                    doc.tags.length > 0 &&
                    doc.tags.map((tag) => {
                      return (
                        <span key={tag.id}>
                          {tag.name},{" "}
                          <button
                            onClick={() => deleteTag(token, doc.id, tag.id)}
                          >
                            Delete Tag
                          </button>
                        </span>
                      );
                    })}
                  <span>
                    <button onClick={() => addTag(doc.id)}>Add Tag</button>
                  </span>
                </span>
                <span>
                  <button onClick={() => deleteDoc(token, doc.id)}>
                    Delete
                  </button>
                </span>
                <span>
                  <button onClick={() => shareDocLink(doc)}>
                    Share
                  </button>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

Docs.propTypes = {
  auth: PropTypes.object.isRequired,
  docs: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  docs: state.docs,
});

export default connect(mapStateToProps, {
  logout,
  loadDocs,
  newDocument,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink
})(withRouter(Docs));
