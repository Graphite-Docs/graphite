import {
  loadUserData
} from 'blockstack';
import {
  getTimestamp
} from './getMonthDayYear';
import {
  accountDetails
} from './accountPlan';
import axios from 'axios';

export function postToLog() {
  const object = {};
  axios.get('http://worldclockapi.com/api/json/est/now')
    .then((response) => {
      console.log(response.data.currentDateTime)
      object.user = loadUserData().username;
      object.timeStamp = response.data.currentDateTime;
      object.action = this.state.action;
    })
    .catch(error => {console.log(error)})
  this.setState({ audits: [...this.state.audits, object] });
  setTimeout(this.accountDetails, 300);
}
