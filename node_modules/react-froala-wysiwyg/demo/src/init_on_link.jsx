// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorA from 'react-froala-wysiwyg/FroalaEditorA';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      content: {
        href: 'https://www.froala.com/wysiwyg-editor'
      },
      initControls: null
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
        <h2>Editor on 'a' tag.</h2>
        <div>
          <FroalaEditorA
            model={this.state.content}
            onModelChange={this.handleModelChange}
          >
            Froala Editor
          </FroalaEditorA>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

require("file-loader?name=[name].[ext]!./init_on_link.html");