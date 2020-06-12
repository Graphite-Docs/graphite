import { setAlert } from "./alert";
import { SHARE_LINK, LOAD_SHARED_DOC, LOAD_DOC } from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";
import { encryptData, decryptData, getPrivateKey } from "../utils/encryption";
import { PrivateKey } from "eciesjs";
import { v4 as uuidv4 } from "uuid";
import { loadDocs, loadDoc, saveDoc } from "./docs";
const jwt = require("jsonwebtoken");

export const shareDocWithLink = (token, user, doc) => async (dispatch) => {
  try {
    //  Fetch the document

    const res = await fetchDocument(token, doc);

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
    if (window.location.href.includes("documents/")) {
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

export const shareDocWithTeam = (token, doc, org, access) => async (
  dispatch
) => {
  //  0. Fetch doc content
  //  1. Determined if document is already a team document
  //  2. Determine if user is owner
  //  3. Encrypt the document with the teamKey
  //  4. Update the user (owner's) document to reflect that it is shared (if nec)
  //  5. Set the ACL to include all team members
  //  6. Post to normal doc endpoint and sharedDoc endpoint
  try {
    //  Fetch document
    const res = await fetchDocument(token, doc);
    const { content, document } = res.data;
    //  To determine if a team document was returned or if the owner's doc was
    //  we need to check if the document has a teamDocID or if it has an access list
    const isTeamDoc = document.teamDocId || document.access ? true : false;

    const decodedToken = await jwt.verify(
      token,
      process.env.REACT_APP_JWT_SECRET
    );

    const { user } = decodedToken;
    const thisTeam = user.organizations.filter(
      (o) => o.organization === org._id
    )[0];

    if (!thisTeam) {
      return dispatch(setAlert("Error matching team", "error"));
    }

    const userPrivateKey = getPrivateKey();

    const teamPrivateKeyEncrypted = thisTeam.teamKeys.privateKey;
    const teamPrivateKey = decryptData(
      userPrivateKey,
      JSON.stringify(teamPrivateKeyEncrypted)
    );

    let decryptedContent;
    
    if (isTeamDoc) {
      //  Need to decrypt the content with the team key      
      decryptedContent = decryptData(teamPrivateKey, content);
    } else {
      //  Need to decrypt the content with the user's private key
      decryptedContent = decryptData(userPrivateKey, content);
    }

    //  Now add the content to the document object
    //  and add the teamContent
    document["content"] = decryptedContent;
    document['teamContent'] = decryptedContent

    //  Add the access property as well
    document["access"] = access;

    //  Finally, add a boolean to indicate it's a team doc
    document['teamDoc'] = true;

    

    const teamPublicKey = thisTeam.teamKeys.publicKey;

    document['teamPublicKey'] = teamPublicKey;

    dispatch(saveDoc(token, user, document, org._id));
    dispatch(setAlert('Document shared', 'success'));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const fetchDocument = async (token, doc, orgId) => {
  try {
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${URL}/v1/documents/${doc.id}`, config);
    return res;
  } catch (error) {
    return error;
  }
};
