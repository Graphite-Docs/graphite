// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import 'file-loader?name=[name].[ext]!./full_editor.html';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      content: '<span>My Document\'s Title</span>'
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
        <h2>Full Featured</h2>
        <FroalaEditor
          model={this.state.content}
          onModelChange={this.handleModelChange}
        />
        <h4>Rendered Content:</h4>
        <FroalaEditorView
          model={this.state.content}
        />
      </div>
    );
  }

}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

