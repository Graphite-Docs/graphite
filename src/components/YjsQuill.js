import React, { Component } from 'react';
// import { Component } from 'react';

// import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css'; //need to import this for snow CSS to display correctly...

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



export default class YjsQuill extends Component {

  componentDidMount() {
    this.setInner = this.setInner.bind(this);
    console.error('1. YjsQuill - componentDidMount...')
    console.log('YjsQuill - componentDidMount - this.props is: ', this.props)
    console.log('YjsQuill - componentDidMount - this.props.roomId is: ', this.props.roomId)

    //console.logging connection details here won't show until state is updated...
    //note: above logs work after i update state.... -- moved to within promise!

    // var that = this; //setting 'this' to 'that' so scope of 'this' doesn't get lost in promise below

    console.log('YjsQuill -->>> connection in render is: ', connection)

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
        console.log('HELLO from YjsQuill promise...')
        console.error('YjsQuill ----- inside promise, that.props: ', that.props)

        window.yquill = y

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
        // window.quill = new Quill('#editor', {
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

        //replacing unrendered svg string in dropdown with an empty string, then adding sort icon in css...
        var dropdown = document.getElementsByClassName('ql-picker-label'); //changing text here, can't do it in css...
        setTimeout(this.setInner, 700);
        dropdown[0].innerText = "";

        //lists both have same class, but different values, so changing them here...
        var list = document.getElementsByClassName('ql-list');
        list[0].innerHTML = '<i class="fa fa-list-ol" aria-hidden="true"></i>' //ordered list
        list[1].innerHTML = '<i class="fa fa-list-ul" aria-hidden="true"></i>' //unordered list
        // bind quill to richtext type
        //NOTE: NEED TO INCLUDE BELOW LINE:::::::
        y.share.richtext.bindQuill(window.quill)

        var delta = window.quill.getContents();
        console.warn('in YjsQuill ------>>>>>> delta is: ', delta)

        window.quill.on('editor-change', function(eventName, ...args) {
          if (eventName === 'text-change') {
            var range = window.quill.getSelection();
            if (range) {
              if (range.length === 0) {
                console.log('User cursor is at index', range.index);
                // console.log(window.quill.getBounds(range.index).top);

              } else {
                console.log('Text is selected')
              }
            } else {
              console.log('User cursor is not in editor');
            }
            console.error('0. CHANGE in YjqQuill...')
            var rootHtml = window.quill.root.innerHTML //getting rootHtml
            console.warn('9999999999. rootHtml is: ', rootHtml)
            if (that.props.singleDocIsPublic) { //if this YjsQuill instance is being rendered by SingleDoc, and not PublicDoc, call props.onChange (only SingleDoc has this prop, PublicDoc does not...)
              console.log('this YjsQuill is being rendered by SingleDoc, so call props.onChange to save!')
              that.props.onChange(rootHtml) //passing rootHtml to SingleDoc, to save it in the database
            }
          } else if (eventName === 'selection-change') {
            console.log('1. CHANGE...') // args[0] will be old range

          }
        });

        if (that.props.getYjsConnectionStatus) { //PublicDoc won't have that function as a prop, only Yjs rendered by SingleDoc will
        // var that = this;
        console.warn('Yjs connection.connected === true, the my-y-websockets-server is running, telling SingleDoc...')
          that.props.getYjsConnectionStatus(true) //this will only be true within the promise
        }
      })
    } //end if statement
  } //componentDidMount

  componentDidUpdate() {

  }

  setInner() {
    var editor = document.getElementsByClassName('ql-editor')
    editor[0].innerHTML = this.props.value;
    console.log(editor)
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
