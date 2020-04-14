import { setAlert } from "./alert";

import {
  LOGIN_SUCCESS,
  LOGIN_VALIDATED,
  REGISTRATION_SUCCESS,
  REGISTRATION_VALIDATED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOG_OUT,
} from "../actions/types";
import { URL, config } from '../utils/api';
import axios from "axios";
import { PrivateKey } from 'eciesjs';
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

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
      payload: res.data.token, //TODO - we should be emailing this and just returning success
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

    console.log(payload);

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
      payload: { token: res.data.token, user },
    });
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }

  //  Post back to server object with: email, encrypted validation data, encrypted privateKey, unencrypted public key
};

export const login = (email, password) => async (dispatch) => {
  try {
    const body = {
      email,
    };
    const res = await axios.post(
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

    const errors = error.response.data.errors;

    if (errors) {
      for (const error of errors) {
        dispatch(setAlert(error.msg, "error"));
      }
    }
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

      updatedUser.privateKey = reEncryptedPrivKey
      
      dispatch({
        type: LOGIN_VALIDATED,
        payload: { token: res.data.token, user: updatedUser },
      });
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
  try {
    const token = localStorage.getItem('token');
    const key = localStorage.getItem('key');
    if(token) {
      const decodedToken = await jwt.verify(
        token,
        process.env.REACT_APP_JWT_SECRET
      );
    
      const { user } = decodedToken;
      user.privateKey = key;
      dispatch({
        type: LOGIN_VALIDATED,
        payload: { token, user },
      });
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
