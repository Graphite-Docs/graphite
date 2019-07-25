import React, { Component } from 'reactn';
import { Container, Card, Form, Button } from 'semantic-ui-react';
import PublicFormSkel from './PublicFormSkel';
import { loadPublicForm, postForm } from '../helpers/publicForm';
import { ToastsStore} from 'react-toasts';
let allowSubmit = true;

class PublicForm extends Component {
  constructor(props) {
      super(props);
      this.state = {
        allowSubmit: false
      };
  }
  componentDidMount() {
    document.body.style.background = "#eee";
    loadPublicForm();
  }

  handleChange = (e, type, optId) => {
    if(type === 'checkbox') {
        const {name, checked} = e.target
        this.setState({
            [name]: checked
        }, () => {
            console.log(this.state)
        })
    } else if(type === 'multipleChoice') {
        const {name} = e.target;
        this.setState({
            [name]: optId
        }, () => {
            console.log(this.state)
        })
    }
  }

  handleSubmit = () => {
      allowSubmit = true;
      const { publicForm } = this.global;
      const questions = publicForm.questions;
      let responses = [];
      for(const question of questions) {
          let questionObj;
          if(question.type === "checkbox") {
            let answers = [];
            for(const opt of question.options) {
                if(this.state[opt.id]) {
                    if(this.state[opt.id] === true) {
                        answers.push(opt.optionText);
                    }
                }
            }
            questionObj = {
                id: question.id, 
                text: question.text, 
                response: answers
            }
          } else if(question.type === 'multipleChoice') {
            let answers = [];
            for(const opt of question.options) {
                if(this.state[question.id]) {
                    if(opt.id === this.state[question.id]) {
                        answers.push(opt.optionText);
                    }
                }
            }
            questionObj = {
                id: question.id, 
                text: question.text, 
                response: answers
            }
          } else {
            questionObj = {
                id: question.id,
                text: question.text,
                response: document.getElementById(question.id) ? document.getElementById(question.id).value : ""
            }
          }
        if(questionObj.response) {
            responses.push(questionObj);
        } else {
            if(question.required) {
                allowSubmit = false;
                ToastsStore.error(`Please answer all required questions`);
            } else {
                responses.push(questionObj);
            }
        }
        // if(question.required && !questionObj.response) {
        //     allowSubmit = false;
        // } 
      }
      if(allowSubmit) {
        this.setState({ submitting: true });
        postForm(responses);
      } 

      console.log(allowSubmit);
  }

  render() {
      const { loading, submitted, publicForm } = this.global;
      const { submitting } = this.state;
      if(loading) {
        return(
            <PublicFormSkel />
        )
      } else {
        if(submitted === true) {
            return (
                <div className="margin-top-85 center">
                    <Container>
                        <h3>Thank you for your submission!</h3>
                    </Container>
                </div>
            )
        } else {
            return (
                <div>
                    <Container>
                        <div className="center margin-top-25">
                            <h1>{publicForm.title}</h1>
                            <p style={{color: "red", float: "right"}}>* Required</p>
                        </div>
                        <Card className="public-form-card">
                            <Form>
                                {
                                    publicForm.questions.map(question => {
                                        return(
                                            <Form.Field key={question.id}>
                                                {
                                                    question.type === "single" ? 
                                                    <Card className="margin-top-10 form-card">
                                                        <h4>{question.text}<span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>{question.required ? "*" : ""}</span></h4> 
                                                        <input id={question.id} type="text" />                                        
                                                    </Card> : 
                                                    question.type === "multi" ?
                                                    <Card className="margin-top-10 form-card">
                                                        <h4>{question.text}</h4>
                                                        <textarea id={question.id}></textarea>
                                                    </Card> : 
                                                    question.type === "multipleChoice" ? 
                                                    <Card className="margin-top-10 form-card">
                                                        <h4>{question.text} <span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>{question.required ? "*" : ""}</span></h4>
                                                        {
                                                            question.options.map(opt => {
                                                                return (
                                                                    <Form.Field 
                                                                        key={opt.id}
                                                                        label={opt.optionText}
                                                                        className={question.id}
                                                                        value={opt.optionText}
                                                                        checked={this.state[opt.id]}
                                                                        control='input' 
                                                                        type='radio' 
                                                                        onChange={(e) => this.handleChange(e, 'multipleChoice', opt.id)}
                                                                        name={question.id} />
                                                                );
                                                            })
                                                        }
                                                    </Card> : 
                                                    <Card className="margin-top-10 form-card">
                                                        <h4>{question.text} <span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>{question.required ? "*" : ""}</span></h4>
                                                        {
                                                            question.options.map(opt => {
                                                                return (
                                                                    <Form.Field key={opt.id} className={question.id} onChange={(e) => this.handleChange(e, 'checkbox')} name={opt.id} label={opt.optionText} control='input' checked={this.state[opt.id]} type='checkbox' />
                                                                );
                                                            })
                                                        }
                                                    </Card>
                                                }
                                            </Form.Field>
                                        )
                                    })
                                }
                                <Button onClick={this.handleSubmit} type='submit'>{submitting ? "Submitting..." : "Submit"}</Button>
                            </Form>
                        </Card>
                    </Container>
                </div>
               );
        }
      }
  }
}

export default PublicForm;
