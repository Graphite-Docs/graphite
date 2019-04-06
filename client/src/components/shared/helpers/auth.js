const blockstack = require('blockstack');
export function signIn(e) {
    const origin = window.location.origin;
    e.preventDefault();
    blockstack.redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data', 'email'])
}

export function signOut() {
    //Handle Blockstack sign out
    blockstack.signUserOut(window.location.origin);
}