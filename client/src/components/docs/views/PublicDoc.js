import React, { Component } from 'reactn';
import SocketEditor from './editor/SocketEditor';
import PublicEditorSkeleton from '../views/editors/PublicEditorSkeleton';
import {Image } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import logoSquare from '../../../assets/images/graphite-mark.svg';
import {
  fetchData,
  handlePubChange, 
  pollForChanges
} from '../helpers/publicDoc'

export default class PublicDoc extends Component {

  componentDidMount() {
    fetchData();
    setInterval(pollForChanges, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  renderViews() {
    const { readOnly, title, idToLoad, collabContent, link, loading, docLoaded } = this.global;
    if(loading) {
      return (
        <PublicEditorSkeleton />
      )
    } else if(readOnly) {
      return (
        <div>
          <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Image src={logoSquare} style={{ maxHeight: "50px" }} />
            </MainMenu.Item>
            <MainMenu.Item style={{color: "#fff"}}>
              Document is Read Only
            </MainMenu.Item>
            <MainMenu.Menu position='right'>
            <MainMenu.Item>
              <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
            </MainMenu.Item>
            </MainMenu.Menu>
            </MainMenu>
            <div style={{marginBottom: "45px"}}>

                  {
                    this.global.docLoaded ?
                    <div>
                    {
                      this.global.singleDocIsPublic === true ?
                      <div style={{maxWidth: "70%", margin: "auto", marginTop: "100px"}}>
                        <h1 style={{textAlign: "center", marginBottom: "45px"}}>{title}</h1>
                        <div dangerouslySetInnerHTML={{__html: this.global.readOnlyContent}} />
                      </div>
                      :
                      <div style={{marginTop: "20%", textAlign: "center"}}>
                        <h1 style={{maxWidth: "85%", margin: "auto"}}>
                          This document is not being shared at this time.
                        </h1>
                      </div>
                    }
                    </div>
                    :
                    <PublicEditorSkeleton />
                  }
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Image src={logoSquare} style={{ maxHeight: "50px" }} />
            </MainMenu.Item>
            <MainMenu.Item>
              {title}
            </MainMenu.Item>
            <MainMenu.Item>
              Document is Editable
            </MainMenu.Item>
            <MainMenu.Menu position='right'>
              <MainMenu.Item>
                <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
              </MainMenu.Item>
            </MainMenu.Menu>
            </MainMenu>
            <div>
  
                  {
                    this.global.docLoaded === true ?
                    <div>
                    {
                      this.global.singleDocIsPublic === true && !readOnly ?
                      <div>
                        <div>
                          <SocketEditor
                            roomId={idToLoad} //this is a string!
                            docLoaded={docLoaded} //this is set by loadDoc
                            content={collabContent}
                            readOnly={readOnly}
                            handlePubChange={handlePubChange}
                            link={link}
                          />
                        </div>
                      </div>
                      :
                      <div style={{marginTop: "20%"}}>
                        <h1 style={{maxWidth: "85%", margin: "auto"}}>
                          This document is not being shared at this time.
                        </h1>
                      </div>
                    }
                    </div>
                    :
                    <PublicEditorSkeleton />
                  }
          </div>
        </div>
      )
    }
  }

  render() {
    return(
      <div>
        {this.renderViews()}
      </div>
    )
  }
}
