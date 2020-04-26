import { setAlert } from "./alert";
import { SHARE_LINK, LOAD_SHARED_DOC, LOAD_DOC } from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";
import { encryptData, decryptData, getPrivateKey } from "../utils/encryption";
import { PrivateKey } from "eciesjs";
import { v4 as uuidv4 } from "uuid";
import { loadDocs, loadDoc } from "./docs";
const jwt = require("jsonwebtoken");

export const shareDocWithLink = (token, user, doc) => async (dispatch) => {
  try {
    //  Fetch the document

    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${URL}/v1/documents/${doc.id}`, config);
    const { content } = res.data;
    const privateKeyA = getPrivateKey();
    const decryptedContent = decryptData(privateKeyA, content);

    //  Generate encryption keys
    const privateKeyB = new PrivateKey();
    const privKey = privateKeyB.toHex();
    const publicKey = privateKeyB.publicKey.toHex();

    //  Encrypt content with newly generated pubKey
    const encryptedContent = encryptData(publicKey, decryptedContent);

    //  Post the encrypted content to the sharedLink section of the document model
    const payload = {
      shareId: uuidv4(),
      content: encryptedContent,
    };
    await axios.put(
      `${URL}/v1/documents/shared-link/${doc.id}`,
      JSON.stringify(payload),
      config
    );
    //  Encode keypair and doc info in a jwt
    const docInfo = {
      shareId: payload.shareId,
      from: user.id,
      id: doc.id,
      publicKey,
      privateKey: privKey,
    };

    const sharedToken = await jwt.sign(
      docInfo,
      process.env.REACT_APP_JWT_SECRET
    );

    //  Generate share link
    dispatch({
      type: SHARE_LINK,
      payload: sharedToken,
    });

    //  Now if doc is supposed to be readOnly, flip access immediately
    if (doc.readOnly) {
      dispatch(changeSharedLinkAccess(token, doc, docInfo));
    }

    //  Refresh our document index with updated data from server
    dispatch(loadDocs(token));

    //  If the share request came from within an open document, make sure to update the document
    if(window.location.href.includes('documents/')) {
      dispatch(loadDoc(token, doc.id));
    }
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const removeSharedLinkAccess = (token, document, link) => async (
  dispatch
) => {
  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.delete(
      `${URL}/v1/documents/shared-link/${link.shareId}/${document.id}`,
      config
    );

    const singleDoc = res.data;
    singleDoc.content = document.content;

    dispatch({
      type: LOAD_DOC,
      payload: singleDoc,
    });

    dispatch(loadDocs(token));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const changeSharedLinkAccess = (token, document, link) => async (
  dispatch
) => {
  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.put(
      `${URL}/v1/documents/shared-link/${link.shareId}/${document.id}`,
      null,
      config
    );

    const singleDoc = res.data;
    singleDoc.content = document.content;

    dispatch({
      type: LOAD_DOC,
      payload: singleDoc,
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const loadSharedDoc = (token) => async (dispatch) => {
  try {
    //  Decode and verify token
    const decodedToken = await jwt.verify(
      token,
      process.env.REACT_APP_JWT_SECRET
    );

    const { id, from, privateKey, shareId } = decodedToken;

    //  Load document
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(
      `${URL}/v1/documents/shared/${shareId}/${id}`,
      config
    );

    //  Decrypt content
    const { content, title, readOnly } = res.data;
    const decryptedContent = decryptData(privateKey, content);
    const document = {
      id,
      title,
      content: decryptedContent,
      from,
      readOnly,
    };
    dispatch({
      type: LOAD_SHARED_DOC,
      payload: document,
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const updateSharedDoc = (token, doc) => (dispatch) => {
  //
};
