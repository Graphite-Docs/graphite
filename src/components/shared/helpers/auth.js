import { getGlobal, setGlobal } from 'reactn';
import { createUserAccount, login } from 'simpleid-js-sdk';
import { ToastsStore} from 'react-toasts';
const keys = require('../../../utils/keys');
const blockstack = require('blockstack');
const config = {
    appOrigin: "https://app.graphitedocs.com", 
    scopes: ['store_write', 'publish_data', 'email'], 
    authModules: ['blockstack'],
    storageModules: ['blockstack'],
    apiKey: keys.apiKey,
    devId: keys.devId,
    development: false
}
  
export function signIn(e) {
    const userSession = getGlobal().userSession;
    const origin = window.location.origin;
    e.preventDefault();
    const authRequest = blockstack.makeAuthRequest(
        userSession.generateAndStoreTransitKey(),
        origin,
        origin + '/manifest.json',
        ['store_write', 'publish_data', 'email'],
        origin,
        blockstack.nextHour().getTime(), {
          solicitGaiaHubUrl: true
        } // new options param
    );
      
    userSession.redirectToSignInWithAuthRequest(authRequest);
}

export function signOut() {
    //Handle Blockstack sign out
    blockstack.signUserOut(window.location.origin);
}

export async function standardSignin() {
    const credObj = {
        id: document.getElementById('signin-username').value,
        password: document.getElementById('signin-password').value,
        hubUrl: "https://gaia.blockstack.org"
    }
    const params = {
        credObj, 
        appObj: config, 
        userPayload: {}
    }
    try {
        setGlobal({ loading: true });
        const signin = await login(params);
        if(signin.body) {
            localStorage.setItem('blockstack-session', JSON.stringify(signin.body.store.sessionData));
            window.location.reload();
        } else {
            console.log("error", signin);
            ToastsStore.error(`Trouble signing in, if this continues please contact support`)
        }
    } catch(err) {
        console.log(err);
        setGlobal({ loading: false });
        ToastsStore.error(`Trouble signing in, if this continues please contact support`)
    }
}

export async function signUp() {
    document.getElementById('auth-error').innerText = ""
    const id = document.getElementById('sign-up-username').value.toLowerCase();
    if(id.split(" ").length > 1) {
        document.getElementById('auth-error').innerText = "Please make sure your username does not have spaces"
    } else {
        const credObj = {
            id,
            password: document.getElementById('sign-up-password').value,
            email: document.getElementById('sign-up-password').value,
            hubUrl: "https://gaia.blockstack.org"
        }
        try {
            setGlobal({ loading: true });
            const signup = await createUserAccount(credObj, config);
            if(signup.body) {
                localStorage.setItem('blockstack-session', JSON.stringify(signup.body.store.sessionData));
                window.location.reload();
            } else {
                console.log("error", signup);
                setGlobal({ loading: false });
                ToastsStore.error(`Trouble signing up, if this continues please contact support`)
            }
        } catch(err) {
            console.log(err);
            setGlobal({ loading: false });
            ToastsStore.error(`Trouble signing up, if this continues please contact support`);
        }
    }
}