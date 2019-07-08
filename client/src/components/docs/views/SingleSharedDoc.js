import React, { Component, setGlobal } from "reactn";
import SocketEditor from './editor/SocketEditor';
import EditorSkeleton from './editor/EditorSkeleton';
const shared = require('../helpers/singleShared');

export default class SingleSharedDoc extends Component {

  componentDidMount() {
    setGlobal({ loading: true})
    shared.loadSharedDoc();
  }

  renderView() {
    const { content, rtc, loading } = this.global;

    if(loading) {
      return (
        <EditorSkeleton />
      )
    } else {
      return(
      <div>
      
        {
          rtc === true ? 
          <SocketEditor /> : 
          <div style={{maxWidth: "85%", margin: "auto", marginTop: "100px", marginBottom: "45px"}}>
            <div
              className="print-view no-edit"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        }


      </div>
        );
    }
  }

  render() {
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}
