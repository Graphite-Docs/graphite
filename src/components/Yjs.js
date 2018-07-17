//Yjs component file
// import React from 'react';

// import ReactQuill from 'react-quill'; // adding this....

const Y = require('yjs')

// Yjs plugins
require('y-memory')(Y)
require('y-array')(Y)
// require('y-richtext')(Y) //must come after y-array, this is for binding to a Quill instance
require('y-text')(Y)
require('y-websockets-client')(Y)

var io = Y['websockets-client'].io //need to get this.....


// var link = 'http://localhost:1234' //when running my-y-websockets-server locally
// var link = 'http://localhost:5000' //when running `heroku local web`
// var link = 'https://graphite-yjs-websockets.herokuapp.com/'
var link = process.env.REACT_APP_YJS_HEROKU_URL //this link is set in the .env file, which can be hidden from gitlab

// create a connection

function createConnection(props) { //don't really need this function, can just declare a global `var connection = io(link)` like i had before...
  console.log('Yjs - createConnection called...')
  if ( (props.docLoaded === true) && (props.roomId !== "") ) {
    let connection = io(link) //need to include LINK within io()...
    return connection
  } else {
    console.warn('Yjs - createConnection returning null...')
    return null
  }
}

export default function Yjs(props) {


  console.log('Yjs - props is: ', props)

  if (props.docLoaded === false) {
    console.log('Yjs - props.docLoaded is: ', props.docLoaded)
    console.warn('Yjs - props.docLoaded is FALSE, so returning `props.docLoaded === false`...')
  }

  if ((props.docLoaded === true) && (props.roomId !== "")) { //need a roomId to return a Y connection????

    console.warn("Yjs instance created: props.docLoaded === true")

    let connection = createConnection(props)
    console.log('Yjs - in Yjs, connection is: ', connection)

    if (connection.connected === false) {
      console.warn('connection.connected === false, make sure the my-y-websockets-server is running...')
      if (props.getYjsConnectionStatus) { //PublicDoc won't have this function as a prop, only Yjs rendered by SingleDoc will
        props.getYjsConnectionStatus(false)
      } //note: not returning here because probably still awaiting more components to render, even though Yjs has what it needs...
    }

      Y({
        db: {
          name: 'memory' // use the memory db adapter
        },
        connector: {
          name: 'websockets-client', // use the websockets-client connector
          room: props.roomId, // passing in room from props...
          socket: connection, // passing connection above as the socket...
          url: link // the connection endpoint (see y-websockets-server)
        },
        share: {
          // richtext: 'Richtext' // y.share.richtext is of type Y.Richtext
          textarea: 'Text' // y.share.textarea is of type Y.Text
        }
      }).then(function (y) {

        // create quill element ---------------- need to do this, if Quill already exists in SingleDoc??
        //will try binding to quill editor later....

        console.log('HELLO from y promise, y is: ', y)
        // console.log('y.connector.userId is: ', y.connector.userId)
        // console.log('y.connector.connections is: ', y.connector.connections)

        // bind the textarea to a shared text element
        y.share.textarea.bind(document.getElementById(props.roomId)) //this works on textarea, but not on ReactQuill...

        //then give each room some initial text...
        console.log('Yjs - y.share.textarea._content.length: ', y.share.textarea._content.length)
        console.log('Yjs - props.value: ', props.value)

        y.share.textarea.delete(0, y.share.textarea._content.length) //first clear all text from y.share.textarea...
        y.share.textarea.insert(0, props.value) //then insert text from props...

        if (props.getYjsConnectionStatus) { //PublicDoc won't have this function as a prop, only Yjs rendered by SingleDoc will
        console.warn('Yjs connection.connected === true, the my-y-websockets-server is running...')
          props.getYjsConnectionStatus(true) //this will only be true within the promise
        }
        // console.log('HELLO from y promise, **** y.share.textarea._content is: ', y.share.textarea._content) //pass content to SingleDoc for saving??
      })
  } //end if statement

  //eventually can return null here, don't really need a return value for this stateless functional component
  return (
    null
    // <div style={{background: "aliceblue"}}>
    //
    //   <p>
    //     Yjs component - roomId: {props.roomId ? props.roomId : 'props.roomId here'} /
    //     docLoaded: {(props.docLoaded === true) ? 'true' : 'false'}
    //   </p>
    //
    // </div>
  );
} //end of Yjs function
