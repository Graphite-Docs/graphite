import axios from 'axios';
import { getGlobal, setGlobal } from 'reactn';

export function checkPro() {
    const { userSession } = getGlobal();
    const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
    const username = userSession.loadUserData().username;
    return axios.get(`${baseUrl}/account/user/${username}`)
        .then(async (res) => {
            if(res.data.data) {
                return res.data.data;
            } else {
                return "error fetching user";
            }
        }).catch(err => console.log(err));
}

export function fetchOrg(orgName) {
    const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
    return axios.get(`${baseUrl}/account/org/${orgName}`)
        .then(async (res) => {
            if(res.data.data) {
                return res.data.data;
            } else {
                return "error fetching user";
            }
        }).catch(err => console.log(err));
}

export async function filterTeams(orgData) {
    const userData = getGlobal().proUserProfile;
    const teamIds = userData.accountProfile.membershipTeams.map(a => a.teamId);
    let teams = [];
    asyncForEach(teamIds, (id) => {
        teams = teams.concat(orgData.orgProfile.teams.filter(a => a.id === id))
    })
    setGlobal({ teams, filteredTeams: teams });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}