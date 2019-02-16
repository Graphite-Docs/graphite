import { setGlobal } from 'reactn';
import { getPublicKeyFromPrivate, loadUserData, getFile, lookupProfile, decryptContent } from 'blockstack';
import { fetchFromProvider } from './storageProviders/fetch';
import { loadDocs } from './helpers';
const { decryptECIES } = require('blockstack/lib/encryption');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export async function initialShared() {
    const authProvider = JSON.parse(localStorage.getItem('authProvider'));
    setGlobal({ user: window.location.href.split('shared/')[1].split('#')[0], loading: true });
    if(authProvider === 'uPort') {
        await loadDocs();
        
        const thisKey =  await JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.private;
        let publicKey = JSON.parse(localStorage.getItem('graphite_keys')).GraphiteKeyPair.public;
        let fileString = 'shareddocs.json'
        let file = publicKey + fileString;
        const directory = 'shared/' + file;
        const user = window.location.href.split('shared/')[1].split('#')[0];
        if(user.includes('did:')) {
            //the sharer is a uPort user and thus shared using IPFS. Need to fetch from there. 
            const params = {
                provider: 'ipfs',
                filePath: `/shared/${publicKey}/${fileString}`
                };
                //Call fetchFromProvider and wait for response.
            let fetchFile = await fetchFromProvider(params);
            console.log(fetchFile)
            if(fetchFile) {
                const decryptedContent = await JSON.parse(decryptContent(fetchFile.data.pinataContent.content, { privateKey: thisKey }))
                console.log(decryptedContent);
                await setGlobal({ docs: decryptedContent, loading: false })
                } else {
                await setGlobal({ docs: [], loading: false })
                }
        } else {
            const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
            lookupProfile(user, "https://core.blockstack.org/v1/names")
            .then((profile) => {
                let image = profile.image;
                if(profile.image){
                setGlobal({img: image[0].contentUrl})
                } else {
                setGlobal({ img: avatarFallbackImage })
                }
            })
            .catch((error) => {
                console.log('could not resolve profile')
            })
            getFile(directory, options)
            .then((fileContents) => {
            console.log(JSON.parse(decryptECIES(thisKey, JSON.parse(fileContents))));
            setGlobal({ docs: JSON.parse(decryptECIES(thisKey, JSON.parse(fileContents))) }, () => {
                setGlobal({ loading: false });
            })
            console.log("loaded");
            // this.save();
            })
            .catch(error => {
                console.log(error);
            });
        } 
    } else {
        getFile("documentscollection.json", {decrypt: true})
        .then((fileContents) => {
        if(JSON.parse(fileContents)) {
            if(JSON.parse(fileContents).value) {
            setGlobal({ value: JSON.parse(fileContents || '{}').value });
            } else {
            setGlobal({ value: JSON.parse(fileContents || '{}') });
            }
        } else {
            console.log("No docs");
            }
        })
        .then(async () => {
            const thisKey = loadUserData().appPrivateKey;
            let publicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
            let fileString = 'shareddocs.json'
            let file = publicKey + fileString;
            const directory = 'shared/' + file;
            const user = window.location.href.split('shared/')[1];
            if(user.includes('did:')) {
                //the sharer is a uPort user and thus shared using IPFS. Need to fetch from there. 
                const params = {
                    provider: 'ipfs',
                    filePath: `/shared/${publicKey}/${fileString}`
                  };
                  //Call fetchFromProvider and wait for response.
                let fetchFile = await fetchFromProvider(params);
                console.log(fetchFile)
                if(fetchFile) {
                    const decryptedContent = await JSON.parse(decryptContent(fetchFile.data.pinataContent.content, { privateKey: thisKey }))
                    console.log(decryptedContent);
                    await setGlobal({ docs: decryptedContent, loading: false })
                  } else {
                    await setGlobal({ docs: [], loading: false })
                  }
            } else {
                const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
                lookupProfile(user, "https://core.blockstack.org/v1/names")
                .then((profile) => {
                    let image = profile.image;
                    if(profile.image){
                    setGlobal({img: image[0].contentUrl})
                    } else {
                    setGlobal({ img: avatarFallbackImage })
                    }
                })
                .catch((error) => {
                    console.log('could not resolve profile')
                })
                getFile(directory, options)
                .then((fileContents) => {
                let privateKey = loadUserData().appPrivateKey;
                console.log(JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))));
                setGlobal({ docs: JSON.parse(decryptECIES(privateKey, JSON.parse(fileContents))) }, () => {
                    setGlobal({ loading: false });
                })
                console.log("loaded");
                // this.save();
                })
                .catch(error => {
                    console.log(error);
                });
            } 
        })
        .catch(error => {
            console.log(error);
        });
}
}