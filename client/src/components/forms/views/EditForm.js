import React, { Component, setGlobal } from 'reactn';
import { saveForm, deleteQuestion } from '../helpers/singleForm';
import { Form, Icon, Input, Radio, Button, Modal, Header, Card, Checkbox, List, Dropdown } from 'semantic-ui-react';
import update from 'immutability-helper';
const uuid = require('uuidv4');

class EditForm extends Component {
  constructor(props) {
      super(props);
      this.state = {
          questions: [], 
          questionModalOpen: false, 
          editQuestionOpen: false,
          questionType: "single", 
          questionText: "", 
          questionOptions: [],
          optionText: "",
          questionId: "", 
          fullQuestion: {},
          questionRequired: false
      }
  }

  handleOption = async () => {
      const { optionText, questionOptions } = this.state;
      let theseOptions = questionOptions;
      
      let newOption = {
          id: uuid(),
          optionText: optionText
      }
      theseOptions.push(newOption);
      this.setState({ questionOptions: theseOptions, optionText: "" });
  }

  handleAdd = () => {
      const { singleForm } = this.global;
      const { questionType, questionRequired, questionText, questionOptions } = this.state;
      let questions = singleForm.questions;
      let newQuestion;
      if(questionType === 'single' || questionType === 'multi') {
        newQuestion = {
            id: uuid(),
            type: questionType, 
            text: questionText, 
            options: [],
            required: questionRequired
        }
        questions.push(newQuestion);
        singleForm["questions"] = questions;
      } else if(questionType === 'multipleChoice' || questionType === 'checkbox') {
        newQuestion = {
            id: uuid(),
            type: questionType, 
            text: questionText, 
            options: questionOptions, 
            required: questionRequired
        }
        questions.push(newQuestion);
        singleForm["questions"] = questions;
      }

      setGlobal({ singleForm });
      this.setState({ questionModalOpen: false, questionType: 'single', questionText: "" });
      saveForm();
  }

  handleOptionText = (e) => {
      this.setState({ optionText: e.target.value });
  }

  handleQuestionText = (e) => {
      this.setState({ questionText: e.target.value });
  }

  handleEdit = (question) => {
      console.log(question);
      this.setState({ 
          questionText: question.text,
          questionType: question.type,
          questionOptions: question.options, 
          editQuestionOpen: true, 
          fullQuestion: question, 
          questionRequired: question.required
      });
  }

  handleSave = async () => {
      const { fullQuestion } = this.state;
      const { singleForm } = this.global;
      const questions = singleForm.questions;
      const { questionType, questionText, questionOptions, questionRequired} = this.state;
      const thisQuestion = {
        id: fullQuestion.id,
        type: questionType, 
        text: questionText, 
        options: questionOptions, 
        required: questionRequired
      }
      const index = await questions.map((x) => {return x.id }).indexOf(fullQuestion.id);
      if(index > -1) {
        const updatedQuestions = update(questions, {$splice: [[index, 1, thisQuestion]]});
        singleForm['questions'] = updatedQuestions;
        this.setState({ editQuestionOpen: false, questionType: 'single', questionText: "", questionOptions: [] });
        saveForm();
      } else {
          console.log("Index error");
      } 
  }

  deleteOption = async (option) => {
    const { questionOptions } = this.state;
    const index = await questionOptions.map((x) => {return x.id }).indexOf(option.id);
    if(index  > -1) {
        questionOptions.splice(index, 1);
        this.setState({ questionOptions });
    } else {
        console.log("Error with index");
    }
  }

  handleQuestionTypeChange = (e, { value }) => this.setState({ questionType: value })

  render() {
      const { singleForm } = this.global;
      const { editQuestionOpen, questionText, questionModalOpen, questionType, questionOptions, optionText } = this.state;
      const options = [
        { key: 'single', text: 'Single Line', value: 'single' },
        { key: 'multi', text: 'Multi-Line', value: 'multi' },
        { key: 'multipleChoice', text: 'Multiple Choice', value: 'multipleChoice' },
        { key: 'checkbox', text: 'Checkbox', value: 'checkbox' },
      ]
      let theseQuestions;
      if(singleForm.questions) {
          theseQuestions = singleForm.questions;
      } else {
          theseQuestions = [];
      }
      return (
        <div>
            <div className="form-side">
            <Modal open={questionModalOpen} onClose={() => this.setState({ questionModalOpen: false })}>
                <Modal.Content>
                <Modal.Description>
                    <Header>New Question</Header>
                    <Form>
                        <Form.Field>
                            <label>Question Text</label>
                            <Input onChange={this.handleQuestionText} type="text" placeholder="Question title" />
                            <Radio className="margin-top-10" onChange={() => this.setState({ questionRequired: !this.state.questionRequired })} checked={this.state.questionRequired} toggle label="Required?"/>
                        </Form.Field>
                        { 
                            questionType === 'multipleChoice' ?
                            <Form.Field>
                                <label>Add new question option</label>
                                <Input onChange={this.handleOptionText} value={optionText} type="text" />
                                <Button className="margin-top-10" onClick={this.handleOption}>Add</Button>
                                {
                                    questionOptions.map(opt => {
                                        return(
                                            <div className="margin-top-10" key={opt.id}>
                                                <Radio label={opt.optionText} /> <Icon onClick={() => this.deleteOption(opt)} name="minus circle" style={{color: "red", cursor: "pointer"}} /><br/>
                                            </div>
                                        )
                                    })
                                }
                            </Form.Field> : 
                            questionType === "checkbox" ? 
                            <Form.Field>
                                <label>Add new question option</label>
                                <Input onChange={this.handleOptionText} value={optionText} type="text" />
                                <Button className="margin-top-10" onClick={this.handleOption}>Add</Button>
                                {
                                    questionOptions.map(opt => {
                                        return(
                                            <div className="margin-top-10" key={opt.id}>
                                                <Checkbox label={opt.optionText} /> <Icon onClick={() => this.deleteOption(opt)} name="minus circle" style={{color: "red", cursor: "pointer"}} /> <br/>
                                            </div>
                                        )
                                    })
                                }
                            </Form.Field> : 
                            <div className="hide" />
                        }
                        <Form.Field>
                            <label>Question Type</label>
                            <Dropdown
                                onChange={this.handleQuestionTypeChange}
                                options={options}
                                placeholder='Choose an option'
                                selection
                                value={questionType}
                            />
                        </Form.Field>
                    </Form>
                    <div className="margin-top-20">
                        <Button onClick={this.handleAdd} secondary>Add Question</Button><Button onClick={() => this.setState({ questionModalOpen: false, questionType: 'single'})}>Cancel</Button>
                    </div>
                </Modal.Description>
                </Modal.Content>
            </Modal>

            <Modal open={editQuestionOpen} onClose={() => this.setState({ editQuestionOpen: false })}>
                <Modal.Content>
                <Modal.Description>
                    <Header>Edit Question</Header>
                    <Form>
                        <Form.Field>
                            <label>Question Text</label>
                            <Input onChange={this.handleQuestionText} value={questionText} type="text" placeholder="Question title" />
                            <Radio className="margin-top-10" onChange={() => this.setState({ questionRequired: !this.state.questionRequired })} checked={this.state.questionRequired} toggle label="Required?"/>
                        </Form.Field>
                        { 
                            questionType === 'multipleChoice' ?
                            <Form.Field>
                                <label>Add new question option</label>
                                <Input onChange={this.handleOptionText} value={optionText} type="text" />
                                <Button className="margin-top-10" onClick={this.handleOption}>Add</Button>
                                {
                                    questionOptions.map(opt => {
                                        return(
                                            <div className="margin-top-10" key={opt.id}>
                                                <Radio label={opt.optionText} /> <Icon onClick={() => this.deleteOption(opt)} name="minus circle" style={{color: "red", cursor: "pointer"}} /><br/>
                                            </div>
                                        )
                                    })
                                }
                            </Form.Field> : 
                            questionType === "checkbox" ? 
                            <Form.Field>
                                <label>Add new question option</label>
                                <Input onChange={this.handleOptionText} value={optionText} type="text" />
                                <Button className="margin-top-10" onClick={this.handleOption}>Add</Button>
                                {
                                    questionOptions.map(opt => {
                                        return(
                                            <div className="margin-top-10" key={opt.id}>
                                                <Checkbox label={opt.optionText} /> <Icon onClick={() => this.deleteOption(opt)} name="minus circle" style={{color: "red", cursor: "pointer"}} /> <br/>
                                            </div>
                                        )
                                    })
                                }
                            </Form.Field> : 
                            <div className="hide" />
                        }
                        <Form.Field>
                            <label>Question Type</label>
                            <Dropdown
                                onChange={this.handleQuestionTypeChange}
                                options={options}
                                placeholder='Choose an option'
                                selection
                                value={questionType}
                            />
                        </Form.Field>
                    </Form>
                    <div className="margin-top-20">
                        <Button onClick={this.handleSave} secondary>Save Question</Button><Button onClick={() => this.setState({ editQuestionOpen: false, questionType: 'single'})}>Cancel</Button>
                    </div>
                </Modal.Description>
                </Modal.Content>
            </Modal>
                <h3>Add Questions</h3>
                
                <List>
                    <List.Item className="margin-top-10">
                        <button className="link-button" onClick={() => this.setState({ questionModalOpen: true, questionType: 'single'})}>Single Line Text</button>
                    </List.Item>
                    <List.Item className="margin-top-10">
                        <button className="link-button" onClick={() => this.setState({ questionModalOpen: true, questionType: 'multi'})}>Multi-Line Text</button>
                    </List.Item>
                    <List.Item className="margin-top-10">
                        <button className="link-button" onClick={() => this.setState({ questionModalOpen: true, questionType: 'multipleChoice'})}>Multiple Choice</button>
                    </List.Item>
                    <List.Item className="margin-top-10">
                        <button className="link-button" onClick={() => this.setState({ questionModalOpen: true, questionType: 'checkbox'})}>Checkbox</button>
                    </List.Item>
                </List>                
            </div>
            <div className="form-main-container">
                <Form>
                {
                    theseQuestions.map((question) => {
                        return(
                            <Form.Field key={question.id}>
                                {
                                    question.type === "single" ? 
                                    <Card className="margin-top-10 form-card">
                                        <h4>{question.text} 
                                        <Dropdown style={{marginLeft: "20px"}} icon='ellipsis vertical' className='actions'>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>
                                                    <Icon onClick={() => this.handleEdit(question)} name="edit" />
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                <Icon onClick={() => deleteQuestion(question)} name="trash alternate outline" />
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        </h4> 
                                        <input type="text" />                                        
                                    </Card> : 
                                    question.type === "multi" ?
                                    <Card className="margin-top-10 form-card">
                                        <h4>{question.text} 
                                        <Dropdown style={{marginLeft: "20px"}} icon='ellipsis vertical' className='actions'>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>
                                                    <Icon onClick={() => this.handleEdit(question)} name="edit" />
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                <Icon onClick={() => deleteQuestion(question)} name="trash alternate outline" />
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        </h4>
                                        <textarea></textarea>
                                        <hr />
                                    </Card> : 
                                    question.type === "multipleChoice" ? 
                                    <Card className="margin-top-10 form-card">
                                        <h4>{question.text} 
                                        <Dropdown style={{marginLeft: "20px"}} icon='ellipsis vertical' className='actions'>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>
                                                    <Icon onClick={() => this.handleEdit(question)} name="edit" />
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                <Icon onClick={() => deleteQuestion(question)} name="trash alternate outline" />
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        </h4>
                                        {
                                            question.options.map(opt => {
                                                return (
                                                    <Form.Field label={opt.optionText} control='input' type='radio' name={opt.id} />
                                                );
                                            })
                                        }
                                        <hr />
                                    </Card> : 
                                    <Card className="margin-top-10 form-card">
                                        <h4>{question.text} 
                                        <Dropdown style={{marginLeft: "20px"}} icon='ellipsis vertical' className='actions'>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>
                                                    <Icon onClick={() => this.handleEdit(question)} name="edit" />
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                <Icon onClick={() => deleteQuestion(question)} name="trash alternate outline" />
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        </h4>
                                        {
                                            question.options.map(opt => {
                                                return (
                                                    <Form.Field label={opt.optionText} control='input' type='checkbox' />
                                                );
                                            })
                                        }
                                        <hr />
                                    </Card>
                                }
                            </Form.Field>
                        )
                    })
                }
                </Form>
            </div>
        </div>
       );
  }
}

export default EditForm;
