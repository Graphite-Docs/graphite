import React, { Component } from 'reactn';

class EditorSkeleton extends Component {
  render() {
      return (
        <div>
 
       
            <div className="page-view">
                <div id="editor-section">
                    <div className='h1-skel'></div>
                    <p className='p-skel'></p>
                    <p className='p-skel-short'></p>
                    <p className='p-skel'></p>
                    <p className='p-skel'></p>
                    <div className='h1-skel'></div>
                    <p className='p-skel'></p>
                    <p className='p-skel-short'></p>
                </div>
            </div>
        </div>
       );
  }
}

export default EditorSkeleton;