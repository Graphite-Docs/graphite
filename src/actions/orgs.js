import { setAlert } from "./alert";
import { setLoading, endLoading } from "./auth";
import { SET_ORG_DATA, SET_ORG_SELECTOR, SELECT_ORG } from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";
import {
  generateKeyPair,
  encryptData,
  decryptData,
  getPrivateKey,
} from "../utils/encryption";
const jwt = require("jsonwebtoken");

export const fetchOrgData = (orgData, token) => async (dispatch) => {
  //const localOrgData = localStorage.getItem('local_org_data');
  const selectedOrg = localStorage.getItem("selected_org");

  try {
    if (orgData.length > 1) {
      //  Fetch org data for each member org
      let orgs = [];
      for (const org of orgData) {
        const thisOrg = await dispatch(fetchOrg(org, token));

        //  @TODO: This is a good place to check for users that need their teamKeys created

        orgs.push(thisOrg);
      }

      dispatch({
        type: SET_ORG_DATA,
        payload: orgs,
      });

      //  Check if the user has already selected an org to view
      //  This would happen on log in and can be changed after log in
      if (!selectedOrg) {
        //  Display a UI modal to select the org
        dispatch({
          type: SET_ORG_SELECTOR,
          payload: true,
        });
      } else {
        dispatch({
          type: SELECT_ORG,
          payload: JSON.parse(selectedOrg),
        });
      }
    } else {
      // Fetch single org
      const org = await dispatch(fetchOrg(orgData[0], token));
      //  This is where we can update any users that need teamKeys added to their account
      const users = org.users;

      for (const user of users) {
        const userOrgs = user.organizations;
        const matchingOrg = userOrgs.filter(
          (o) => o.organization === org._id
        )[0];
        if (matchingOrg) {
          //  Check for teamKeys
          const teamKeys =
            matchingOrg.teamKeys && matchingOrg.teamKeys.privateKey
              ? true
              : false;
          const userPending = matchingOrg.pending;
          if (!teamKeys && userPending === false) {
            //  Get the user's public key so that we can encrypt the team key with it
            const thisUser = await dispatch(getUser(token, user));
            const { publicKey } = thisUser;

            //  Get the encrypted teamKey from state
            const decodedToken = await jwt.verify(
              token,
              process.env.REACT_APP_JWT_SECRET
            );

            if (user.email !== decodedToken.user.email) {
              const { organizations } = decodedToken.user;
              const thisOrg = organizations.filter(
                (o) => o.organization === org._id
              )[0];
              const teamKeys = thisOrg.teamKeys;
              const encryptedTeamKey = teamKeys.privateKey;

              //  Decrypt the team private key with the logged in user's own private key
              const userPrivKey = getPrivateKey();
              const teamPrivateKey = decryptData(
                userPrivKey,
                JSON.stringify(encryptedTeamKey)
              );

              //  Encrypt the team private key with the new user's public key
              const newUserEncryptedKey = encryptData(
                publicKey,
                teamPrivateKey
              );
              const teamKeyPayload = {
                email: user.email,
                name: user.name,
                role: user.organizations.filter(
                  (o) => o.organization === org._id
                )[0].role,
                pending: false,
                teamKeys: {
                  publicKey: teamKeys.publicKey,
                  privateKey: newUserEncryptedKey,
                },
              };

              //  Need to set the header with Authorization
              config.headers["Authorization"] = `Bearer ${token}`;

              await axios.post(
                `${URL}/v1/organizations/${org._id}/users`,
                JSON.stringify(teamKeyPayload),
                config
              );
            }
          }
        }
      }

      let orgs = [];
      orgs.push(org);
      dispatch({
        type: SET_ORG_DATA,
        payload: orgs,
      });
      dispatch({
        type: SELECT_ORG,
        payload: org,
      });
    }
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const fetchOrg = (org, token) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    try {
      //  Need to set the header with Authorization
      config.headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(
        `${URL}/v1/organizations/${org.organization}`,
        config
      );

      resolve(res.data);
    } catch (error) {
      console.log(error.message);
      dispatch(setAlert(error.message, "error"));
      reject(error);
    }
  });
};

export const selectOrg = (org) => async (dispatch) => {
  dispatch({
    type: SELECT_ORG,
    payload: org,
  });
  dispatch({
    type: SET_ORG_SELECTOR,
    payload: false,
  });

  localStorage.setItem("selected_org", JSON.stringify(org));
};

export const createOrg = (org, token, pubKey) => async (dispatch) => {
  dispatch(setLoading);

  try {
    //  Need to create an encryption key that will be shared across the team
    const keypair = await generateKeyPair();
    const encryptedTeamKey = encryptData(pubKey, keypair.privateKey);

    const teamKeys = {
      publicKey: keypair.publicKey,
      privateKey: encryptedTeamKey,
    };

    org["teamKeys"] = teamKeys;

    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post(
      `${URL}/v1/organizations`,
      JSON.stringify(org),
      config
    );

    const thisOrg = await dispatch(
      fetchOrg({ organization: res.data._id }, token)
    );
    let orgs = [];
    orgs.push(thisOrg);
    dispatch({
      type: SET_ORG_DATA,
      payload: orgs,
    });
    dispatch({
      type: SELECT_ORG,
      payload: thisOrg,
    });
  } catch (error) {
    console.log(error.message);
    dispatch(setAlert(error.message, "error"));
    dispatch(endLoading);
  }
};

export const updateOrg = (token, updatedOrg) => async (dispatch) => {
  dispatch(setAlert("Updating", "success"));
  try {
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.put(
      `${URL}/v1/organizations/${updatedOrg.id}`,
      JSON.stringify(updatedOrg),
      config
    );
    const thisOrg = await dispatch(
      fetchOrg({ organization: res.data._id }, token)
    );

    dispatch({
      type: SELECT_ORG,
      payload: thisOrg,
    });
    dispatch(setAlert("Updated!", "success"));
  } catch (error) {
    console.log(error);
    dispatch(error.message, "error");
  }
};

export const addUser = (token, org, user, teamKeyPair) => async (dispatch) => {
  try {
    const newUserObj = {
      name: user.userName,
      email: user.userEmail,
      role: user.userRole,
      pending: teamKeyPair ? false : true,
      teamKeys: teamKeyPair,
    };
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post(
      `${URL}/v1/organizations/${org._id}/users`,
      JSON.stringify(newUserObj),
      config
    );

    //  Check if there is a public key returned in the payload
    //  If so, we need to send the same request again with the team key encrypted with the user's
    //  public key
    const { key } = res.data;
    let teamKeys;
    if (key) {
      let decodedToken = await jwt.verify(
        token,
        process.env.REACT_APP_JWT_SECRET
      );

      const thisUser = org.users.filter(
        (u) => u._id === decodedToken.user.id
      )[0];
      const thisOrg = thisUser.organizations.filter(
        (o) => o.organization === org._id
      )[0];

      const { publicKey, privateKey } = thisOrg.teamKeys;

      const userKey = getPrivateKey();
      const decryptedKey = decryptData(userKey, JSON.stringify(privateKey)); //decryptData(userKey, privateKey);
      const encryptedPrivateKey = encryptData(
        decodedToken.user.publicKey,
        JSON.stringify(decryptedKey)
      );
      teamKeys = {
        publicKey,
        privateKey: encryptedPrivateKey,
      };
      dispatch(addUser(token, org, user, teamKeys));
    } else {
      const thisOrg = await dispatch(
        fetchOrg({ organization: res.data._id }, token)
      );
      dispatch({
        type: SELECT_ORG,
        payload: thisOrg,
      });
      dispatch(setAlert("Updated!", "success"));
    }
  } catch (error) {
    console.log(error);
    setAlert(error.message, "error");
  }
};

export const deleteUser = (token, org, user) => async (dispatch) => {
  try {
    const encodedEmail = encodeURIComponent(user);
    const res = await axios.delete(
      `${URL}/v1/organizations/${org._id}/users/${encodedEmail}`,
      config
    );
    const thisOrg = await dispatch(
      fetchOrg({ organization: res.data._id }, token)
    );
    dispatch({
      type: SELECT_ORG,
      payload: thisOrg,
    });
    dispatch(setAlert("Updated!", "success"));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const getUser = (token, user) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    try {
      config.headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${URL}/v1/auth/user/${user._id}`, config);
      resolve(res.data);
    } catch (error) {
      console.log(error);
      dispatch(setAlert(error.message, "error"));
      reject(error);
    }
  });
};
