import axios from 'axios';
import { getGlobal, setGlobal } from 'reactn';
const blockstack = require("blockstack");

export function checkPro() {
    const { userSession } = getGlobal();
    const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
    const username = userSession.loadUserData().username;
    const pubKey = blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey);
    const data = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username
    }
    const bearer = blockstack.signProfileToken(data, userSession.loadUserData().appPrivateKey);
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }
    return axios.get(`${baseUrl}/account/user/${username}/${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                return res.data.data;
            } else {
                return "User not found";

            }
        }).catch(err => console.log(err));
}

export function fetchOrg(orgName) {
    const { userSession } = getGlobal();
    const baseUrl = window.location.href.includes('local') ? 'http://localhost:5000' : 'https://socket.graphitedocs.com';
    const pubKey = blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey);
    const data = {
        profile: userSession.loadUserData().profile, 
        username: userSession.loadUserData().username
    }
    const bearer = blockstack.signProfileToken(data, userSession.loadUserData().appPrivateKey);
    const headerObj = {
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json', 
            'Authorization': bearer
        }, 
    }
    return axios.get(`${baseUrl}/account/org/${orgName}/${pubKey}`, headerObj)
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

export async function handleProCheck() {
    console.log("checking")
    let proData = await checkPro();
      setGlobal({ proUserProfile: proData });
      if(proData === "User not found") {
        console.log("Not a Pro user");
        setGlobal({ proLoading: false })
        return "error";
      } else {
        let orgData = await fetchOrg(proData.accountProfile.orgInfo.name);
        await filterTeams(orgData);
        const trialAccount = orgData.orgProfile.trialAccount.onTrial;
        if(trialAccount === true) {
          const proOrgInfo = orgData.orgProfile
          setGlobal({ graphitePro: true, proOrgInfo, proLoading: false  })
          return "success"
        } else {
            //Check if payments are up to date
            const overdue = orgData.orgProfile.paymentInfo.overdue;
            if(overdue === true) {
                const suspended = orgData.orgProfile.paymentInfo.suspended;
                if(suspended) {
                    setGlobal({ suspendedMessage: true, proLoading: false });
                } else {
                    setGlobal({ ovedueMessage: true, proLoading: false });
                }
                return "success";
            } else {
                const proOrgInfo = orgData.orgProfile
                setGlobal({ graphitePro: true, proOrgInfo, proLoading: false  })
                return "success";
            }
        }
      }
}