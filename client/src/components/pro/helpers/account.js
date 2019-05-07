import axios from 'axios';
import { getGlobal, setGlobal } from 'reactn';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { fetchData } from '../../shared/helpers/fetch';
const blockstack = require("blockstack");

export async function handleProCheck() {
    if(window.location.href.includes('invite/accept')) {
        //Do nothing since a redirect should happen anyway
    } else {
        let proData = await checkPro();
        setGlobal({ proUserProfile: proData });
      if(proData === "User not found") {
        console.log("Not a Pro user");
        setGlobal({ proLoading: false })
        return "error";
      } else {
        if(proData.length > 1) {
            //Need to present an org selector and switcher
        } else {
            const orgData = proData;
            await filterTeams(orgData);
            const trialAccount = orgData.accountPlan.planType === "Trial" ? true : false;
            if(trialAccount === true) {
              setGlobal({ graphitePro: true, proOrgInfo: orgData, proLoading: false  })
              return "success"
            } else {
                //Check if payments are up to date
                const overdue = orgData.accountPlan.overdue;
                if(overdue === true) {
                    const suspended = orgData.accountPlan.suspended;
                    if(suspended) {
                        setGlobal({ suspendedMessage: true, proLoading: false });
                    } else {
                        setGlobal({ ovedueMessage: true, proLoading: false });
                    }
                    return "success";
                } else {
                    setGlobal({ graphitePro: true, proOrgInfo: orgData, proLoading: false  })
                    return "success";
                }
            }
        }
      }
    }
}

export async function checkPro() {
    const accountParams = {
        fileName: "account.json", 
        decrypt: true
    }
    const account = await fetchData(accountParams);
    if(account) {
        const orgId = JSON.parse(account).orgId;
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
        return axios.get(`${baseUrl}/account/org/${orgId}/user/${username}?pubKey=${pubKey}`, headerObj)
            .then(async (res) => {
                if(res.data.data) {
                    return res.data.data;
                } else {
                    return "User not found";
    
                }
            }).catch(err => console.log(err));
    } else {
        console.log("Org does not exist");
        return "User not found"
    }
}

export async function filterTeams(orgData) {
    const { userSession } = getGlobal();
    const teams = orgData.teams;
    const userTeams = teams.filter(team => team.users.filter(user => user.username === userSession.loadUserData().username));
    setGlobal({ teams: userTeams, filteredTeams: userTeams });
}

// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }

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
    const orgId = getGlobal().proOrgInfo.orgId;
    const url = `${serverUrl}/account/org/name/${orgId}`;
    const body = {
        orgName: getGlobal().orgName, 
        orgId: getGlobal().proOrgInfo.orgId,
        pubKey
    }
    axios.put(url, JSON.stringify(body), headerObj)
        .then((res) => {
            if(res.data.success === true) {
                handleProCheck();
                setGlobal({ orgNameModalOpen: false });
                ToastsStore.success("Account name updated!");
            } else {
                ToastsStore.error(res.data.message);
            }
        }).catch(err => console.log(err))
}