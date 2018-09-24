import { getMonthDayYear } from './getMonthDayYear';
import {
  putFile,
  getFile
} from 'blockstack';
const uuidv4 = require('uuid/v4');

export function loadForms() {
  getFile('forms.json', {decrypt: true})
    .then((fileContents) => {
      this.setState({
        forms: JSON.parse(fileContents || '{}')
      })
    })
    .then(() => {
      const thisForm = this.state.forms.find((form) => {
        return form.id.toString() === window.location.href.split('/forms/form/')[1] //this is comparing a string to a string
      });
      let index = thisForm && thisForm.id;
      function findObjectIndex(form) {
        return form.id === index; //this is comparing a number to a number
      }
      this.setState({index: this.state.forms.findIndex(findObjectIndex)})
    })
    .then(() => {
      this.loadSingleForm();
    })
    .catch(error => {
      console.log(error);
    })
}

export function loadSingleForm() {
  getFile(window.location.href.split('/forms/form/')[1] + '.json', {decrypt: true})
    .then((fileContents) => {
      this.setState({
        singleForm: JSON.parse(fileContents || '{}'),
        formContents: JSON.parse(fileContents || '{}').formContents
      })
    })
    .catch(error => {
      console.log(error);
    })
}

export function handleAddForm() {
  const object = {};
  object.id = uuidv4();
  if(this.state.title === "") {
    object.title = "Untitled Form";
  } else {
    object.title = this.state.title;
  }
  object.title = this.state.title;
  object.formContents = this.state.formContents;
  object.tags = [];
  object.date = getMonthDayYear();
  this.setState({ forms: [...this.state.forms, object ], singleForm: object });
  setTimeout(this.saveForm, 300);
}

export function updateForm() {
  const object = {};
  object.id = uuidv4();
  object.title = this.state.title;
  object.formContents = this.state.formContents;
  object.tags = this.state.formTags;
  object.date = getMonthDayYear();

}

export function saveForm() {
  //TODO refactor to post to account owner's storage only here
  putFile(this.state.singleForm.id + '.json', JSON.stringify(this.state.singleForm), {encrypt: true})
    .catch(error => {
      console.log(error);
    })
  putFile('forms.json', JSON.stringify(this.state.forms), {encrypt: false})
    .then(() => {
      if(window.location.pathname === '/forms') {
        window.location.replace(window.location.origin + '/forms/form/' + this.state.singleForm.id);
      }
    })
}

export function addQuestion(props) {
  console.log(props);
  const object = {};
  object.id = uuidv4();
  object.questionType = props;
  object.position = this.state.formContents.length + 1;
  if(props === "multipleChoice" || props === "dropdown" || props === "checkbox") {
    object.options = [];
  }
  object.questionTitle = "New Question";
  object.helpText = "";
  this.setState({ formContents: [...this.state.formContents, object] })
}
