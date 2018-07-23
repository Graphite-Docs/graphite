import React from 'react';

import YjsQuill from './YjsQuill';


export default class QuillEditorPublic extends React.Component {

  componentDidMount() {
    console.warn('1. QuillEditorPublic - componentDidMount...')
  }

  render() {
    console.log('QuillEditorPublic: ' + this.props.value);
    if (this.props.docLoaded) {
      console.warn('0. QuillEditorPublic - render...')
      console.warn('0. QuillEditorPublic - this.props: ', this.props)
    }
    return (
      <div>

        {
          (this.props.docLoaded === true) ? //only need Yjs if doc is shared publicly...
          <YjsQuill
            roomId={this.props.roomId}
            docLoaded={this.props.docLoaded}
            value={this.props.value} //value gets passed to Yjs
            getYjsConnectionStatus={this.props.getYjsConnectionStatus} //passing this function to check status of Yjs for SingleDoc
            singleDocIsPublic={this.props.singleDocIsPublic}
            onChange={this.props.onChange} //passing this to YjsQuill, to call whenever updates are made...
          />
          :
          null
        }

        {
          (this.props.docLoaded === true) ?
          <div id="QuillEditor-container">
            {/* <!-- Create the editor container --> */}
            <div id="editor">
            <div className="progress">
              <div className="indeterminate"></div>
            </div>
            </div>
          </div>
          :
          <div className="progress">
            <div className="indeterminate"></div>
          </div>
        }


      </div>
    )
  }
}
