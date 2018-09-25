import React, { Component } from "react";
import { Link } from 'react-router-dom';
export default class SingleForm extends Component {

  componentDidMount() {
    this.props.loadForms();
    window.$('.modal').modal();
  }


  render() {
    const { title, singleForm, formContents, optionValue } = this.props;
    let formContent;
    if(formContents !==undefined) {
      formContent = formContents
    } else {
      formContent = []
    }
    console.log(singleForm)
    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <Link to={'/forms'} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></Link>

              <ul className="left toolbar-menu">
              <li><a href="#titleModal" className="modal-trigger white-text small-menu"><i className="material-icons tiny right">edit</i>{singleForm.title || "Untitled Form"}</a></li>
              </ul>

          </div>
        </nav>
      </div>

      {/* Title Modal */}
      <div id="titleModal" className="modal">
        <div className="modal-content">
          <h4>Edit Form Title</h4>
          <label>Title</label>
          <p><input type="text" defaultValue={title} onChange={this.props.formTitleChange} /></p>
        </div>
        <div className="modal-footer">
          <a onClick={this.props.updateForm} className="modal-action modal-close waves-effect waves-green btn-flat">Save</a>
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
        </div>
      </div>
      {/* End Title Modal */}

      <div className="docs row">
        <div className="col s12 m4 grey">
          <div className="center-align">
          <h5>Add a question</h5>
            <div className="card"><button onClick={() => this.props.addQuestion("singleLine") } className="btn-flat">Single Line Text</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("paragraph")} className="btn-flat">Paragraph Text</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("email")} className="btn-flat">Email</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("number")} className="btn-flat">Number</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("multipleChoice")} className="btn-flat">Multiple Choice</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("dropdown")} className="btn-flat">Dropdown</button></div>
            <div className="card"><button onClick={() => this.props.addQuestion("checkbox")} className="btn-flat">Checkbox</button></div>
          </div>
        </div>
        <div className="col s12 m8">
          <h3 className="center-align">Your Form</h3>
          <div className="row">
          {
            formContent.length > 0 ?

            formContent.sort(function(a, b) {return a.position - b.position}).map(q => {
              return(
                  <div key={q.id} className="col s12">
                    <div className="card">
                      <div className="left reorder"><i className="material-icons">reorder</i></div>
                      <br />
                      <div className="card-content black-text">
                        {q.questionType === "singleLine" ? <p>Single Line</p> : q.questionType === "paragraph" ? <p>Paragraph</p> : q.questionType === "email" ? <p>Email</p> : q.questionType === "number" ? <p>Number</p> :
                         q.questionType === "multipleChoice" ? <p>Multiple Choice</p> : q.questionType === "dropdown" ? <p>Dropdown</p> : q.questionType === "checkbox" ? <p>Checkbox</p>:null
                        }
                        <span className="card-title"><label>Question title</label><input defaultValue={q.questionTitle === "New Question" ? null : q.questionTitle} onChange={this.props.handleQuestionTitle} placeholder="Enter question title" type="text" /></span>
                        <label>Help text</label>
                        <input type="text" defaultValue={q.helpText === "" ? null : q.helpText} onChange={this.props.handleHelpText} placeholder="Help text" />
                        {
                          q.questionType === "multipleChoice" || q.questionType === "dropdown" || q.questionType === "checkbox" ?
                            <div>
                            {
                              q.options.map(o => {
                                return(
                                  <p className="border" key={o.id}>{o.option}</p>
                                )
                              })
                            }
                            <input type="text" onChange={this.props.handleOptionValue} value={optionValue} placeholder="Enter option here" />
                            <button onClick={() => this.props.addOptions(q)} className="btn-flat">Add option</button>
                            </div>
                           :
                          null
                        }
                      </div>
                      <div className="card-action">
                        <a onClick={() => this.props.updateQuestion(q)} className="black-text">Save question</a>
                        <a href="#deleteModal" className="red-text modal-trigger">Delete question</a>
                      </div>
                      {/*Confirm Delete */}
                      <div id="deleteModal" className="modal">
                        <div className="modal-content">
                          <h4>Are you sure you want to delete?</h4>
                          <p>Question title: <strong>{q.questionTitle}</strong></p>
                        </div>
                        <div className="modal-footer">
                          <a onClick={() => this.props.deleteQuestion(q)} className="modal-action modal-close red-text btn-flat">Yes, delete</a>
                          <a className="modal-action modal-close btn-flat">Cancel</a>
                        </div>
                      </div>
                      {/*End Confirm Delete */}
                    </div>
                  </div>

              )
            })
            :
            <div>
              <h5 className="center-align">Add some questions by clicking the buttons on the left</h5>
            </div>
          }
          </div>
        </div>
      </div>
      </div>
    )
  }
}
