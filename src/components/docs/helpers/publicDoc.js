import { setGlobal, getGlobal } from 'reactn';
import { Value } from 'slate';
const axios = require('axios');
const blockstack = require('blockstack');
export function fetchData(){
    const user = window.location.href.split('docs/')[1].split('-')[0];
    blockstack.lookupProfile(user, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      setGlobal({ url: profile.apps[window.location.origin]}, () => {
        const id = window.location.href.split('docs/')[1].split('-')[1].split('#')[0]
        axios.get(`${getGlobal().url}public/${id}.json`)
        .then((response) => {
            console.log(response)
            var responseHeaders = response.headers
            var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]];
            if(Object.keys(response.data).length > 0) {
                setGlobal({
                    lastUpdated: lastUpdated,
                    singleDocIsPublic: response.data.singleDocIsPublic,
                    title: response.data.title,
                    readOnlyContent: response.data.content,
                    collabContent: Value.fromJSON(response.data.content),
                    readOnly: response.data.readOnly,
                    words: response.data.words,
                    wholeFile: response.data
                })
            } else {
            setGlobal({
                singleDocIsPublic: false,
            })
            }
        })
        .then(() => {
            setGlobal({ docLoaded: true, loading: false })
        })
        .catch((error) => {
            console.log('error:', error);
        });
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
}

export function handlePubChange(change) {
  setGlobal({
    collabContent: change.value
  });
}

export function pollForChanges() {
  const user = window.location.href.split('docs/')[1].split('-')[0];
    blockstack.lookupProfile(user, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      setGlobal({ url: profile.apps[window.location.origin]}, () => {
        const id = window.location.href.split('docs/')[1].split('-')[1].split('#')[0]
        axios.get(`${getGlobal().url}public/${id}.json`)
        .then((response) => {
            if(Object.keys(response.data).length > 0) {
                if(response.data.readOnly !== getGlobal().readOnly) {
                  fetchData();
                }
            } else {
              setGlobal({
                  singleDocIsPublic: false,
              })
            }
        })
        .then(() => {
            setGlobal({ docLoaded: true, loading: false })
        })
        .catch((error) => {
            console.log('error:', error);
        });
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
}
