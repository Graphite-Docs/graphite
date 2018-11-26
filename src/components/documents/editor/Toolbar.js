import React, { Component } from "react";
import { Menu, Icon, Dropdown } from 'semantic-ui-react';

export default class Toolbar extends Component {

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  resize = () => this.forceUpdate();

  renderHeadingDrop() {
    return (
      <Dropdown.Menu>
        <Dropdown.Item text='Heading One' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-one')} />
        <Dropdown.Item text='Heading Two' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-two')} />
        <Dropdown.Item text='Heading Three' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-three')} />
        <Dropdown.Item text='Heading Four' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-four')} />
        <Dropdown.Item text='Heading Five' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-five')} />
        <Dropdown.Item text='Heading Six' onPointerDown={(e) => this.props.onClickBlock(e, 'heading-six')} />
      </Dropdown.Menu>
    )
  }

  render() {

    if(window.innerWidth < 675) {
      return (
        <div className='slate-toolbar-vertical'>
        <Menu vertical style={{borderRadius: "0"}}>
          <Menu.Item style={{cursor: "pointer"}}>
            <Dropdown icon='heading'>
              {this.renderHeadingDrop()}
            </Dropdown>
          </Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'bold')}><Icon name='bold' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'italic')}><Icon name='italic' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'underline')}><Icon name='underline' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'strikethrough')}><Icon name='strikethrough' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'code')}><Icon name='code' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'list')}><Icon name='list' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'ordered')}><Icon name='list ol' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Icon name='quote right' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onInsertTable()}><Icon name='table' /></Menu.Item>
        </Menu>
        </div>
      );
    } else {
      return (
        <div className='slate-toolbar'>
        <Menu  style={{borderRadius: "0"}}>
        <Menu.Item style={{cursor: "pointer"}}>
          <Dropdown icon='heading'>
            {this.renderHeadingDrop()}
          </Dropdown>
        </Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'bold')}><Icon name='bold' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'italic')}><Icon name='italic' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'underline')}><Icon name='underline' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'strikethrough')}><Icon name='strikethrough' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'code')}><Icon name='code' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'list')}><Icon name='list' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'ordered')}><Icon name='list ol' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Icon name='quote right' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onInsertTable()}><Icon name='table' /></Menu.Item>
        </Menu>
        </div>
      );
    }
  }
}
