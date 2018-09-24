import React, { Component } from "react";

export default class SingleForm extends Component {

  componentDidMount() {
    this.props.loadSingleForm();
    window.$('.modal').modal();
  }


  render() {
    const { title, singleForm, formContents } = this.props;
    console.log(singleForm);
    console.log(formContents);

    return(
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a onClick={this.props.handleFormBack} className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

              <ul className="left toolbar-menu">
              <li><a href="#titleModal" className="modal-trigger white-text small-menu"><i className="material-icons tiny right">edit</i>{title || "Untitled Form"}</a></li>
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
          <a onClick={this.props.saveForm} className="modal-action modal-close waves-effect waves-green btn-flat">Save</a>
          <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
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
            formContents.sort(function(a, b) {return a.position - b.position}).map(q => {
              return(

                  <div key={q.id} className="col s12">
                    <div className="card">
                      <div className="card-content black-text">
                        {q.questionType === "singleLine" ? <p>Single Line</p> : q.questionType === "paragraph" ? <p>Paragraph</p> : q.questionType === "email" ? <p>Email</p> : q.questionType === "number" ? <p>Number</p> :
                         q.questionType === "multipleChoice" ? <p>Multiple Choice</p> : q.questionType === "dropdown" ? <p>Dropdown</p> : q.questionType === "checkbox" ? <p>Checkbox</p>:null
                        }
                        <span className="card-title"><label>Question title</label><input value={q.questionTitle === "New Question" ? null : q.questionTitle} placeholder="Enter question title" type="text" /></span>
                        <label>Help text</label>
                        <input type="text" placeholder="Help text" />
                        {
                          q.questionType === "multipleChoice" || q.questionType === "dropdown" || q.questionType === "checkbox" ?
                            <div>
                            <input type="text" placeholder="Option 1" />
                            <button className="btn-flat">Add option</button>
                            </div>
                           :
                          null
                        }
                      </div>
                      <div className="card-action">
                        <a className="black-text">Save question</a>
                        <a className="red-text" href="#">Delete question</a>
                      </div>
                    </div>
                  </div>

              )
            })
          }
          </div>
        </div>
      </div>
      </div>
    )
  }
}
