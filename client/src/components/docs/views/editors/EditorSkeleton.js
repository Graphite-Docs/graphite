import React, { Component } from 'reactn';
import { Menu, Icon } from 'semantic-ui-react';

class EditorSkeleton extends Component {
  render() {
      return (
        <div>
         <Menu className='item-menu loading-nav-editor' style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <Menu.Item>
                <Icon name='arrow left' />
            </Menu.Item>
            <Menu.Item>
                <span className='title-skel-div'></span>
            </Menu.Item>
            </Menu>
            <div className='slate-toolbar'>
            <Menu  style={{borderRadius: "0", background: "#fff"}}>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="heading" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="bold" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="italic" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="underline" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="strikethrough" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="file code outline" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="list" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="ordered list" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="check square outline" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="quote right" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="table" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="eye dropper" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="tint" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="align left" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="align center" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="align right" /></Menu.Item>
                <Menu.Item style={{cursor: "pointer"}}><Icon name="align justify" /></Menu.Item>
            </Menu>
            </div>
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

export default EditorSkeleton;