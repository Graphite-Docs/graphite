import { getMonthDayYear } from './getMonthDayYear';
import { loadUserData } from 'blockstack';
const uuidv4 = require('uuid/v4');

export function loadTeams() {
  //This is where we need to load the entire team list but should only
  //decrypt teams the user has access to
}

export function handleTeamNameChange(e) {
  this.setState({ teamName: e.target.value })
}

export function saveNewTeamInfo() {
  const object = {};
  object.id = uuidv4();
  object.name = this.state.teamName;
  object.createdDate = getMonthDayYear();
  object.members = [loadUserData().username]
  object.memberCount = object.members.length;
  this.setState({ teams: [...this.state.teams, object ]});
}
