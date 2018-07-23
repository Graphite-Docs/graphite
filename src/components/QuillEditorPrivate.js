import React from 'react';

// import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css'; //need to import this for snow theme to display correctly...

import Quill from 'quill/core'; //must be from core for functions to work!!!
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow'; //snow works, but need to import and register formats, and replace icons...

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';
import Underline from 'quill/formats/underline';
import Link from 'quill/formats/link';
import List, { ListItem } from 'quill/formats/list';
import Icons from 'quill/ui/icons'; //need to import icons, then replace them...

export default class QuillEditorPrivate extends React.Component {

  componentDidMount() {
    console.warn('1. QuillEditorPrivate - componentDidMount...')

    // Quill.register({
    //   'modules/toolbar': Toolbar,
    //   'themes/snow': Snow,
    //   'formats/bold': Bold,
    //   'formats/italic': Italic,
    //   'formats/header': Header,
    //   'formats/underline': Underline,
    //   'formats/link': Link,
    //   'formats/list': List,
    //   'formats/list/item': ListItem,
    //   'ui/icons': Icons
    // });
    //
    // var icons = Quill.import('ui/icons');
    // icons['bold'] = '<i class="fa fa-bold" aria-hidden="true"></i>';
    // icons['italic'] = '<i class="fa fa-italic" aria-hidden="true"></i>';
    // icons['underline'] = '<i class="fa fa-underline" aria-hidden="true"></i>';
    // icons['link'] = '<i class="fa fa-link" aria-hidden="true"></i>';
    // icons['clean'] = '<i class="fa fa-eraser" aria-hidden="true"></i>'; // making this an eraser for now because i can't find the font awesome equivalent of the Tx / clear / clean icon...
    //
    // var quill = new Quill('#editor', {
    //   theme: 'snow', //this needs to come after the above, which registers Snow...
    //   placeholder: "Write something great..."
    // });

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

    // var delta = quill.getContents();
    // console.warn('in QuillEditorPrivate ------>>>>>> delta is: ', delta)

    // using vanilla javascript to set innerHTML of QuillEditorPrivate to this.props.value...
    var editor = document.getElementsByClassName('ql-editor')
    console.log('QuillEditorPrivate - setting innerHTML to this.props.value: ', this.props.value)
    editor[0].innerHTML = this.props.value //once QuillEditorPrivate mounts, set the value of the contenteditable div to this.props.value...

    // quill.insertText(0, this.props.value) //this doesn't parse the html in this.props.value, so using above method instead...

    var that = this;
    window.quill.on('editor-change', function(eventName, ...args) {
      console.error('in editor-change, that.props is: ', that.props)
      if (eventName === 'text-change') {
        console.error('0. CHANGE in QuillEditorPrivate...')
        var rootHtml = window.quill.root.innerHTML //getting rootHtml
        console.warn('9999999999. rootHtml is: ', rootHtml)
        that.props.onChange(rootHtml) //passing rootHtml to SingleDoc, to save it in the database
      } else if (eventName === 'selection-change') {
        console.log('1. CHANGE...') // args[0] will be old range
      }
    });

    //replacing unrendered svg string in dropdown with an empty string, then adding sort icon in css...
    var dropdown = document.getElementsByClassName('ql-picker-label'); //changing text here, can't do it in css...
    dropdown[0].innerText = "";

    //lists both have same class, but different values, so changing them here...
    var list = document.getElementsByClassName('ql-list');
    list[0].innerHTML = '<i class="fa fa-list-ol" aria-hidden="true"></i>' //ordered list
    list[1].innerHTML = '<i class="fa fa-list-ul" aria-hidden="true"></i>' //unordered list
  } //componentDidMount

  render() {
    console.warn('0. QuillEditorPrivate - render...')
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
