import React from 'react';
import MarkdownEditor from '@insidersbyte/react-markdown-editor';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Button, Modal } from 'semantic-ui-react'
import '@insidersbyte/react-markdown-editor/dist/css/react-markdown-editor.css';

export default class MDEditor extends React.Component {

  componentDidMount() {
    document.getElementsByClassName('markdown-editor__textarea')[0].placeholder = "Write something great...in markdown"
  }

  render() {
    return (
      <div className='md-editor'>
        <MarkdownEditor
          value={this.props.markdownContent}
          onChange={this.props.handleMDChange}
          />
          <Modal closeIcon trigger={<Button secondary style={{color: "#fff"}} id='md-help-button'>Markdown Guide</Button>}>
          <Modal.Header>Markdown Guide</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <SemanticHeader>Basic Syntax</SemanticHeader>
                <ul>
                  <li><span><h2>Headings</h2></span> <span><pre> # Headings</pre></span></li>
                  <li><span>New Paragraph</span> <span> <pre>Hit "return" twice</pre></span></li>
                  <li><span>Hyperlinked <a>text</a></span> <span><pre>[text](http://www.link.com)</pre></span></li>
                  <li><span><em>Italicize</em></span> <span><pre>*Italicize*</pre></span></li>
                  <li><span><strong>Bold</strong></span> <span><pre>**Bold**</pre></span></li>
                  <li><span>Ordered lists</span> <span><pre><br/>1. Item One <br/> 2. Item Two</pre></span></li>
                  <li><span>Unordered lists</span> <span><pre><br/>* Item One <br/> * Item Two</pre></span></li>
                </ul>
                <p>Learn more <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">here.</a></p>
              </Modal.Description>
            </Modal.Content>
          </Modal>
      </div>
    )
  }
}
