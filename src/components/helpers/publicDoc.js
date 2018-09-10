import {lookupProfile} from 'blockstack';
import axios from 'axios';

export function loadInitial(props) {
  console.log(props)
  this.setState({
    userToLoadFrom: props.substr(0, props.indexOf('-')),
    idToLoad: props.split('-')[1]
  })
  setTimeout(this.fetchData, 300);
}

export function fetchData() {
  lookupProfile(this.state.userToLoadFrom, "https://core.blockstack.org/v1/names")
  .then((profile) => {
    this.setState({ url: profile.apps[window.location.origin]})
    setTimeout(this.loadDoc, 300);
  })
  .catch((error) => {
    console.log('could not resolve profile')
  })
}

export function loadDoc() {
  axios.get(this.state.url + 'public/' + this.state.idToLoad + '.json')
  .then((response) => {
    var responseHeaders = response.headers
    var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]];
    console.log('publicDoc helper - lastUpdated is: ', lastUpdated)
    if(Object.keys(response.data).length > 0) {
      this.setState({
        content: response.data.content,
        docLoaded: true,
        lastUpdated: lastUpdated,
        singleDocIsPublic: response.data.singleDocIsPublic,
        title: response.data.title,
        readOnly: response.data.readOnly,
        words: response.data.words,
      })
    } else {
      this.setState({
        singleDocIsPublic: false,
      })
    }
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

//this function is for TextEdit...
export function handlePubChange(event) { //calling this on change in textarea...
  var updateString = event.target.value
  this.setState({
    content: updateString
  });
}

export function handlePubTitleChange(e) {
  this.setState({
    title: e.target.value
  });
}
