import { Connect } from "uport-connect";
import {
  makeAuthRequest,
  redirectToSignInWithAuthRequest,
  generateAndStoreTransitKey,
  nextHour,
  isUserSignedIn,
  signUserOut
} from "blockstack";

const uport = new Connect("Graphite", {
  network: "mainnet"
});

export function handleAuth(provider) {
  if (provider === "uPort") {
    const reqObj = {
      requested: ["name"],
      verified: ["ORBIT"],
      notifications: true
    };
    uport.requestDisclosure(reqObj);
    uport
      .onResponse("disclosureReq")
      .then(res => {
        console.log(res);
        localStorage.setItem("authProvider", JSON.stringify("uPort"));
        localStorage.setItem("uPortUser", JSON.stringify(res));
      })
      .then(() => {
        window.location.reload();
      });
  } else if (provider === "Blockstack") {
    const origin = window.location.origin;
    const authRequest = makeAuthRequest(
      generateAndStoreTransitKey(),
      origin,
      origin + "/manifest.json",
      ["store_write", "publish_data"],
      origin,
      nextHour().getTime(),
      {
        solicitGaiaHubUrl: true
      }
    );
    redirectToSignInWithAuthRequest(authRequest);
  }
}

export function signOut() {
  if(isUserSignedIn()) {
    //Handle Blockstack sign out
    signUserOut(window.location.origin);
  } else if(JSON.parse(localStorage.getItem('authProvider') === 'uPort')) {
    localStorage.removeItem('authProvider')
    localStorage.removeItem('uPortUser')
    window.location.reload();
  }
}

export function isSignedIn() {
  const provider = JSON.parse(localStorage.getItem("authProvider"));
  if (provider === "uPort") {
    return true;
  } else {
    //Here we fall back and asume it's Blockstack since that was the original provider
    return isUserSignedIn();
  }
}

export function foundProfile() {
  //Here we will query the Graphite DB for the profile and fallback to OrbitDB if Graphite is inaccessible.
  if(isUserSignedIn()) {
    //probably still want to write these profiles to Graphite's DB and to OrbitDB
    return true
  } else {
    return false;
  }
}
