import {
  getFile
} from 'blockstack';

export function loadPublicForm() {
  const file = window.location.href.split('forms/public/')[1];
  const fullFile = '/forms/public/' + file + '.json'
  getFile(fullFile, {decrypt: false})
    .then((fileContents) => {
      this.setState({publicForm: JSON.parse(fileContents), formContents: JSON.parse(fileContents).formContents})
    })
    .catch(error => {
      console.log(error);
    })
}
