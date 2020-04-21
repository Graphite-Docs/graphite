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
  deleteTag,
} from "../../actions/docs";
import { shareDocWithLink } from "../../actions/sharedDocs";
import { v4 as uuidv4 } from "uuid";
import Loader from "../Loader";
import Navbar from "../Navbar";
const langSupport = require("../../utils/languageSupport.json");

const Docs = ({
  logout,
  loadDocs,
  newDocument,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink,
  auth: { token, user, loading },
  docs: { documents },
  history,
  lang,
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
    const { id, title, contentUrl } = doc;
    shareDocWithLink(token, user, { id, title, contentUrl });
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
              {documents.map((doc) => {
                return (
                  <div className="column" key={doc.id}>
                    <div className="card card-medium">
                      <div onClick={() => handleLoadDoc(doc.id)}>
                        <h5>{doc.title ? doc.title : "Untitled"}</h5>
                      </div>
                      <span>
                        Tags:
                        {doc.tags !== null &&
                          doc.tags.length > 0 &&
                          doc.tags.map((tag) => {
                            return (
                              <span key={tag.id}>
                                {tag.name},{" "}
                                <button
                                  onClick={() =>
                                    deleteTag(token, doc.id, tag.id)
                                  }
                                >
                                  {langSupport[lang].delete_tag}
                                </button>
                              </span>
                            );
                          })}
                        <span>
                          <button onClick={() => addTag(doc.id)}>
                            {langSupport[lang].add_tag}
                          </button>
                        </span>
                      </span>
                      <span>
                        <button onClick={() => deleteDoc(token, doc.id)}>
                          {langSupport[lang].delete}
                        </button>
                      </span>
                      <span>
                        <button onClick={() => shareDocLink(doc)}>
                          {langSupport[lang].share}
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
  newDocument,
  deleteDoc,
  addNewTag,
  deleteTag,
  shareDocWithLink,
})(withRouter(Docs));
