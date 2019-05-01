import axios from 'axios';
import { getGlobal, setGlobal } from 'reactn';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
const blockstack = require("blockstack");

export async function handleProCheck() {
    console.log("checking")
    let proData = await checkPro();
      setGlobal({ proUserProfile: proData });
      if(proData === "User not found") {
        console.log("Not a Pro user");
        setGlobal({ proLoading: false })
        return "error";
      } else {
        let orgData = await fetchOrg(proData.accountProfile.orgInfo.orgId);
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

export function fetchOrg(orgId) {
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
    return axios.get(`${baseUrl}/account/org/${orgId}/${pubKey}`, headerObj)
        .then(async (res) => {
            if(res.data.data) {
                return res.data.data;
            } else {
                return "error fetching org";
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

export function handleOrgName(e) {
    setGlobal({ orgName: e.target.value });
}

export async function saveOrgDetails() {
    const { userSession } = getGlobal();
    //First save the updated orgInfo file to Gaia, if the user has permission
    let orgInfo = getGlobal().proOrgInfo;
    const pubKey = blockstack.getPublicKeyFromPrivate(userSession.loadUserData().appPrivateKey);
    orgInfo["orgName"] = getGlobal().orgName;
    setGlobal({ proOrgInfo: orgInfo });
    let orgParams = {
        fileName: "account.json", 
        encrypt: true, 
        body: JSON.stringify(orgInfo)
    }
    let postOrgInfo = await postData(orgParams);
    console.log(postOrgInfo);
    //Then update the DB
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
    let serverUrl = window.location.href.includes("local") ? "http://localhost:5000" : "https://socket.graphitedocs.com";
    const url = `${serverUrl}/account/org/name`;
    const body = {
        orgName: getGlobal().orgName, 
        orgId: getGlobal().proOrgInfo.orgId,
        pubKey
    }
    axios.put(url, JSON.stringify(body), headerObj)
        .then((res) => {
            if(res.data.success === true) {
                setGlobal({ orgNameModalOpen: false });
                ToastsStore.success("Account name updated!");
            } else {
                ToastsStore.error(res.data.message);
            }
        }).catch(err => console.log(err))
}