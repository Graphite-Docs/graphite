import {
  getFile
} from 'blockstack';
import axios from 'axios';

export function loadPublicForm() {
  const file = window.location.href.split('forms/public/')[1];

  const fullFile = '/forms/public/' + file + '.json'
  getFile(fullFile, {decrypt: false})
    .then((fileContents) => {
      this.setState({publicForm: JSON.parse(fileContents), formContents: JSON.parse(fileContents).formContents})
    })
    .then(() => {
      console.log(this.state.publicForm._exp.split('/')[0].split(':')[1]);
    })
    .catch(error => {
      console.log(error);
    })
}

export function postFormResponses() {
  const file = window.location.href.split('forms/public/')[1].split('?')[0]
  const fullFile = '/forms/public/' + file + '.json'
  getFile(fullFile, {decrypt: false})
    .then((fileContents) => {
      this.setState({publicForm: JSON.parse(fileContents), formContents: JSON.parse(fileContents).formContents}, () => {
        let filename = window.location.href.split('forms/public/')[1].split('?')[0] + '.json';
        let urlEncode;
        if(window.location.origin.includes('https')) {
          urlEncode = encodeURIComponent(window.location.origin.split('https://')[1]);
        } else {
          urlEncode = encodeURIComponent(window.location.origin.split('http://')[1]);
        }
        let sheet;
        let object = {};
        axios.get('https://gaia-gateway.com/' + this.state.publicForm.owner + '/' + urlEncode + '//sheets/' + filename)
          .then((res) => {
            console.log(res.data);
            sheet = res.data;
          })
          .then(() => {
            let responses;
            let a = decodeURIComponent(window.location.href.split('?')[1]).split('&');
            responses = a.map(a => a.split('=')[1]);
            // console.log(JSON.stringify(responses));
            const file = window.location.href.split('forms/public/')[1].split('?')[0];
            const fullFile = '/sheets/' + file + '.json'
            const content = {};
            content.title = sheet.title;
            content.id = sheet.id;
            content.fileType = "sheets";
            content.form = true;
            content.sharedWith = sheet.sharedWith;
            content.updated = sheet.updated;
            content.content = [...sheet.content, responses];
            object.identityAddress = this.state.publicForm._exp.split('/')[1];
            object.authResponseToken = this.state.publicForm._exp.split('/')[0].split(':')[1];
            object.responses = responses;
            object.content = content;
            object.filename = fullFile;
            console.log(object);
          })
          .then(() => {
            console.log("posting");
            axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/public-form', JSON.stringify(object))
              .then((res) => {
                console.log(res);
              })
              .catch(error => {
                console.log(error);
              })
          })
          .catch(error => {
            console.log(error);
          })
      })
    })
    .catch(error => {
      console.log(error);
    })

  // console.log(JSON.parse(localStorage.getItem('blockstack-gaia-hub-config')).token);
  // console.log(decodeURIComponent(window.location.href.split('?')[1]).split('&'));
}
