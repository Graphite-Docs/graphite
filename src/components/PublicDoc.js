import React, { Component } from 'react';
import QuillEditorPublic from './QuillEditorPublic.js'; //this will render Yjs...
import Loading from './Loading';
import {Image } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import logoSquare from '../assets/images/gIcon.png';

export default class PublicDoc extends Component {

  componentDidMount() {
    this.props.loadInitial(window.location.pathname.split('/shared/docs/')[1]);
    setTimeout(this.props.loadDoc, 700);
    this.interval = setInterval(() => this.props.loadDoc(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {

    // let toolbar = window.document.getElementsByClassName('ql-toolbar')[0];
    // if(toolbar[0]) {
    //   if(this.props.readOnly) {
    //     toolbar[0].style.display = "none";
    //   } else {
    //     toolbar[0].style.top = "63px";
    //   }

    // }
    if(this.props.readOnly) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Image src={logoSquare} style={{ maxHeight: "50px" }} />
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            Document is Read Only
          </MainMenu.Item>
          <MainMenu.Menu position='right'>
          <MainMenu.Item right>
            <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
          </MainMenu.Item>
          </MainMenu.Menu>
          </MainMenu>
          <div className="test-docs">
            <div className="test-doc-card">
              <div className="double-space doc-margin">

                {
                  this.props.docLoaded === true ?
                  <div>
                  {
                    this.props.singleDocIsPublic === true ?
                    <div style={{maxWidth: "85%", margin: "auto", marginTop: "100px"}}>
                    <h1 style={{textAlign: "center", marginBottom: "45px"}}>{this.props.title}</h1>
                    <div dangerouslySetInnerHTML={{__html: this.props.content}} />
                    </div>
                    :
                    <div style={{marginTop: "20%", textAlign: "center"}}>
                      <h1>
                        This document is not being shared at this time.
                      </h1>
                    </div>
                  }
                  </div>
                  :
                  <Loading />
                }

            </div>
          </div>
        </div>
      </div>
      )
    } else {
      return (
        <div>
        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Image src={logoSquare} style={{ maxHeight: "50px" }} />
          </MainMenu.Item>
          <MainMenu.Item>
            {this.props.title}
          </MainMenu.Item>
          <MainMenu.Item>
            Document is Read Only
          </MainMenu.Item>
          <MainMenu.Menu position='right'>
            <MainMenu.Item right>
              <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
            </MainMenu.Item>
          </MainMenu.Menu>
          </MainMenu>
          <div className="test-docs">
            <div className="test-doc-card">
              <div className="double-space doc-margin">

                {
                  this.props.docLoaded === true ?
                  <div>
                  {
                    this.props.singleDocIsPublic === true ?
                    <div>



                      {/* <div style={(this.state.readOnly === true) ? {border: "5px solid red"} : null}> */}
                      <div>
                        <QuillEditorPublic
                          key={this.props.readOnly === true ? "true!" : "false..."} //NOTE: when this.state.readOnly changes in PublicDoc, it will change this key, which will remount QuillEditorPublic, which will remount YjsQuill, so readOnly changes in SingleDoc update PublicDoc text editor...
                          roomId={this.props.idToLoad} //this is a string!
                          docLoaded={this.props.docLoaded} //this is set by loadDoc
                          value={this.props.content}
                          readOnly={this.props.readOnly}
                        />
                      </div>
                    </div>
                    :
                    <div style={{marginTop: "20%"}}>
                      <h1>
                        This document is not being shared at this time.
                      </h1>
                    </div>
                  }
                  </div>
                  :
                  <Loading />
                }

            </div>
          </div>
        </div>
      </div>
      );
    }

  }
}
