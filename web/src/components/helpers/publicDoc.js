import {lookupProfile} from 'blockstack';
import axios from 'axios';
import { Value } from 'slate'
import { fetchFromProvider } from './storageProviders/fetch';
import { getGlobal, setGlobal } from 'reactn';

export function loadInitial(props) {
}

export async function fetchData() {
  if(window.location.href.includes('ipfs')) {
    const object = {
      provider: 'ipfs',
      filePath: window.location.href.split('docs')[1].split('#')[0]
    };
    //Call fetchFromProvider and wait for response.
    // let fetchFile = await fetchFromProvider(object);
    fetchFromProvider(object)
      .then((res) => {
        const data = res.data.pinataContent ? JSON.parse(res.data.pinataContent.content) : JSON.parse(res.data.content);
        console.log(data)
        setGlobal({
          lastUpdated: data.lastUpdated,
          singleDocIsPublic: data.singleDocIsPublic,
          title: data.title,
          readOnlyContent: data.content,
          collabContent: Value.fromJSON(data.content),
          readOnly: data.readOnly,
          words: data.words,
          wholeFile: data
        }, 
        () => {
          setGlobal({ docLoaded: true, loading: false })
        })
      })
  } else {
    const user = window.location.href.split('docs/')[1].split('-')[0]
    lookupProfile(user, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      setGlobal({ url: profile.apps[window.location.origin]}, () => {
        loadDoc();
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
  }
}

export async function pollData() {
  if(window.location.href.includes('ipfs')) {
    const object = {
      provider: 'ipfs',
      filePath: window.location.href.split('docs')[1].split('#')[0]
    };
    //Call fetchFromProvider and wait for response.
    let fetchFile = await fetchFromProvider(object);
    console.log(fetchFile)
  } else {
    const user = window.location.href.split('docs/')[1].split('-')[0]
    lookupProfile(user, "https://core.blockstack.org/v1/names")
    .then((profile) => {
      setGlobal({ url: profile.apps[window.location.origin]}, () => {
        loadPublicState();
      })
    })
    .catch((error) => {
      console.log('could not resolve profile')
    })
  }
}

export async function loadPublicState() {
  const global = getGlobal();
  const id = window.location.href.split('docs/')[1].split('-')[1].split('#')[0]
  axios.get(global.url + 'public/' + id+ '.json')
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
    setGlobal({ docLoaded: true })
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function loadDoc() {
  const global = getGlobal();
  const id = window.location.href.split('docs/')[1].split('-')[1].split('#')[0]
  axios.get(global.url + 'public/' + id+ '.json')
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
}

//this function is for TextEdit...
export function handlePubChange(change) { //calling this on change in textarea...
  setGlobal({
    collabContent: change.value
  });
}

export function handlePubTitleChange(e) {
  setGlobal({
    title: e.target.value
  });
}
