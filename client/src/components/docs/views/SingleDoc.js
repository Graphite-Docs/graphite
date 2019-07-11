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
        title: "Untitled"
      });
      single.loadSingle();
      setTimeout(() => {
        setGlobal({loading: false})
      }, 500)
    } else {
      single.loadSingle();
    }
  }
  
  render() {
    const { loading, singleDoc} = this.global;
    if(singleDoc.document) {
      if(singleDoc.document.spacing && document.getElementById('editor-section')) {
        const spacing = singleDoc.document.spacing;
        let writingSpace = document.getElementById('editor-section');
        
        if(spacing === 1) {
                if(writingSpace.classList.contains('single-space')) {
                    writingSpace.classList.remove('single-space')
                }
                if(writingSpace.classList.contains('one-point-five-space')) {
                    writingSpace.classList.remove('one-point-five-space')
                }
                if(writingSpace.classList.contains('double-space')) {
                    writingSpace.classList.remove('double-space')
                }
                writingSpace.classList.add('single-space');
        } else if(spacing === 1.5) {
            if(writingSpace.classList.contains('single-space')) {
                writingSpace.classList.remove('single-space')
            }
            if(writingSpace.classList.contains('one-point-five-space')) {
                writingSpace.classList.remove('one-point-five-space')
            }
            if(writingSpace.classList.contains('double-space')) {
                writingSpace.classList.remove('double-space')
            }
            writingSpace.classList.add('one-point-five-space');
        } else if(spacing === 2) {
            if(writingSpace.classList.contains('single-space')) {
                writingSpace.classList.remove('single-space')
            }
            if(writingSpace.classList.contains('one-point-five-space')) {
                writingSpace.classList.remove('one-point-five-space')
            }
            if(writingSpace.classList.contains('double-space')) {
                writingSpace.classList.remove('double-space')
            }
            writingSpace.classList.add('double-space');
        }
      }
    }
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
