import React from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';

const Clipboard = Quill.import('modules/clipboard')

export default class QuillEditorPrivate extends React.Component {

  componentDidMount() {
    // console.log('1. QuillEditorPrivate - componentDidMount...')

    var toolbarOptions = [
      // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike', 'link'],
      [{ 'color': [] }, { 'background': [] }],        // toggled buttons
      ['blockquote', 'code-block'],
      ['video', 'image'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction
      ['clean']                                         // remove formatting button
    ];


   window.quill = new window.Quill('#editor', {
    modules: {
      toolbar: toolbarOptions,
    },
    scrollingContainer: 'html, body',
    theme: 'snow',
    placeholder: "Write something great..."
  });

  class CustomClipboard extends Clipboard {
    onPaste(e) {
      console.log("pasting")
      if (e.defaultPrevented || !this.quill.isEnabled()) return;
      let range = this.quill.getSelection();
      let delta = new Delta().retain(range.index);
      this.container.style.top = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0).toString() + 'px';
      this.container.focus();
      setTimeout(() => {
        this.quill.selection.update(Quill.sources.SILENT);
        delta = delta.concat(this.convert()).delete(range.length);
        this.quill.updateContents(delta, Quill.sources.USER);
        this.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT);
        let bounds = this.quill.getBounds(delta.length() - range.length, Quill.sources.SILENT);
        this.quill.scrollingContainer.scrollTop = bounds.top;
      }, 1);
    }
    }

    Quill.register('modules/clipboard', CustomClipboard, true);

    // using vanilla javascript to set innerHTML of QuillEditorPrivate to this.props.value...
    var editor = document.getElementsByClassName('ql-editor')
    editor[0].innerHTML = this.props.value //once QuillEditorPrivate mounts, set the value of the contenteditable div to this.props.value...

    // quill.insertText(0, this.props.value) //this doesn't parse the html in this.props.value, so using above method instead...

    var that = this;
    window.quill.on('editor-change', function(eventName, ...args) {
      if (eventName === 'text-change') {
        var rootHtml = window.quill.root.innerHTML //getting rootHtml
        that.props.onChange(rootHtml) //passing rootHtml to SingleDoc, to save it in the database
      } else if (eventName === 'selection-change') {
      }
    });
  } //componentDidMount

  render() {
    return (
      <div>
        {
          (this.props.docLoaded === true) ?
          <div id="QuillEditor-container">
            {/* <!-- Create the editor container --> */}
            <div id="editor">
              <p>Hello World!</p>
              <p>Some initial <strong>bold</strong> text</p>
              <p></p>
            </div>
          </div>
          :
          "Loading..."
        }

        {/* <div style={{border: '3px solid blue'}}>

          <p style={{border: '3px solid yellow'}}>
            typeof this.props.value: {typeof this.props.value}
          </p>

          this.props.value is:
          <p>
            {this.props.value}
          </p>
        </div> */}

      </div>
    )
  }
}
