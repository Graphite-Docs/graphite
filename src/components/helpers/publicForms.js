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
        console.log(this.state.publicForm)
        let filename = window.location.href.split('forms/public/')[1].split('?')[0] + '.json';
        let urlEncode;
        if(window.location.origin.includes('https')) {
          urlEncode = encodeURIComponent(window.location.origin.split('https://')[1]);
        } else {
          urlEncode = encodeURIComponent(window.location.origin.split('http://')[1]);
        }
        let sheet;
        let object = {};
        axios.get('https://gaia-gateway.com/jehunter5811.id/' + urlEncode + '//sheets/' + filename)
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
            object.identityAddress = '14zTFZn5NkBtHQgEzKFJA9RyUce9UJaHvv';
            object.authResponseToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJnYWlhQ2hhbGxlbmdlIjoiW1wiZ2FpYWh1YlwiLFwiMjAxOFwiLFwic3RvcmFnZS5ibG9ja3N0YWNrLm9yZ1wiLFwiYmxvY2tzdGFja19zdG9yYWdlX3BsZWFzZV9zaWduXCJdIiwiaHViVXJsIjoiaHR0cHM6Ly9odWIuYmxvY2tzdGFjay5vcmciLCJpc3MiOiIwMzVlODg4YTU4NDc3MGNjMGMyOTZkNDBjNGJhZDI3N2Y5MzA4OTllNjczMzZmYjFmNDdmNTIxNGQ5MDZmODkzNjIiLCJzYWx0IjoiYjMwMTdjYjA5MmEyYTc2YTY0ZTQ3OGQyZmM0MzA0MDUifQ.KuxpEHr8DWaNcqFaAeNkfb7v3R6ZK2012o35Dz3FD1pdM7SlfqPWkrVu44hCq9pHuz10Q00rCqt28CNkP7n42w';
            object.filename = fullFile;
            object.responses = responses;
            object.content = content;
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
