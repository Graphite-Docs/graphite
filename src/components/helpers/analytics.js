import {
  loadUserData
} from 'blockstack';
import {
  getMonthDayYear
} from './getMonthDayYear';
import axios from 'axios';
const { getPublicKeyFromPrivate } = require('blockstack');
let data;
let state;

export function loadAnalytics() {
  // axios.get('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/analytics-get')
  // .then(function (response) {
  //   if(response) {
  //     state = response.data;
  //   } else {
  //     state = [];
  //   }
  // })
  // .then(() => {
  //   this.dataLoad();
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
}

export function dataLoad() {
  this.setState({ analytics: state});
  let files = this.state.sheets.concat(this.state.value).concat(this.state.files);
  const object = {};
  object.publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
  object.date = getMonthDayYear();
  object.filesCreated = files.length;
  object.timestamp = Date.now();
  data = object;
  this.setState({ analytics: [...this.state.analytics, data] });
  setTimeout(this.postToDB, 300);
}

export function postToDB() {

  //webtask http post
  axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/analytics-post', this.state.analytics)
    .then(function (response) {
      // console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
    this.setState({ fileCreation: false });
}
