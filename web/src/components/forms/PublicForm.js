import React, { Component } from "react";
// import { Link } from 'react-router-dom';

export default class PublicForm extends Component {

  componentDidMount() {
    window.location.href.split('?').length > 1 ? this.props.postFormResponses() : this.props.loadPublicForm();
  }


  render() {
    const { publicForm, formContents } = this.props;
    console.log(formContents)
    return(
      <div>
        <div className="container">
          {
            window.location.href.split('?').length > 1 ?
            <div>
              <h3>Thank you for your submission!</h3>
            </div> :
            <div className="card form-view">
            <h3>{publicForm.title}</h3>
            <form>
            {
              formContents.map(q => {
                return (
                  <div key={q.id}>
                  <h5>
                    {q.questionTitle} {q.required ? <span className="red-text">*</span>: null}
                  </h5>
                  <div>
                  {
                    q.questionType === "singleLine" || q.questionType === "email" || q.questionType === "number" ?
                    <div><p>{q.helpText}</p>{q.required ? <input type="text" name={q.questionTitle} placeholder={q.questionTitle} required />: <input type="text" name={q.questionTitle} placeholder={q.questionTitle} />}</div> :
                    q.questionType === "multipleChoice" ?
                    <div>
                    {
                      q.options.map(o => {
                        return(
                          <div key={o.id}>
                          <input type="radio" id={o.id} value={o.option} name={q.questionTitle} />
                          <label htmlFor={o.id}>
                          {o.option}
                          </label>
                          </div>
                        )
                      })
                    }
                    </div> :
                    q.questionType === "paragraph" ?
                    <div>
                      <p>{q.helpText}</p>
                      <textarea rows="30" name={q.questionTitle} placeholder={q.questionTitle}></textarea>
                    </div> :
                    q.questionType === "dropdown" ?
                    <div><p>{q.helpText}</p>
                    <select name={q.questionTitle} id={q.questionTitle}>
                      <option value="" disabled selected>Make a selection</option>
                    {
                      q.options.map(o => {
                        return (
                          <option key={o.id} name={o.option}>{o.option}</option>
                        )
                      })
                    }
                    </select></div> :
                    q.questionType === "checkbox" ?
                    <div>
                    <p>{q.helpText}</p>
                    {
                      q.options.map(o => {
                        return(
                          <div>
                            <input id={o.id} value={o.option} type="checkbox" key={o.id} name={q.questionTitle} />
                            <label htmlFor={o.id} className="publicFormCheckbox">{o.option}</label>
                          </div>
                        )
                      })
                    }
                    </div> :
                    null
                  }
                  </div>
                  </div>
                )
              })
            }
              <input className="btn green submit-btn" type="submit" value="Submit" />
            </form>
            </div>
          }
        </div>
      </div>
    )
  }
}
