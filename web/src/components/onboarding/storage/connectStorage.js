import axios from "axios";
import { encryptContent, getPublicKeyFromPrivate } from "blockstack";

export async function handleStorage() {
  //first we connect to the selected storage provider.
  let code;
  let link;
  if(window.location.href.includes('google')) {
    code = await window.location.href.split("code=")[1].split("&")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev";
  } else if(window.location.href.includes('dropbox')) {
    code = await window.location.href.split("code=")[1].split("#")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/dropboxAuthDev";
  } else if(window.location.href.includes('box-1')) {
    code = await window.location.href.split("code=")[1].split("#")[0];
    link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/boxAuthDev"
  }

  await axios
    .post(
      link,
      code
    )
    .then(async res => {
      console.log(res);
      await localStorage.setItem("oauthData", JSON.stringify(res));
      //then we encrypt the refreshToken;
      let data = await JSON.parse(localStorage.getItem("oauthData")).data
        .refresh_token ? JSON.parse(localStorage.getItem("oauthData")).data
          .refresh_token : JSON.parse(localStorage.getItem("oauthData")).data
            .access_token;
      let privateKey;
      let authProvider = await JSON.parse(localStorage.getItem("authProvider"));
      if (authProvider === "uPort") {
        privateKey = await JSON.parse(
          JSON.parse(localStorage.getItem("connectState"))
        ).keypair.privateKey;
      }
      let publicKey = await getPublicKeyFromPrivate(privateKey);
      let encryptedRefreshToken = await encryptContent(JSON.stringify(data), {
        publicKey: publicKey
      });

      //Next we need to create a profile object.
      //then we add the encrypted blob as part of the profile object which we'll create here.
      let did;
      let didProfile;

      // //Need to conditionally set the storage provider so we can add it to the profile.
      let storageProvider = await window.location.href.split('state=')[1].split('&')[0];

      // //Access to the did and profile depends on authProvider.
      if (authProvider === "uPort") {
        did = await JSON.parse(localStorage.getItem("uPortUser")).payload.did;
        didProfile = await JSON.parse(localStorage.getItem("uPortUser")).payload;
      }

      const profile = await {
        did: did,
        profile: didProfile,
        storageProvider: storageProvider,
        refreshToken: encryptedRefreshToken,
        profileLastUpdated: Date.now()
      };
      this.makeProfile(profile);
    })
    .catch(error => console.log(error));
}
