// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.min.js';
import 'froala-editor/css/froala_editor.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import 'file-loader?name=[name].[ext]!./init_on_input.html';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorInput from 'react-froala-wysiwyg/FroalaEditorInput';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      content: {
        placeholder: 'I am an input!'
      }
    };

    this.handleModelChange = this.handleModelChange.bind(this);
  }

  handleModelChange (model) {
    this.setState({
      content: model
    });
  }

  render () {
    return(
      <div className="sample">
        <h2>Sample 7: Editor on 'input' tag</h2>
        <FroalaEditorInput
          model={this.state.content}
          onModelChange={this.handleModelChange}
        />
        <h4>Model Obj:</h4>
        <div>{JSON.stringify(this.state.content)}</div>
      </div>
    );
  }
}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

