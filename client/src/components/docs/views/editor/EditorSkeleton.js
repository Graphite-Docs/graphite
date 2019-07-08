import React, { Component } from 'reactn';
import Toolbar from './Toolbar';
import MainMenu from './MainMenu';
import MenuBar from './MenuBar';

class EditorSkeleton extends Component {
  componentDidMount() {
    
  }
  render() {
      return (
        <div>
            <MainMenu />
            <MenuBar />
            <Toolbar />
       
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