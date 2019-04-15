import React, { Component } from 'reactn';
import { Menu, Image, Container } from 'semantic-ui-react';
import logoSquare from '../../../../assets/images/graphite-mark.svg';

class PublicEditorSkeleton extends Component {
  render() {
      return (
        <div>
         <Menu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <Menu.Item>
              <Image src={logoSquare} style={{ maxHeight: "50px" }} />
            </Menu.Item>
            <Menu.Item style={{color: "#fff"}}>
              Document is Read Only
            </Menu.Item>
            <Menu.Menu position='right'>
            <Menu.Item>
              <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
            </Menu.Item>
            </Menu.Menu>
        </Menu>
        <div style={{marginBottom: "45px"}} className="test-docs">
              <div className="test-doc-card">
                <div className="double-space doc-margin">
                <Container>
                <div className='title-skel'></div>
                <div className='h1-skel'></div>
                <p className='p-skel'></p>
                <p className='p-skel-short'></p>
                <p className='p-skel'></p>
                <p className='p-skel'></p>
                <div className='h1-skel'></div>
                <p className='p-skel'></p>
                <p className='p-skel-short'></p>
                </Container>
                </div>
                </div>
            </div>
        </div>
       );
  }
}

export default PublicEditorSkeleton;