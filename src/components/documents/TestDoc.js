import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Profile from "../Profile";
import Signin from "../Signin";
import Header from "../Header";
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile
} from 'blockstack';
import update from 'immutability-helper';
import axios from 'axios';
const blockstack = require("blockstack");

const { encryptECIES, decryptECIES } = require('blockstack/lib/encryption');
const { getPublicKeyFromPrivate } = require('blockstack');


export default class TestDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: []
    }
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
  }

  componentDidMount() {
    axios
      .get(
        "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD"
      )
      .then(res => {
        console.log(res.data.RAW.BTC.USD.LASTUPDATE);
      })
      .catch(error => {
        console.log(error);
      });
  }


  render() {

    return (
      <div>
        Heyo
      </div>
    );
  }
}
