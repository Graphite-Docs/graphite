import React from 'react';

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
    theme: 'snow',
    placeholder: "Write something great..."
  });

    // using vanilla javascript to set innerHTML of QuillEditorPrivate to this.props.value...
    var editor = document.getElementsByClassName('ql-editor')
    console.log('QuillEditorPrivate - setting innerHTML to this.props.value: ', this.props.value)
    editor[0].innerHTML = this.props.value //once QuillEditorPrivate mounts, set the value of the contenteditable div to this.props.value...

    // quill.insertText(0, this.props.value) //this doesn't parse the html in this.props.value, so using above method instead...

    var that = this;
    window.quill.on('editor-change', function(eventName, ...args) {
      console.log('in editor-change, that.props is: ', that.props)
      if (eventName === 'text-change') {
        console.log('0. CHANGE in QuillEditorPrivate...')
        var rootHtml = window.quill.root.innerHTML //getting rootHtml
        console.log('0. rootHtml is: ', rootHtml)
        that.props.onChange(rootHtml) //passing rootHtml to SingleDoc, to save it in the database
      } else if (eventName === 'selection-change') {
        console.log('1. CHANGE...') // args[0] will be old range
      }
    });
  } //componentDidMount

  render() {
    console.log('0. QuillEditorPrivate - render...')
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
