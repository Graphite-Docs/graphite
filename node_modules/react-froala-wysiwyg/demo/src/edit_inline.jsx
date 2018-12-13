// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.min.js';
import 'froala-editor/css/froala_editor.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor() {
    super();

    this.config = {
      placeholderText: 'Add a Title',
      charCounterCount: false,
      toolbarInline: true,
      events: {
        'froalaEditor.initialized': function() {
          console.log('initialized');
        }
      }
    };

    this.state = {
      myTitle: 'Click here to edit this text.'
    };

    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleModelChange (model) {
    this.setState({
      myTitle: model
    })
  }

  handleInputChange (e) {
    this.setState({
      myTitle: e.target.value
    })
  }

  render () {
    return(
      <div className="sample">
        <h2>Inline Edit</h2>
        <FroalaEditor
          tag='textarea'
          config={this.config}
          model={this.state.myTitle}
          onModelChange={this.handleModelChange}
        />
        <textarea value={this.state.myTitle} onChange={this.handleInputChange}></textarea>
      </div>
    );
  }
}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

require("file-loader?name=[name].[ext]!./edit_inline.html");