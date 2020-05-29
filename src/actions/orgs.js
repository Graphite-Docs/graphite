import { setAlert } from "./alert";
import { setLoading, endLoading } from "./auth";
import { SET_ORG_DATA, SET_ORG_SELECTOR, SELECT_ORG } from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";
import { generateKeyPair, encryptData } from "../utils/encryption";

export const fetchOrgData = (orgData, token) => async (dispatch) => {
  //const localOrgData = localStorage.getItem('local_org_data');
  const selectedOrg = localStorage.getItem("selected_org");

  try {
    if (orgData.length > 1) {
      //  Fetch org data for each member org
      let orgs = [];
      for (const org of orgData) {
        const thisOrg = await dispatch(fetchOrg(org, token));
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
      privateKey: encryptedTeamKey
    }
    console.log(teamKeys)
    org['teamKeys'] = teamKeys;
    
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

export const updateOrg = (token, updatedOrg) => async dispatch => {
  dispatch(setAlert('Updating', 'success'));
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
    dispatch(setAlert('Updated!', 'success'));
  } catch (error) {
    console.log(error);
    dispatch(error.message, 'error');
  }  
}

export const addUser = (token, org, user) => async dispatch => {
  console.log(org, user)
  try {
    const newUserObj = {
      name: user.userName, 
      email: user.userEmail, 
      role: user.userRole, 
      pending: true
    }
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post(
      `${URL}/v1/organizations/${org._id}/users`,
      JSON.stringify(newUserObj),
      config
    );
    const thisOrg = await dispatch(
      fetchOrg({ organization: res.data._id }, token)
    );
    dispatch({
      type: SELECT_ORG,
      payload: thisOrg,
    });
    dispatch(setAlert('Updated!', 'success'));
  } catch (error) {
    console.log(error);
    setAlert(error.message, 'error');
  }
}

export const updateUser = (token, org, user) => async dispatch => {
  
}
