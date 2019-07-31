import { getGlobal } from 'reactn';
const blockstack = require('blockstack');
  
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