import {lookupProfile} from 'blockstack';
import axios from 'axios';
import { Value } from 'slate'

export function loadInitial(props) {
}

export function pollData() {
  const user = window.location.href.split('docs/')[1].split('-')[0]
  lookupProfile(user, "https://core.blockstack.org/v1/names")
  .then((profile) => {
    this.setState({ url: profile.apps[window.location.origin]}, () => {
      this.loadPublicState();
    })
  })
  .catch((error) => {
    console.log('could not resolve profile')
  })
}

export function loadPublicState() {
  const id = window.location.href.split('docs/')[1].split('-')[1]
  axios.get(this.state.url + 'public/' + id+ '.json')
  .then((response) => {
    var responseHeaders = response.headers
    var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]];
    if(Object.keys(response.data).length > 0) {
      this.setState({
        lastUpdated: lastUpdated,
        singleDocIsPublic: response.data.singleDocIsPublic,
        title: response.data.title,
        readOnlyContent: response.data.content,
        readOnly: response.data.readOnly,
        words: response.data.words,
        wholeFile: response.data
      })
    } else {
      this.setState({
        singleDocIsPublic: false,
      })
    }
  })
  .then(() => {
    this.setState({ docLoaded: true })
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

export function fetchData() {
  const user = window.location.href.split('docs/')[1].split('-')[0]
  lookupProfile(user, "https://core.blockstack.org/v1/names")
  .then((profile) => {
    this.setState({ url: profile.apps[window.location.origin]}, () => {
      this.loadDoc();
    })
  })
  .catch((error) => {
    console.log('could not resolve profile')
  })
}

export function loadDoc() {
  const id = window.location.href.split('docs/')[1].split('-')[1]
  axios.get(this.state.url + 'public/' + id+ '.json')
  .then((response) => {
    var responseHeaders = response.headers
    var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]];
    if(Object.keys(response.data).length > 0) {
      this.setState({
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
      this.setState({
        singleDocIsPublic: false,
      })
    }
  })
  .then(() => {
    this.setState({ docLoaded: true })
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

//this function is for TextEdit...
export function handlePubChange(change) { //calling this on change in textarea...
  this.setState({
    collabContent: change.value
  });
}

export function handlePubTitleChange(e) {
  this.setState({
    title: e.target.value
  });
}
