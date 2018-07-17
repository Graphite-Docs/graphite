import {lookupProfile} from 'blockstack';
import axios from 'axios';

export function fetchData() {
  lookupProfile(this.state.userToLoadFrom, "https://core.blockstack.org/v1/names")
  .then((profile) => {
    console.log('PublicDoc - fetchData - profile.apps: ', profile.apps['http://localhost:3000']);
    if(process.env.NODE_ENV !== 'production') {
      this.setState({url: profile.apps['http://localhost:3000']});
    } else {
      this.setState({url: profile.apps['https://app.graphitedocs.com']});
    }
    setTimeout(this.loadDoc, 300);
  })
  .catch((error) => {
    console.log('could not resolve profile')
  })
}

export function loadDoc() {
  axios.get(this.state.url + 'public/' + this.state.idToLoad + '.json')
  .then((response) => {
    console.warn('PublicDoc - loadDoc() - axios ->> docLoaded! response:', response);
    var responseHeaders = response.headers // response.headers: {last-modified: "Sat, 30 Jun 2018 21:07:31 GMT", content-type: "text/plain", cache-control: "public, max-age=1"}
    var lastUpdated = responseHeaders[Object.keys(responseHeaders)[0]]; //this is the value of last-modified
    console.log('lastUpdated is: ', lastUpdated)
    // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! response.data:', response.data);
    // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! response.data.content:', response.data.content);
    // console.log('PublicDoc - loadDoc() - axios ->> docLoaded! typeof response.data.content:', typeof response.data.content); //this is a string
    this.setState({
      title: response.data.title,
      content: response.data.content,
      words: response.data.words,
      docLoaded: true,
      lastUpdated: lastUpdated
    })
  })
  .then(() => {
    let markupStr = this.state.content;
    window.$('.summernote').summernote('code', markupStr);
    window.$('.summernote').summernote({
      roomId: this.state.idToLoad.toString(), //this needs to be a string!
      docLoaded: this.state.docLoaded, //this is set by getFile
       //stripping html tags from content received from loadDoc...
      onChange: this.handleChangeInTextEdit,
      getYjsConnectionStatus: this.getYjsConnectionStatus, //passing this through TextEdit to Yjs
      yjsConnected: this.state.yjsConnected
    })
  })
  .catch((error) => {
    console.log('error:', error);
  });
}

//this function is for TextEdit...
export function handlePubChange(event) { //calling this on change in textarea...
  console.log('PublicDoc -->> handleChange called, event is: ', event)
  var updateString = event.target.value
  console.log('typeof updateString: ', typeof updateString)
  this.setState({
    content: updateString
  });
}

export function handlePubTitleChange(e) {
  this.setState({
    title: e.target.value
  });
}

export function loadInitial(props) {
  console.log(props)
  this.setState({
    userToLoadFrom: props.substr(0, props.indexOf('-')),
    idToLoad: props.split('-')[1]
  })
  setTimeout(this.fetchData, 300);
}
