// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.min.js';
import 'froala-editor/css/froala_editor.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import 'file-loader?name=[name].[ext]!./two_way_binding.html';

import FroalaEditor from 'react-froala-wysiwyg';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor () {
    super();

    this.state = {
      content: 'Type here and the other input should update.'
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
        <h2>Two way binding</h2>
        <FroalaEditor
          model={this.state.content}
          onModelChange={this.handleModelChange}
        /><br/>
        <FroalaEditor
          model={this.state.content}
          onModelChange={this.handleModelChange}
        />
      </div>
    );
  }
}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

