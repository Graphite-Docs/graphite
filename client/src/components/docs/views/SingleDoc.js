import React, { Component, setGlobal } from 'reactn';
import SocketEditor from './editor/SocketEditor';
import SlateEditor from './editor/Editor';
import EditorSkeleton from './editor/EditorSkeleton';
const single = require('../helpers/singleDoc');

class SingleDoc extends Component {
  componentDidMount() {
    document.body.style.background = "#f8f9fa"
    if(window.location.href.includes('new')) {
      setGlobal({
        loading: true, 
        singleDoc: {}, 
        content: "", 
        title: ""
      });
      setTimeout(() => {
        setGlobal({loading: false})
      }, 500)
    } else {
      single.loadSingle();
    }
  }
  
  render() {
    const { loading, singleDoc} = this.global;
    let realTime = false;
    if(singleDoc.readOnly === false) {
      realTime = true;
    } else if(singleDoc.rtc) {
      realTime = true;
    } else if(singleDoc.teamDoc === true) {
      realTime = true;
    } else if(window.location.href.includes('team')) {
      realTime = true;
    }

    if(loading) {
        return (
          <EditorSkeleton />
        )
      } else {
        return (
          <div>  
            {
              realTime === true ? 
              <SocketEditor /> : 
              <SlateEditor />
            }
         </div>
      );
      }
  }
}

export default SingleDoc;
