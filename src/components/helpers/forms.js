import { getMonthDayYear } from './getMonthDayYear';
import {
  putFile,
  getFile
} from 'blockstack';
import update from 'immutability-helper';
const uuidv4 = require('uuid/v4');

export function loadForms() {
  getFile('forms.json', {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
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
  getFile('forms/' + window.location.href.split('/forms/form/')[1] + '.json', {decrypt: true})
    .then((fileContents) => {
      console.log(JSON.parse(fileContents))
      this.setState({
        singleForm: JSON.parse(fileContents || '{}'),
        formContents: JSON.parse(fileContents || '{}').formContents,
        tags: JSON.parse(fileContents || '{}').tags
      })
    })
    .then(() => {
      window.$('.modal').modal();
    })
    .catch(error => {
      console.log(error);
    })
}

export function handleAddForm() {
  const object = {};
  object.id = uuidv4();
  if(this.state.title === "" || this.state.title === undefined) {
    object.title = "Untitled Form";
  } else {
    object.title = this.state.title;
  }
  object.formContents = [];
  object.tags = [];
  object.date = getMonthDayYear();
  this.setState({ forms: [...this.state.forms, object ], singleForm: object });
  setTimeout(this.saveForm, 300);
}

export function updateForm() {
  const object = {};
  object.id = window.location.href.split('/forms/form/')[1];
  if(this.state.title !=="") {
    object.title = this.state.title;
  } else {
    object.title = this.state.singleForm.title;
  }
  object.formContents = this.state.formContents;
  object.tags = this.state.singleForm.tags;
  object.date = getMonthDayYear();
  this.setState({ singleForm: object });
  const index = this.state.index;
  const updatedForm = update(this.state.forms, {$splice: [[index, 1, object]]});
  this.setState({forms: updatedForm})
  window.Materialize.toast("Form saved!", 3000);
  setTimeout(this.saveForm, 300);
}

export function saveForm() {
  //TODO refactor to post to account owner's storage only here
  putFile('forms/' + this.state.singleForm.id + '.json', JSON.stringify(this.state.singleForm), {encrypt: true})
    .catch(error => {
      console.log(error);
    })
  putFile('forms.json', JSON.stringify(this.state.forms), {encrypt: true})
    .then(() => {
      if(window.location.pathname === '/forms') {
        window.location.replace(window.location.origin + '/forms/form/' + this.state.singleForm.id);
      } else {
        this.loadForms();
      }
    })
}

export function addQuestion(props) {
  // console.log(props);
  const object = {};
  object.id = uuidv4();
  object.questionType = props;
  object.position = this.state.formContents.length + 1;
  if(props === "multipleChoice" || props === "dropdown" || props === "checkbox") {
    object.options = [];
  }
  object.questionTitle = "New Question";
  object.helpText = "";
  this.setState({ formContents: [...this.state.formContents, object] });
  setTimeout(this.updateForm, 300)
}

export function formTitleChange(e) {
  this.setState({ title: e.target.value });
}

export function handleQuestionTitle(e) {
  this.setState({ questionTitle: e.target.value });
}

export function handleHelpText(e) {
  this.setState({ helpText: e.target.value });
}

export function handleOptionValue(e) {
  this.setState({ optionValue: e.target.value })
}

export function addOptions(props) {
  let qObject = this.state.formContents.find(function(element) {
    return element.id === props.id
  });
  let options = qObject.options;
  const optionObject = {};
  optionObject.id = uuidv4();
  optionObject.option = this.state.optionValue;
  options.push(optionObject);

  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const object = {};
  object.id = props.id;
  object.questionType = props.questionType;
  if(this.state.questionTitle !== "") {
    object.questionTitle = this.state.questionTitle;
  } else {
    object.questionTitle = props.questionTitle;
  }
  object.position = props.position;
  if(props.questionType === "multipleChoice" || props.questionType === "dropdown" || props.questionType === "checkbox") {
    if(options === []) {
      object.options = [];
    } else {
      object.options = options;
    }
  }
  if(this.state.helpText !=="") {
    object.helpText = this.state.helpText;
  } else {
    object.helpText = props.helpText;
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const updatedQuestion = update(this.state.formContents, {$splice: [[indexCheck, 1, object]]});
  this.setState({ formContents: updatedQuestion, optionValue: "" });
  setTimeout(this.updateForm, 300)
}

export function updateQuestion(props) {
  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const object = {};
  object.id = props.id;
  object.questionType = props.questionType;
  if(this.state.questionTitle !== "") {
    object.questionTitle = this.state.questionTitle;
  } else {
    object.questionTitle = props.questionTitle;
  }
  object.position = props.position;
  if(props === "multipleChoice" || props === "dropdown" || props === "checkbox") {
    if(this.state.options === []) {
      object.options = [];
    } else {
      object.options = this.state.options;
    }
  }
  if(this.state.helpText !=="") {
    object.helpText = this.state.helpText;
  } else {
    object.helpText = props.helpText;
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const updatedQuestion = update(this.state.formContents, {$splice: [[indexCheck, 1, object]]});
  this.setState({ formContents: updatedQuestion });
  setTimeout(this.updateForm, 300)
}

export function deleteQuestion(props) {
  const thisQ = this.state.formContents.find((q) => {
    return q.id.toString() === props.id //this is comparing a string to a string
  });
  let index = thisQ && thisQ.id;
  function findObjectIndex(q) {
    return q.id === index; //this is comparing a number to a number
  }
  const indexCheck = this.state.formContents.findIndex(findObjectIndex);
  const newFormContents = update(this.state.formContents, {$splice: [[indexCheck, 1]]})
  this.setState({ formContents: newFormContents });
  setTimeout(this.updateForm, 300);
}
