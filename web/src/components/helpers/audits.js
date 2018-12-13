import {
  loadUserData
} from 'blockstack';
const uuidv4 = require('uuid/v4');

export function postToLog() {
  const object = {};
  object.user = loadUserData().username;
  object.timeStamp = new Date(Date.now()).toString();
  object.action = this.state.action;
  object.id = uuidv4();

  this.setState({ audits: [...this.state.audits, object] });
  setTimeout(this.saveAll, 300);
}
