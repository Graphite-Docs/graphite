import React, { Component } from 'reactn';
import { Menu, Icon } from 'semantic-ui-react';

class FileSkeleton extends Component {
  render() {
      return (
        <div>
         <Menu className='loading-nav-editor' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <Menu.Item>
                <Icon name='arrow left' />
            </Menu.Item>
            <Menu.Item>
                <span className='title-skel-div'></span>
            </Menu.Item>
            </Menu>
            <div className="ql-editor">
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
       );
  }
}

export default FileSkeleton;