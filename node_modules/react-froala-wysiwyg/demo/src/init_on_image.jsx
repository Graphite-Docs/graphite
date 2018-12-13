// Note that Froala Editor has to be required separately
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import 'file-loader?name=[name].[ext]!./init_on_image.html';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorImg from 'react-froala-wysiwyg/FroalaEditorImg';
import React from 'react';
import ReactDOM from 'react-dom';

// Render Froala Editor component.
class EditorComponent extends React.Component {
  constructor () {
    super();

    this.config = {
      reactIgnoreAttrs: ['tmpattr']
    }

    this.handleModelChange = this.handleModelChange.bind(this);

    this.state = {
      content: {
        src: './image.jpg',
        id: 'froalaEditor',
        tmpattr: 'This attribute will be ignored on change.'
      }
    };
  }

  handleModelChange (model) {
    this.setState({content: model});
  }

  render () {
    return(
      <div className="sample">
        <h2>Editor on 'img' tag. Two way binding.</h2>
        <FroalaEditorImg
          config={this.config}
          model={this.state.content}
          onModelChange={this.handleModelChange}
        />&nbsp;&nbsp;

        <FroalaEditorImg
          config={this.config}
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

