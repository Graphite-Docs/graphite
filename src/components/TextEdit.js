import React, { Component } from 'react';

import Yjs from './Yjs.js';

export default class TextEdit extends Component {

  // comment out the below to re-render TextEdit on every click -- using this life cycle method to prevent TextEdit and Yjs from needlessly re-rendering, note: React docs say NOT to use this method for this purpose
  shouldComponentUpdate(nextProps) {
    console.log("TextEdit - shouldComponentUpdate received nextProps: ", nextProps)
    // console.log('1. this.props === nextProps: ', this.props === nextProps) //false because objects' internal values could be different...
    // console.log('2. this.props.docLoaded === nextProps.docLoaded: ', this.props.docLoaded === nextProps.docLoaded) //this is true, it's a specific value within those objects

    if (this.props.docLoaded === nextProps.docLoaded) { //these two should always be equal...
      console.warn('TextEdit - (this.props.docLoaded === nextProps.docLoaded), so returning FALSE in shouldComponentUpdate... AKA no re-render...')
      return false; // don't re-render this component (or its children) if the only state change is "a", "b", or "c" getting clicked...
    } else {
      return true; //default return value for shouldComponentUpdate is true
    }
  }

  render() {
    if (this.props.docLoaded) {
      console.log('TextEdit - render - this.props is: ', this.props)
      // console.log('TextEdit - render - this.props.roomId is: ', this.props.roomId)
      // console.log('TextEdit - render - typeof this.props.roomId is: ', typeof this.props.roomId) //this should be a string!
    }
    return (
      // <div style={{border: "2px solid red"}}>
      // <div style={{boxShadow: "0 4px 6px 0 hsla(0, 0%, 0%, 0.2)"}}>
      <div>

        {/* <p>
          TextEdit component - renders Yjs and textarea
        </p> */}

        {/* <p>
          (NOTE: if Yjs renders TextArea, it can create an infinite loop... TextEdit must render Yjs!)
        </p> */}

        <Yjs
          roomId={this.props.roomId}
          docLoaded={this.props.docLoaded}
          value={this.props.value} //value gets passed to Yjs
          getYjsConnectionStatus={this.props.getYjsConnectionStatus} //passing this function to check status of Yjs for SingleDoc
        />

        {
          (this.props.docLoaded === true)
          ?
          <div>
            <textarea
              style={{boxShadow: "0 0 6px rgba(35, 173, 255, 1)", height: "300px"}}
              className="fullWidth"
              id={this.props.roomId} //this should be be a string!
              rows="4"
              cols="80"
              onChange={this.props.onChange} //onChange gets passed to the textarea
              placeholder="Write something great..."
              ></textarea>
            </div>
            :
            <p>
              Loading...
            </p> //replace this with a Materialize loading spinner icon?
          }

        </div>
      );
    }
  }
