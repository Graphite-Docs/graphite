import { Connect } from "uport-connect";
import {
  makeAuthRequest,
  redirectToSignInWithAuthRequest,
  generateAndStoreTransitKey,
  nextHour,
  isUserSignedIn,
  signUserOut,
  isSignInPending,
  handlePendingSignIn
} from "blockstack";
import {
  makeProfile as profileCheck
} from '../onboarding/profiles/profiles';

const uport = new Connect("Graphite", {
  network: "mainnet"
});

let did;
let didProfile;

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

export async function foundProfile() {
  //Here we will query the Graphite DB for the profile and fallback to IPFS if Graphite is inaccessible.
  if(isSignedIn()) {
    const authType = await JSON.parse(localStorage.getItem('authProvider'))
    let fullProfile;
    if(authType === 'uPort') {
      did = await JSON.parse(localStorage.getItem("uPortUser")).payload.did;
      didProfile = await JSON.parse(localStorage.getItem("uPortUser")).payload;
      fullProfile = await {
        did: did,
        profile: didProfile,
        profileLastUpdated: Date.now(),
        create: false
      };
    } else {
      did = await JSON.parse(localStorage.getItem("blockstackUser")).decentralizedID;
      didProfile = await JSON.parse(localStorage.getItem("blockstackUser")).username;
      fullProfile = await {
        did: did,
        profile: didProfile,
        profileLastUpdated: Date.now(),
        create: true
      };
    }
    const response = await profileCheck(fullProfile);
    return response;
  } else {
    return false;
  }
}

export function blockstackSignIn() {
  if (isSignInPending()) {
    handlePendingSignIn().then((userData) => {
      console.log(userData)
      localStorage.setItem("authProvider", JSON.stringify("blockstack"));
      localStorage.setItem("blockstackUser", JSON.stringify(userData));
      window.location = window.location.origin;
    });
  }
}
