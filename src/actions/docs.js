import { setAlert } from "./alert";
import {
  DOC_ERROR,
  LOAD_INDEX,
  LOAD_DOC,
  SAVING,
  SAVED_DOC,
  DELETE_DOC,
  NEW_DOC, 
  LOADING, 
  RESET_SINGLE
} from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";
import { encryptData, decryptData, getPrivateKey } from "../utils/encryption";
import work from "webworkify-webpack";

export const resetSingleDoc = () => dispatch => {
  dispatch({
    type: RESET_SINGLE
  })
}

export const setSaving = () => async (dispatch) => {
  //  For the UI to indicate the doc is being saved
  dispatch({
    type: SAVING,
  });
};

export const loadDocs = (token) => async (dispatch) => {
  try {
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${URL}/v1/documents`, config);
    dispatch({
      type: LOAD_INDEX,
      payload: res.data,
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
    dispatch({
      type: DOC_ERROR,
    });
  }
};

export const newDocument = (token, user, newDoc) => async (dispatch) => {
  const { publicKey } = user;
  dispatch({
    type: NEW_DOC,
  });
  try {
    //  Encrypt the content before sending it to the server
    const encryptedContent = encryptData(publicKey, newDoc.content);
    const documentForServer = {
      id: newDoc.id,
      title: newDoc.title,
      content: encryptedContent,
    };

    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    await axios.post(
      `${URL}/v1/documents`,
      JSON.stringify(documentForServer),
      config
    );
    dispatch({
      type: SAVED_DOC,
      payload: { singleDoc: newDoc },
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const loadDoc = (user, token, doc_id, org) => async (dispatch) => {
  try {
    //  So that we don't load the document UI too soon.
    dispatch({
      type: LOADING
    })
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${URL}/v1/documents/${doc_id}`, config);
    const { document, content } = res.data;
    
    //  Decrypt content
    const privateKey = getPrivateKey();
    const encryptedContent = content;
    const decryptedData = decryptData(privateKey, encryptedContent);

    let decryptedDoc = document;
    decryptedDoc['content'] = decryptedData;
    
    dispatch({
      type: LOAD_DOC,
      payload: decryptedDoc,
    });
  } catch (error) {
    console.log(error.message);
    if(error.message.includes("404")) {
      console.log('No document found, assuming this is new and creating...');

      const newDoc = {
        id: doc_id,
        title: "Untitled",
        content: "",
      };

      dispatch(newDocument(token, user, newDoc));
    }    
  }
};

export const saveDoc = (token, user, document, orgId) => async (dispatch) => {
  const { publicKey } = user;

  try {
    let w = work(require.resolve("../utils/worker.js"));
    w.addEventListener("message", function (e) {
      dispatch({
        type: SAVED_DOC,
        payload: e.data,
      });
    });
    w.postMessage(JSON.stringify({ token, publicKey, document, orgId }));
  } catch (error) {
    console.log(error);
    setAlert(error.message, "error");
  }
};

export const deleteDoc = (token, id) => async (dispatch) => {
  try {
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.delete(`${URL}/v1/documents/${id}`, config);

    dispatch({
      type: DELETE_DOC,
      payload: res.data,
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const addNewTag = (token, doc_id, tag) => async (dispatch) => {
  try {
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;
    await axios.put(
      `${URL}/v1/documents/tags/${doc_id}`,
      JSON.stringify(tag),
      config
    );
    dispatch(loadDocs(token));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const deleteTag = (token, doc_id, tag_id) => async (dispatch) => {
  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    await axios.delete(`${URL}/v1/documents/tags/${doc_id}/${tag_id}`, config);
    dispatch(loadDocs(token));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};