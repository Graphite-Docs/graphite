import React from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';

const Clipboard = Quill.import('modules/clipboard')

const Y = require('yjs')

// YjsQuill plugins
require('y-memory')(Y)
require('y-array')(Y)
require('y-richtext')(Y)
require('y-websockets-client')(Y)

var io = Y['websockets-client'].io //need to get this.....


// var link = 'http://localhost:1234' //when running textedit-app-yjs-websockets-server locally
// var link = 'http://localhost:5000' //when running `heroku local web`
var link = process.env.REACT_APP_YJS_HEROKU_URL //this link is set in my .env file, which is hidden from github

// create a connection
var connection = io(link) //need to include LINK within io()...


export default class YjsQuill extends React.Component {

  componentDidMount() {
    this.setInner = this.setInner.bind(this);
    // console.log('YjsQuill - componentDidMount - this.props is: ', this.props)
    // console.log('YjsQuill - componentDidMount - this.props.roomId is: ', this.props.roomId)

    //console.logging connection details here won't show until state is updated...
    //note: above logs work after i update state.... -- moved to within promise!

    // NOTE: eliminated React warning by following directions in console.info in ./node_modules/yjs/src/y.js

    //putting Y within a ternary operator, so it only gets rendered if docLoaded...
    if (this.props.docLoaded === true) {

      Y({
        db: {
          name: 'memory'
        },
        connector: {
          name: 'websockets-client', // use the websockets-client connector
          room: this.props.roomId, // passing in room from props...
          socket: connection, // passing connection above as the socket...
          url: link // the connection endpoint (see y-websockets-server)
        },
        share: {
          richtext: 'Richtext' // y.share.richtext is of type Y.Richtext
        }
      }).then( (y) => {

        var that = this

        window.yquill = y

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
        readOnly: (that.props.readOnly === true ? true : false), //readOnly is from QuillEditorPublic, which gets prop from PublicDoc... QuillEditorPrivate won't have this prop, so adding this boolean...
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

      setTimeout(this.setInner, 700); //calling setInner function below to add content to Quill editor...

        // bind quill to richtext type
        //NOTE: need to include below line:
        y.share.richtext.bindQuill(window.quill)

        window.quill.on('editor-change', function(eventName, ...args) {
          if (eventName === 'text-change') {
            var range = window.quill.getSelection();
            if (range) {
              if (range.length === 0) {
                // console.log('User cursor is at index', range.index);
                // console.log(window.quill.getBounds(range.index).top);

              } else {
                // console.log('Text is selected')
              }
            } else {
              // console.log('User cursor is not in editor');
            }
            // console.error('0. CHANGE in YjqQuill...')
            var rootHtml = window.quill.root.innerHTML //getting rootHtml
            if (that.props.singleDocIsPublic || that.props.rtc) { //if this YjsQuill instance is being rendered by SingleDoc, and not PublicDoc, call props.onChange (only SingleDoc has this prop, PublicDoc does not...)
              // console.log('this YjsQuill is being rendered by SingleDoc, so call props.onChange to save!')
              that.props.onChange(rootHtml) //passing rootHtml to SingleDoc, to save it in the database
            } else {
              // console.log(this.props.rtc);
              // console.log(that.props.singleDocIsPublic);
              if(window.location.pathname.split('/')[1] === 'shared') {
                console.log("Public Doc")
              } else {
                that.props.onChange(rootHtml)
              }
            }
          } else if (eventName === 'selection-change') {
            // console.log('1. CHANGE...') // args[0] will be old range

          }
        });

        if (that.props.getYjsConnectionStatus) { //PublicDoc won't have that function as a prop, only Yjs rendered by SingleDoc will
        // console.log('Yjs connection.connected === true, the my-y-websockets-server is running, telling SingleDoc...')
          that.props.getYjsConnectionStatus(true) //this will only be true within the promise
        }
      })
    } //end if statement
  } //componentDidMount

  //using vanilla javascript to set innerHTML of QuillEditorPrivate to this.props.value...
  setInner() {
    if(window.quill.root.innerHTML !== "<p><br></p>") {
      // console.log("inner html")
      // console.log(window.quill.root.innerHTML)
      // console.log("value")
      // console.log(this.props.value);
      this.props.onChange(window.quill.root.innerHTML)
    } else {
      // console.log("this is where the single doc file would be loaded instead");
      var editor = document.getElementsByClassName('ql-editor')
      editor[0].innerHTML = this.props.value;
    }
  }

  render() {
    console.log('0. YjsQuill - render - this.props is: ', this.props)

    return (
      null
      // <div style={{border: "3px solid red"}}>
      //
      //   <p>
      //     YjsQuill component - connectionExists: {
      //       this.props.connectionExists ?
      //       "true" :
      //       "false"
      //     }
      //   </p>
      //
      //   <p>
      //     YjsQuill: {this.props.roomId}
      //   </p>
      //
      //   <p>
      //     can delete this.... don't need to return anything from YjsQuill...
      //   </p>
      //
      // </div>
    );
  }
}
