import React from 'react';
import MarkdownEditor from '@insidersbyte/react-markdown-editor';
import '@insidersbyte/react-markdown-editor/dist/css/react-markdown-editor.css';

export default class MDEditor extends React.Component {


  render() {
    return (
      <div className='ql-editor'>
        <MarkdownEditor
          value={this.props.markdownContent}
          onChange={this.props.handleMDChange}
          />
      </div>
    )
  }
}
