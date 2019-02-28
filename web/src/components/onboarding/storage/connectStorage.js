import axios from "axios";
import { setGlobal } from 'reactn';
import { makeProfile } from '../profiles/profiles';
import { encryptContent } from "blockstack";

export async function handleStorage() {
  //first we connect to the selected storage provider.
  if(window.location.href.includes('code')) {
    setGlobal({ loading: true, reAuth: false });
    let code;
    let link;

    if(window.location.href.includes('ipfs')) {
      let authProvider = await JSON.parse(localStorage.getItem("authProvider"));
      let publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;

      //We need to create a profile object.
      let did;
      let didProfile;

      //Need to conditionally set the storage provider so we can add it to the profile.
      let storageProvider = 'ipfs';
      localStorage.setItem('storageProvider', JSON.stringify(storageProvider))

      // //Access to the did and profile depends on authProvider.
      if (authProvider === "uPort") {
        did = await JSON.parse(localStorage.getItem("uPortUser")).payload.did;
        didProfile = {
          name: await JSON.parse(localStorage.getItem("uPortUser")).payload.name,
          did: await JSON.parse(localStorage.getItem("uPortUser")).payload.did
        }
      }

      let update;
      let create;
      if(JSON.parse(localStorage.getItem('updateProviderAuth'))) {
        update = true;
        create = false;
      } else { 
        update = false;
        create = true;
      }

      const profile = await {
        did: did,
        profile: didProfile,
        storageProvider: storageProvider,
        profileLastUpdated: Date.now(),
        publicKey: publicKey,
        create: create,
        update: update 
      };
      makeProfile(profile);
    } else {
      if(window.location.href.includes('google')) {
        code = await window.location.href.split("code=")[1].split("&")[0];
        if(window.location.href.includes('localhost') || window.location.href.includes('127')) {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev"
        } else if(window.location.href.includes('serene')) {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthStage";
        } else {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthProd";
        }        
      } else if(window.location.href.includes('dropbox')) {
        code = await window.location.href.split("code=")[1].split("#")[0];
        if(window.location.href.includes('localhost') || window.location.href.includes('127')) {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/dropboxAuthDev";
        } else if(window.location.href.includes('serene')) {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/dropboxAuthStage"
        } else {
          link = "https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/dropboxAuthProd"
        }
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
          console.log(res.data);
          //then we encrypt the refreshToken;
          let data = await res.data
            .refresh_token ? res.data
              .refresh_token : res.data
                .access_token;
          let authProvider = await JSON.parse(localStorage.getItem("authProvider"));
          let publicKey = await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
          let encryptedRefreshToken = await encryptContent(JSON.stringify(data), {
            publicKey: publicKey
          });
  
          //Next we need to create a profile object.
          //then we add the encrypted blob as part of the profile object which we'll create here.
          let did;
          let didProfile;
  
          //Need to conditionally set the storage provider so we can add it to the profile.
          let storageProvider = await window.location.href.split('state=')[1].split('&')[0];
          localStorage.setItem('storageProvider', JSON.stringify(storageProvider))
  
          // //Access to the did and profile depends on authProvider.
          if (authProvider === "uPort") {
            did = await JSON.parse(localStorage.getItem("uPortUser")).payload.did;
            didProfile = {
              name: await JSON.parse(localStorage.getItem("uPortUser")).payload.name,
              did: await JSON.parse(localStorage.getItem("uPortUser")).payload.did
            }
          }
  
          let update;
          let create;
          if(JSON.parse(localStorage.getItem('provider'))) {
            update = true;
            create = false;
          } else { 
            update = false;
            create = true;
          }
  
          const profile = await {
            did: did,
            profile: didProfile,
            storageProvider: storageProvider,
            refreshToken: encryptedRefreshToken,
            profileLastUpdated: Date.now(),
            publicKey: publicKey,
            create: create,
            update: update 
          };
          makeProfile(profile);
        })
        .catch(error => console.log(error));
    }
  }
}
