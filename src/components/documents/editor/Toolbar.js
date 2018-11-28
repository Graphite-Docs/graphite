import React, { Component } from "react";
import { Menu, Icon, Dropdown, Popup, Modal, Input } from 'semantic-ui-react';
import { CompactPicker } from 'react-color';
let colorPicker = 'hide'

export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      display: false,
      color: "#fff"
    }
  }

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

  renderTableDrop() {
    return (
      <Dropdown.Menu>
        <Dropdown.Item text='Add Column' onPointerDown={(e) => this.props.onInsertCol()} />
        <Dropdown.Item text='Add Row' onPointerDown={(e) => this.props.onInsertRow()} />
        <Dropdown.Item text='Remove Row' onPointerDown={(e) => this.props.onRemoveRow()} />
        <Dropdown.Item text='Remove Column' onPointerDown={(e) => this.props.onRemoveCol()} />
        <Dropdown.Item text='Remove Table' onPointerDown={(e) => this.props.onRemoveTable()} />
      </Dropdown.Menu>
    )
  }

  linkHandler = (event) => {
    this.setState({ url: event.target.value })
  }

  trackKeys = (event) => {
    if(event.key === 'Enter') {
      this.props.onClickLink(event, this.state.url)
      setTimeout(() => this.props.modalController(false), 300)
    }
  }

  onColorClick = () => {
    this.setState({ display: !this.state.display}, () => {
      if(this.state.display) {
        colorPicker = 'colorPicker'
      } else {
        colorPicker = 'hide'
      }
    })
  }

  handleChangeComplete = (color) => {
    this.setState({ color: color.hex }, () => {
      this.props.onClickColor(color);
    });
  };

  render() {

    if(window.innerWidth < 675) {
      return (
        <div className='slate-toolbar-vertical'>
        <Menu vertical style={{borderRadius: "0"}}>
        <Menu.Item style={{cursor: "pointer"}}>
          <Popup position='bottom center' trigger={
            <Dropdown icon='heading'>
              {this.renderHeadingDrop()}
            </Dropdown>
          } content='Heading' />
        </Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'bold')}><Popup position='bottom center' trigger={<Icon name='bold' />} content='Bold (crtl/cmd + B)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'italic')}><Popup position='bottom center' trigger={<Icon name='italic' />} content='Italic (crtl/cmd + I)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'underline')}><Popup position='bottom center' trigger={<Icon name='underline' />} content='Underline (crtl/cmd + U)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'strikethrough')}><Popup position='bottom center' trigger={<Icon name='strikethrough' />} content='Strikethrough (crtl/cmd + shift + s)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'code')}><Popup position='bottom center' trigger={<Icon name='code' />} content='Code (ctrl + `)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'list')}><Popup position='bottom center' trigger={<Icon name='list' />} content='List' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'ordered')}><Popup position='bottom center' trigger={<Icon name='list ol' />} content='Numbered List' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Popup position='bottom center' trigger={<Icon name='quote right' />} content='Quote' /></Menu.Item>
          {
            this.props.isTable ?
              <Menu.Item style={{cursor: "pointer"}}>
                <Popup trigger={
                  <Dropdown icon='add square'>
                    {this.renderTableDrop()}
                  </Dropdown>
                } position='bottom center' content='Table options' />
              </Menu.Item>
              :
            <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onInsertTable()}><Popup trigger={<Icon name='table' />} position='bottom center' content='Table' /></Menu.Item>
          }
        </Menu>
        </div>
      );
    } else {
      return (
        <div className='slate-toolbar'>
        <Menu  style={{borderRadius: "0"}}>
        <Menu.Item style={{cursor: "pointer"}}>
          <Popup position='bottom center' trigger={
            <Dropdown icon='heading'>
              {this.renderHeadingDrop()}
            </Dropdown>
          } content='Heading' />
        </Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'bold')}><Popup position='bottom center' trigger={<Icon name='bold' />} content='Bold (crtl/cmd + B)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'italic')}><Popup position='bottom center' trigger={<Icon name='italic' />} content='Italic (crtl/cmd + I)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'underline')}><Popup position='bottom center' trigger={<Icon name='underline' />} content='Underline (crtl/cmd + U)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'strikethrough')}><Popup position='bottom center' trigger={<Icon name='strikethrough' />} content='Strikethrough (crtl/cmd + shift + s)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'code')}><Popup position='bottom center' trigger={<Icon name='code' />} content='Code (ctrl + `)' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'list')}><Popup position='bottom center' trigger={<Icon name='list' />} content='List' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'ordered')}><Popup position='bottom center' trigger={<Icon name='list ol' />} content='Numbered List' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Popup position='bottom center' trigger={<Icon name='quote right' />} content='Quote' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}}>
          {
            this.props.isTable ?

                <Popup trigger={
                  <Dropdown icon='add square'>
                    {this.renderTableDrop()}
                  </Dropdown>
                } position='bottom center' content='Table options' />

              :
            <Popup trigger={<Icon onPointerDown={(e) => this.props.onInsertTable()} name='table' />} position='bottom center' content='Table' />
          }
          </Menu.Item>
          <Menu.Item onClick={this.onColorClick} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
            <Icon name='eye dropper' />
            } content='Color' />
          </Menu.Item>
          <Menu.Item style={{cursor: "pointer"}}>
          <Modal trigger={
            <Icon onClick={() => this.props.modalController(true)}  name='linkify' />
          }
            open={this.props.modalOpen}
            onClose={() => this.props.modalController(false)}
            size='small'
            closeOnEscape={true}
            closeOnDimmerClick={true}
          >
            <Modal.Content>
              <Modal.Description className='link-modal'>
                <Input onKeyDown={this.trackKeys} onChange={this.linkHandler} placeholder='ex: https://graphitedocs.com' />
              </Modal.Description>
            </Modal.Content>
          </Modal>
          </Menu.Item>
        </Menu>
        <div className={colorPicker}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleChangeComplete}
          />
        </div>
        </div>
      );
    }
  }
}
