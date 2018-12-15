import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import SlateEditor from './SlateEditor';
import { loadUserData } from 'blockstack';

class SocketEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      endpoint: process.env.REACT_APP_SERVER
      // endpoint: 'http://localhost:5000'
    }

    this.uniqueID = loadUserData().username;

    this.socket = socketIOClient(this.state.endpoint);

    this.socket.on('update content', data => {
      const content = JSON.parse(data)
      const { uniqueID, content: ops } = content;
      if (ops !== null && this.uniqueID !== uniqueID) {
        setTimeout(() => {
          try {
            console.log(uniqueID)
            this.slate.applyOperations(ops);
          } catch(e) {
            console.log(e)
          }
        });
      }
    });
  }

  componentDidMount() {
    let room;
    if(window.location.href.includes('shared/docs')) {
      room = window.location.href.split('docs/')[1].split('-')[1]
    } else if(window.location.href.includes('shared')) {
      room = window.location.href.split('shared/')[1].split('/')[1]
    } else {
      room = window.location.href.split('doc/')[1]
    }
    this.socket.on('connect', () => {
      this.socket.emit('room', room)
    })
  }

  send = content => {
    const data = JSON.stringify({ content, uniqueID: this.uniqueID });
    // console.log(data);
    this.socket.emit('update content', data);
  }

  onChange = change => {
    const ops = change.operations
    // console.log(ops);
    const ops2 = ops
      .filter(o => o.type !== 'set_selection' && o.type !== 'set_value' && o.type !== undefined && (!o.data || !o.data.has('source')))
      .toArray()
      // .toJS()
      .map(o => ({ ...o, data: { source: this.uniqueID } }))


    // console.log(ops2)
    if (ops2.length > 0) {
      this.send(ops);
    }
  }

  render() {
    return (
      <SlateEditor
        ref={slateE => { this.slate = slateE; }}
        onChange={this.onChange}
        content={this.props.content}
        value={this.props.content}
        handleChange={this.props.handleChange}
        handlePubChange={this.props.handlePubChange}
        docLoaded={this.props.docLoaded}
        idToLoad={this.props.idToLoad}
        createRTC={this.props.createRTC}
        collabContent={this.props.collabContent}
      />
    );
  }
};

export default SocketEditor;
