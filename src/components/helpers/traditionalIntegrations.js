import {
  getFile,
  putFile
} from 'blockstack';
// import {
//   integrations
// } from './integrations';
import {
  getMonthDayYear
} from './getMonthDayYear';
import axios from 'axios';
const lzjs = require('lzjs');
let mediumId;


export function handleMediumIntegrationToken(e) {
  this.setState({ mediumIntegrationToken: e.target.value, mediumConnected: true })
}

export function connectMedium(props) {
  this.setState({ action: "Set up Medium Integration."})
  let data;
  if(window.location.href.includes('127')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/medium', props)
      .then((res) => {
        data = res.data;
        const object = JSON.parse(data);
        this.setState({ mediumConnected: object });
      })
      .then(() => {
        this.saveIntegrations();
      })
      .catch(error => {
        console.log(error);
      })
  } else if(window.location.href.includes('serene')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/mediumStaging', props)
      .then((res) => {
        data = res.data;
        const object = JSON.parse(data);
        this.setState({ mediumConnected: object });
      })
      .then(() => {
        this.saveIntegrations();
      })
      .catch(error => {
        console.log(error);
      })
  } else {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/mediumProd', props)
      .then((res) => {
        data = res.data;
        const object = JSON.parse(data);
        this.setState({ mediumConnected: object });
      })
      .then(() => {
        this.saveIntegrations();
      })
      .catch(error => {
        console.log(error);
      })
  }

}

export function disconnectMedium() {
  this.setState({ mediumConnected: {} })
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
  //Loading Medium User Data First
  if(window.location.href.includes('127')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getMediumUser', this.state.mediumConnected)
      .then((res) => {
        console.log(res);
        mediumId = res.data;
      })
      .then(() => {
        this.createMediumPost();
      })
  } else if(window.location.href.includes('serene')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getMediumUserStaging', this.state.mediumConnected)
      .then((res) => {
        console.log(res);
        mediumId = res.data;
      })
      .then(() => {
        this.createMediumPost();
      })
  } else {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getMediumUserProd', this.state.mediumConnected)
      .then((res) => {
        console.log(res);
        mediumId = res.data;
      })
      .then(() => {
        this.createMediumPost();
      })
  }

}

export function createMediumPost() {
  console.log(mediumId);
  const object = {};
  object.id = mediumId;
  object.access_token = this.state.mediumConnected.access_token;
  object.title = this.state.title;
  object.content = this.state.content;
  if(window.location.href.includes('127')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/post-to-medium', object)
      .then((res) => {
        console.log(res.data);
        if(res.data === "Posted!") {
          window.Materialize.toast('Posted as draft to Medium', 4000);
        }
      })
      .catch(error => {
        console.log(error);
      })
  } else if(window.location.href.includes('serene')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/post-to-medium-staging', object)
      .then((res) => {
        console.log(res.data);
        if(res.data === "Posted!") {
          window.Materialize.toast('Posted as draft to Medium', 4000);
        }
      })
      .catch(error => {
        console.log(error);
      })
  } else {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/post-to-mediuam-prod', object)
      .then((res) => {
        console.log(res.data);
        if(res.data === "Posted!") {
          window.Materialize.toast('Posted as draft to Medium', 4000);
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

}

export function connectSlack(props) {
  if(window.location.href.includes('local')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getSlackAuthDev', props)
      .then((res) => {
        if(JSON.parse(res.data).ok === true) {
          console.log(JSON.parse(res.data).incoming_webhook.url);
          putFile('slackWebhookUrl.json', JSON.stringify(JSON.parse(res.data).incoming_webhook.url), {encrypt: true})
            .then(() => {
              window.Materialize.toast('Slack connected', 4000);
              this.setState({ slackConnected: true });
              setTimeout(this.saveIntegrations, 300);
            })
            .catch(error => {
              console.log(error);
            })
        } else {
          console.log("Error")
          console.log(res.data)
        }

      })
  } else if(window.location.href.includes('serene')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getSlackAuthStage', props)
      .then((res) => {
        if(JSON.parse(res.data).ok === true) {
          console.log(JSON.parse(res.data).incoming_webhook.url);
          putFile('slackWebhookUrl.json', JSON.stringify(JSON.parse(res.data).incoming_webhook.url), {encrypt: true})
            .then(() => {
              window.Materialize.toast('Slack connected', 4000);
              this.setState({ slackConnected: true });
              setTimeout(this.saveIntegrations, 300);
            })
            .catch(error => {
              console.log(error);
            })
        } else {
          console.log("Error")
          console.log(res.data)
        }

      })
  } else if(window.location.href.includes('graphite')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getSlackAuthProd', props)
    .then((res) => {
      if(JSON.parse(res.data).ok === true) {
        console.log(JSON.parse(res.data).incoming_webhook.url);
        putFile('slackWebhookUrl.json', JSON.stringify(JSON.parse(res.data).incoming_webhook.url), {encrypt: true})
          .then(() => {
            window.Materialize.toast('Slack connected', 4000);
            this.setState({ slackConnected: true });
            setTimeout(this.saveIntegrations, 300);
          })
          .catch(error => {
            console.log(error);
          })
      } else {
        console.log("Error")
        console.log(res.data)
      }

    })
    }
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
      console.log(JSON.parse(fileContents));
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
  const object = {};
  object.url = window.location.href;
  object.message = "New Graphite Document Shared With Team. View it here: " + window.location.origin;
  object.date = getMonthDayYear();
  object.slackWebhookUrl = this.state.slackWebhookUrl;
  axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/postToSlack', object);
}

export function completeAuth(props) {

}

export function handleWebhookUrl(e) {
  this.setState({ webhookUrl: e.target.value });
}

export function connectWebhook() {
  this.setState({ webhookConnected: true });
  putFile('webhookURL.json', JSON.stringify(this.state.webhookUrl), {encrypt: true})
    .then(() => {
      this.saveIntegrations();
    })
    .catch(error => {
      console.log(error);
    })
}

export function postToWebhook(props) {
  getFile('webhookURL.json', {decrypt: true})
    .then((fileContents) => {
      console.log(fileContents)
      this.setState({ webhookUrl: JSON.parse(fileContents), singleDoc: props });
    })
    .then(() => {
      this.postHook();
    })
    .catch(error => {
      console.log(error);
    })
}

export function postHook() {
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": this.state.webhookUrl,
  "method": "POST",
  "processData": false,
  "data": JSON.stringify(this.state.singleDoc)
}

  window.$.ajax(settings).done(function (response) {
    console.log(response);
  });


  //
  // axios.post(this.state.webhookUrl, this.state.singleDoc)
  //   .then((res) => {
  //     console.log(res)
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   })
}

export function disconnectWebhooks() {
  this.setState({ webhookConnected: false })
  setTimeout(this.saveIntegrations, 300);
}

export function connectGoogleDocs(props) {
  if(window.location.href.includes('local')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev', props)
      .then((res) => {
        console.log(res);
        this.setState({ token: res.data });
      })
      .then(() => {
        this.fetchGDocs();
      })
      .catch(error => {
        console.log(error);
      })
  } else if(window.location.href.includes('serene')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthStage', props)
    .then((res) => {
      console.log(res);
      this.setState({ token: res.data });
    })
    .then(() => {
      this.fetchGDocs();
    })
    .catch(error => {
      console.log(error);
    })
  } else if(window.location.href.includes('graphite')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthProd', props)
    .then((res) => {
      console.log(res);
      this.setState({ token: res.data });
    })
    .then(() => {
      this.fetchGDocs();
    })
    .catch(error => {
      console.log(error);
    })
  }
}

export function filterGDocsList(event){
  var updatedList = this.state.gDocs;
  updatedList = updatedList.filter(function(item){
    return item.name.toLowerCase().search(
      event.target.value.toLowerCase()) !== -1;
  });
  this.setState({filteredGDocs: updatedList});
}

export function fetchGDocs() {
  // if(window.location.href.includes('local')) {
    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGDocsDev', this.state.token)
      .then((res) => {
        console.log(res);
        if(JSON.parse(res.data).files !==undefined) {
          this.setState({ gDocs: JSON.parse(res.data).files, filteredGDocs: JSON.parse(res.data).files });
        } else {
          alert("Error fetching files");
        }
      })
      .catch(error => {
        console.log(error);
      })
  // } else if(window.location.href.includes('serene')) {
  //   axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGDocsDev', this.state.token)
  //   .then((res) => {
  //     console.log(res);
  //     if(JSON.parse(res.data).files !==undefined) {
  //       this.setState({ gDocs: JSON.parse(res.data).files, filteredGDocs: JSON.parse(res.data).files });
  //     } else {
  //       alert("Error fetching files");
  //     }
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   })
  // } else if(window.location.href.includes('graphite')) {
  //   axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev', this.state.token)
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // }
}

export function singleGDoc(props) {
  const object = {};
  object.token = this.state.token;
  object.docId = props.id;
  // if(window.location.href.includes('local')) {
    if(this.state.importAll) {
      var count = this.state.count + 1;
      window.Materialize.toast('Adding doc ' + count + ' of ' + this.state.gDocs.length, 4000);
    } else {
      window.Materialize.toast('Adding ' + props.name, 4000);
    }

    axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGDocContentDev', object)
      .then((res) => {

        this.setState({
          title: props.name,
          content: lzjs.compress(res.data),
          id: object.docId
        })
      })
      .then(() => {
        this.handleAddGDoc();
      })
      .catch(error => {
        console.log(error);
      })
  // } else if(window.location.href.includes('serene')) {
  //   axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev', object)
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // } else if(window.location.href.includes('graphite')) {
  //   axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/getGoogleAuthDev', object)
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // }
}

export function handleAddGDoc() {
  // var data = this.state.content;
  // var compressed = lzjs.compress(data);
  // console.log(compressed); // Outputs a compressed binary string
  // var decompressed = lzjs.decompress(compressed);
  // console.log(decompressed === data);
  const object = {};
  object.title = this.state.title;
  object.id = Date.now();
  object.updated = getMonthDayYear();
  object.tags = [];
  object.sharedWith = [];
  const objectTwo = {}
  objectTwo.title = object.title;
  objectTwo.id = object.id;
  objectTwo.updated = object.updated;
  objectTwo.content = this.state.content;
  objectTwo.compressed = true;
  objectTwo.tags = [];
  objectTwo.sharedWith = [];

  this.setState({ value: [...this.state.value, object] });
  this.setState({ filteredValue: [...this.state.filteredValue, object] });
  this.setState({ singleDoc: objectTwo });
  this.setState({ tempDocId: object.id });
  setTimeout(this.saveNewFile, 500);
}

export function importAllGDocs() {
  if(this.state.count < this.state.gDocs.length) {
    this.setState({ importAll: true });
    this.singleGDoc(this.state.gDocs[this.state.count]);
  } else {
    this.setState({ importAll: false });
    window.Materialize.toast('All documents imported', 4000);
  }

}
