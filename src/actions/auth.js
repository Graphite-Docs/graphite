import { setAlert } from "./alert";
import { fetchOrgData } from './orgs';
import { setLang } from './lang';

import {
  LOGIN_SUCCESS,
  LOGIN_VALIDATED,
  REGISTRATION_SUCCESS,
  REGISTRATION_VALIDATED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOG_OUT,
  LOADING
} from "../actions/types";
import { URL, config } from '../utils/api';
import axios from "axios";
import { PrivateKey } from 'eciesjs';
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const stripe = window.Stripe('pk_test_f017dq0VLdzf22LXPBsLvuDO');

export const checkPaymentStatus = () => async dispatch => {
  try {
    const token = localStorage.getItem('token');
  
    let decodedToken = await jwt.verify(
      token,
      process.env.REACT_APP_JWT_SECRET
    );

    const { user } = decodedToken;
    
    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.get(`${URL}/v1/auth/verifyPayment/${user.id}`, config);
    
    if(res.data.payment) {
      decodedToken.user.subscription = true
    }

    const newToken = await jwt.sign(
      decodedToken,
      process.env.REACT_APP_JWT_SECRET)
    
    dispatch({
      type: LOGIN_VALIDATED, 
      payload: { token: newToken, user: decodedToken.user, paymentMade: res.data.payment }
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, 'error'));
  }
}

export const handleSubscription = (user) => async dispatch => {
  stripe.redirectToCheckout({
    items: [{plan: 'plan_H6xaa4agkqE6CG', quantity: 1}],
    clientReferenceId: user.id,

    // Do not rely on the redirect to the successUrl for fulfilling
    // purchases, customers may not always reach the success_url after
    // a successful payment.
    // Instead use one of the strategies described in
    // https://stripe.com/docs/payments/checkout/fulfillment
    successUrl: window.location.protocol + '//localhost:3000/success',
    cancelUrl: window.location.protocol + '//localhost:3000/canceled',
  })
  .then(function (result) {
    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer.
      dispatch(setAlert(result.error, 'error'));
    }
  });
}

export const register = (name, email) => async (dispatch) => {
  try {
    const body = {
      name,
      email,
    };
    const res = await axios.post(
      `${URL}/v1/auth/register`,
      JSON.stringify(body),
      config
    );

    dispatch({
      type: REGISTRATION_SUCCESS,
      payload: res.data.token,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
    console.log(error);

    const errors = error.response.data.errors;

    if (errors) {
      for (const error of errors) {
        dispatch(setAlert(error.msg, "error"));
      }
    } else {
      dispatch(setAlert(error.message, "error"));
    }
  }
};

export const validateRegistration = (password, token) => async (dispatch) => {
  //  User will set their password on the screen displayed when the validation email is clicked
  //  We will pass through the token and the password but we will not store the password
  //  Decode token
  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.REACT_APP_JWT_SECRET
    );

    const { user } = decodedToken;

    //  Grab auth check data
    const { email, data } = user;

    //  Password encrypt auth check data
    const ciphertextForAuthData = CryptoJS.AES.encrypt(
      data,
      password
    ).toString();

    //  Generate keypair
    const privateKey = new PrivateKey();
    const privKey = privateKey.toHex();
    const publicKey = privateKey.publicKey.toHex();

    //  Password encrypt private key
    const ciphertextForPrivKey = CryptoJS.AES.encrypt(
      privKey,
      password
    ).toString();
    
    const payload = {
      email,
      data: ciphertextForAuthData,
      publicKey: publicKey,
      privateKey: ciphertextForPrivKey,
    };

    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post(
      `${URL}/v1/auth/register/validate`,
      JSON.stringify(payload),
      config
    );
    
    const encryptedPrivKey = CryptoJS.AES.encrypt(privKey, process.env.REACT_APP_KEY_ENCRYPTION_SECRET).toString();
    user.privateKey = encryptedPrivKey;

    dispatch({
      type: REGISTRATION_VALIDATED,
      payload: { token: res.data.token, user, paymentMade: false },
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }

  //  Post back to server object with: email, encrypted validation data, encrypted privateKey, unencrypted public key
};

export const login = (email, password) => async (dispatch) => {
  let res;
  try {
    const body = {
      email,
    };
    res = await axios.post(
      `${URL}/v1/auth/login`,
      JSON.stringify(body),
      config
    );

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data.token,
    });

    dispatch(validateLogin(res.data.token, password));
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
    });
    console.log(error);
    dispatch(setAlert('Check your email or password', "error"));
  }
};

export const validateLogin = (token, password) => async (dispatch) => {
  //  Decode token
  const decodedToken = await jwt.verify(
    token,
    process.env.REACT_APP_JWT_SECRET
  );

  const { user } = decodedToken;

  //  Grab auth check data
  const { data, email,  } = user;

  try {
    //  Password decrypt auth check data
    const bytes = CryptoJS.AES.decrypt(data, password);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    //  Post back to server to validate authentication

    //  Need to set the header with Authorization
    config.headers["Authorization"] = `Bearer ${token}`;
    const body = {
      email,
      data: decryptedData,
    };
    const res = await axios.post(
      `${URL}/v1/auth/login/validate`,
      JSON.stringify(body),
      config
    );

    //  Need to decrypt the private key with the password here
    try {
      //  Token returned from successful validation is different
      const newToken = res.data.token;
      const newDecodedToken = await jwt.verify(
        newToken,
        process.env.REACT_APP_JWT_SECRET
      );
      
      const updatedUser = newDecodedToken.user;

      const privKeyBytes = await CryptoJS.AES.decrypt(updatedUser.privateKey, password);
      const decryptedPrivKey = privKeyBytes.toString(CryptoJS.enc.Utf8);

      const reEncryptedPrivKey = CryptoJS.AES.encrypt(decryptedPrivKey, process.env.REACT_APP_KEY_ENCRYPTION_SECRET).toString();

      updatedUser.privateKey = reEncryptedPrivKey;

      const orgData = updatedUser.organizations;

      dispatch({
        type: LOGIN_VALIDATED,
        payload: { token: res.data.token, user: updatedUser, paymentMade: user.subscription },
      });

      if(orgData.length > 0) {
        dispatch(fetchOrgData(orgData, token));
      }
    } catch (error) {
      console.log(error);
      dispatch(setAlert(error.message, 'error'))
    }
  } catch (error) {
    console.log(error);
    dispatch(setAlert("Incorrect password", "error"));
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: LOG_OUT });
};

export const loadUser = () => async (dispatch) => {
  //  Get the user's lang if it's in local storage
  const lang = localStorage.getItem('graphite_lang');
  if(lang) {
    dispatch(setLang(lang));
  }

  try {

    const token = localStorage.getItem('token');
    
    const key = localStorage.getItem('key');

    if(token) {
      const decodedToken = await jwt.verify(
        token,
        process.env.REACT_APP_JWT_SECRET
      );
    
      let { user, exp } = decodedToken;
      let orgData;
      if (Date.now() >= exp * 1000) {
        dispatch({ type: AUTH_ERROR });
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
        const res = await axios.get(
          `${URL}/v1/auth/user`,
          config
        );
        user = res.data.user;
        user.privateKey = key;
        //  Check if user is a member of an organization
        orgData = res.data.user.organizations;
      }
      
      dispatch({
        type: LOGIN_VALIDATED,
        payload: { token, user, paymentMade: user.subscription },
      });
      if(orgData.length > 0) {
        dispatch(fetchOrgData(orgData, token));
      }

    } else {
      dispatch({
        type: AUTH_ERROR,
      });
    }
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

export const setLoading = () => dispatch => {
  dispatch({
    type: LOADING, 
    payload: true
  });
}

export const endLoading = () => dispatch => {
  dispatch({
    type: LOADING, 
    payload: false
  });
}