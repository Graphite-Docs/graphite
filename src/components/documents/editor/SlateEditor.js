import { Editor } from 'slate-react'
// import { Value } from 'slate';
import React from 'react'

class SlateEditor extends React.Component {

  change = (change, options = {}) => {
    this.props.handleChange(change, options = {})
  }

  render() {
    if(this.props.content) {
      return (
        <div className="editor ql-editor">
          <Editor
            placeholder="Enter some text..."
            value={this.props.content}
            onChange={this.change}
            spellCheck
          />
        </div>
      )
    } else {
      return (
        <div className="editor ql-editor" style={{textAlign: "center"}}>
          <h3>Loading...</h3>
        </div>
      )
    }

  }

}


export default SlateEditor;
