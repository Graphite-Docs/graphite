// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.min.js';
import 'froala-editor/css/froala_editor.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import 'file-loader?name=[name].[ext]!./manual_initialization.html';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor () {
    super();

    this.state = {
      initControls: null
    };

    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleController = this.handleController.bind(this);
    this.initializeEditor = this.initializeEditor.bind(this);
    this.destroyEditor = this.destroyEditor.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
  }

  handleModelChange (model) {
    this.setState({content: model});
  }

  deleteAll () {
    if (!this.state.initControls) {
      return;
    }
    this.state.initControls.getEditor()('html.set', '');
    this.state.initControls.getEditor()('undo.reset');
    this.state.initControls.getEditor()('undo.saveStep');
  }

  handleController (initControls) {
    this.setState({initControls: initControls});
  }

  initializeEditor () {
    this.state.initControls.initialize();
    this.setState({initControls: this.state.initControls});
  }

  destroyEditor () {
    this.state.initControls.destroy();
    this.setState({initControls: this.state.initControls});
  }

  render () {
    return(
      <div className="sample">
        <h2>Manual Initialization</h2>
        {this.state.initControls ?
            <button className="manual" onClick={this.initializeEditor}>Initialize Editor</button>
            :
          null
        }
        {this.state.initControls && this.state.initControls.getEditor() ?
          <span>
            <button className="button" onClick={this.destroyEditor}>Close Editor</button>
            <button className="button" onClick={this.deleteAll}>Delete All</button>
          </span>
            :
          null
        }
        <FroalaEditor
          model={this.state.content}
          onModelChange={this.handleModelChange}
          onManualControllerReady={this.handleController}
        >
          Check out the <a href="https://www.froala.com/wysiwyg-editor">Froala Editor</a>
        </FroalaEditor>
      </div>
    );
  }
}

ReactDOM.render(<EditorComponent/>, document.getElementById('editor'));

