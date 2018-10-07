import React, { Component } from "react";
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
    const embed = "<iframe src='" + window.location.origin + '/forms/public/' + singleForm.id + "'></iframe>";

    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href='/forms' className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

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
        <div className="col s12 m4 question-types grey">
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
        <div className="col s12 form m8">
          {singleForm.published === true ? <button data-target="codeModal" className="btn-floating btn-small modal-trigger black"><i className="material-icons">code</i></button> : null}<button onClick={this.props.publishForm} className="btn green right">Publish Form</button>
          <h3 className="center-align">Your Form</h3>
          <div className="row">
          {
            formContent.length > 0 ?

            formContent.sort(function(a, b) {return a.position - b.position}).map(q => {

              return(
                  <div key={q.id} className="col s12">
                    <div className="card">
                      {/*<div className="left reorder"><i className="material-icons">reorder</i></div>*/}
                      <div className="switch required-or-not right">
                        <label>
                          Optional
                          <input checked={q.required} onChange={() => this.props.handleRequired(q)} type="checkbox" />

                          <span className="lever"></span>
                          Required
                        </label>
                      </div>
                      <br />
                      <div className="card-content black-text">
                        {q.questionType === "singleLine" ? <h6>Single Line</h6> : q.questionType === "paragraph" ? <p>Paragraph</p> : q.questionType === "email" ? <h6>Email</h6> : q.questionType === "number" ? <p>Number</p> :
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
                                const object = {};
                                object.o = o;
                                object.q = q;
                                return(
                                  <p className="border" key={o.id}>{o.option} <a onClick={() => this.props.removeOption(object)}><i className="material-icons circle red white-text tiny">remove</i></a></p>
                                )
                              })
                            }
                            <label>Add option</label>
                            <input type="text" className="options-input" onChange={this.props.handleOptionValue} value={optionValue} placeholder="Enter option here" />
                            <button onClick={() => this.props.addOptions(q)} className="btn-flat">Add option</button>
                            </div>
                           :
                          null
                        }

                      </div>
                      <div className="card-action">
                        <a onClick={() => this.props.updateQuestion(q)} className="black-text">Save question</a>
                        <a onClick={() => this.props.deleteQuestion(q)} className="red-text">Delete question</a>
                      </div>
                      {/*
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
                      */}
                    </div>
                  </div>

              )
            })
            :
            <div>
              <h5 className="center-align">Add some questions by clicking the buttons on the left</h5>
            </div>
          }
          <div id="codeModal" className="modal">
            <div className="modal-content">
              <h4>Embed Form</h4>
              <p>You can link directly to the form or embed it into your own site. If you would like to link to the form, this is the link: </p>
              <p className="url"><a target='_blank' rel="noopener noreferrer" href={window.location.origin + '/forms/public/' + window.location.href.split('forms/form/')[1]}>{window.location.origin + '/forms/public/' + window.location.href.split('forms/form/')[1]}</a></p>
              <p>If you would like to embed the form on your own site, use the following code: </p>
              <div className="code">
                {embed}
              </div>

            </div>
            <div className="modal-footer">
              <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    )
  }
}
