import {
  getFile,
  putFile
} from 'blockstack';
// import {
//   integrations
// } from './integrations';
// import {
//   getMonthDayYear
// } from './helpers';
import axios from 'axios';

export function handleMediumIntegrationToken(e) {
  this.setState({ mediumIntegrationToken: e.target.value, mediumConnected: true })
}

export function connectMedium() {
  this.setState({ action: "Set up Medium Integration."})
  putFile('mediumIntegrationToken.json', JSON.stringify(this.state.mediumIntegrationToken), {encrypt: true})
    .then(() => {
      window.Materialize.toast('Medium connected', 4000);
      this.saveIntegrations();
    })
    .catch(error => {
      console.log(error);
    })
}

export function disconnectMedium() {
  this.setState({ mediumIntegrationToken: "", mediumConnected: false })
  window.Materialize.toast('Medium disconnected', 4000);
  setTimeout(this.saveIntegrations, 300);
}

export function loadMediumToken() {
  getFile('mediumIntegrationToken.json', {decrypt: true})
    .then((fileContents) => {
      this.setState({mediumIntegrationToken: JSON.parse(fileContents || '{}')})
    })
    .then(() => {
      const object = {};
      object.title = this.state.title;
      object.contentFormat = 'html';
      object.content = this.state.content;
      object.publishStatus = 'draft';
      object.token = this.state.mediumIntegrationToken;
      axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/empty-function', object)
    })
}

export function postToMedium() {
  this.loadMediumToken();
}

export function connectSlack() {
  putFile('slackWebhookUrl.json', JSON.stringify(this.state.slackWebhookUrl), {encrypt: true})
    .then(() => {
      window.Materialize.toast('Slack connected', 4000);
      setTimeout(this.saveIntegrations, 300);
    })
    .catch(error => {
      console.log(error);
    })
}

export function disconnectSlack() {
  this.setState({ handleSlackWebhookUrl: "", slackConnected: false })
  window.Materialize.toast('Slack disconnected', 4000);
  setTimeout(this.saveIntegrations, 300);
}

export function handleSlackWebhookUrl(e) {
  this.setState({ slackWebhookUrl: e.target.value });
  this.setState({ slackConnected: true });
}

export function postToSlack() {
  getFile('slackWebhookUrl.json', {decrypt: true})
    .then((fileContents) => {
      this.setState({slackWebhookUrl: JSON.parse(fileContents || '{}')})
    })
    .then(() => {
      this.slackWebhook();
    })
    .catch(error => {
      console.log(error);
    })
}

export function slackWebhook() {
  // const object = {};
  // object.url = window.location.href;
  // object.message = "New Graphite Document Shared With Team"
  // object.date = getMonthDayYear();
  // console.log(object);
  // axios.post(this.state.slackWebhookUrl, object);

  var settings = {
  "async": true,
  "crossDomain": true,
  "url": this.state.slackWebhookUrl,
  "method": "POST",
  "headers": {
    "Cache-Control": "no-cache",
    "Postman-Token": "742ba552-5ef1-8cd4-ac6c-d5f2434d3449",
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "data": {
    "payload": "{\"channel\": \"#general\", \"username\": \"graphitebot\", \"text\": \"New Graphite Document Shared With Team: " + window.location.href + "\" }"
  }
}

window.$.ajax(settings).done(function (response) {
  console.log(response);
});
}
