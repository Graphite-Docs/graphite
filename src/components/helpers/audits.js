import {
  loadUserData
} from 'blockstack';
<<<<<<< HEAD
import {
  getTimestamp
} from './getMonthDayYear';
import {
  accountDetails
} from './accountPlan';
=======
>>>>>>> audits
import axios from 'axios';

export function postToLog() {
  const object = {};
  axios.get('http://worldclockapi.com/api/json/est/now')
    .then((response) => {
<<<<<<< HEAD
=======
      console.log(response.data.currentDateTime)
>>>>>>> audits
      object.user = loadUserData().username;
      object.timeStamp = response.data.currentDateTime;
      object.action = this.state.action;
    })
    .catch(error => {console.log(error)})
<<<<<<< HEAD


=======
>>>>>>> audits
  this.setState({ audits: [...this.state.audits, object] });
  setTimeout(this.accountDetails, 300);
}
