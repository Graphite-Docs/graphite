import React, { Component } from "react";
import { Menu, Icon, Dropdown, Popup, Modal, Input, Button, Table } from 'semantic-ui-react';
import { CompactPicker } from 'react-color';
import Dropzone from 'react-dropzone';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
let colorPicker = 'hide'
let colorPickerHighlight = 'hide'
let emojiPicker = 'hide'

export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      display: false,
      color: "#fff",
      emojiDisplay: false,
      displayHighlight: false
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
      setTimeout(() => this.props.modalController(false, "link"), 300)
    }
  }

  onColorClick = (type) => {
    if(type === 'color') {
      this.setState({ display: !this.state.display})
    } else {
      this.setState({ displayHighlight: !this.state.displayHighlight})
    }

  }

  handleChangeComplete = (color) => {
    this.setState({ color: color.hex, display: false }, () => {
      this.props.onClickColor(color);
    });
  };

  handleHighlightChangeComplete = (color) => {
    this.setState({ color: color.hex, displayHighlight: false }, () => {
      this.props.onClickHighlight(color);
    });
  };

  addEmoji = (e) => {
    console.log(e);
    this.props.onClickEmoji(e);
    this.setState({emojiDisplay: false})
  }

  render() {
    let imageFiles;
    if(this.props.files) {
      imageFiles = this.props.files.filter(x => x.type && x.type.includes('image'));
    } else {
      imageFiles = []
    }

    const imagesCollection = <Table unstackable style={{borderRadius: "0"}}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
          <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Uploaded</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {
          imageFiles.map(file => {

          return(
            <Table.Row key={file.id} style={{ marginTop: "35px"}}>
              <Table.Cell><a style={{cursor: "pointer"}} onClick={() => this.props.onClickImage(file.id)}>{file.name ? file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name : "Untitled"}</a></Table.Cell>
              <Table.Cell>{file.uploaded}</Table.Cell>
            </Table.Row>
          );
          })
        }
      </Table.Body>
    </Table>

    const modal = <Modal trigger={
      <Icon onClick={() => this.props.modalController(true)}  name='image outline' />
    }
      open={this.props.modalOpen}
      onClose={() => this.props.modalController(false)}
      size='small'
      closeOnEscape={true}
      closeOnDimmerClick={true}
      closeIcon
    >
      <Modal.Content>
        <Modal.Description>
          {window.location.href.includes('shared/docs/') ?
          <div>
          <h3>Upload a Photo</h3>
          <Dropzone
            style={{ background: "none" }}
            onDrop={ this.props.onImageUpload }
            accept="image/png,image/jpeg,image/jpg,image/tiff,image/gif"
            multiple={ false }
            onDropRejected={ this.props.handleDropRejected }>
            <Button secondary>Upload New Photo</Button>
          </Dropzone>
          </div> :
          <div>
          <h3>Select a photo from Graphite Vault or upload a new one</h3>
          <Dropzone
            style={{ background: "none" }}
            onDrop={ this.props.onImageUpload }
            accept="image/png,image/jpeg,image/jpg,image/tiff,image/gif"
            multiple={ false }
            onDropRejected={ this.props.handleDropRejected }>
            <Button secondary>Upload New Photo</Button>
          </Dropzone>
          <div style={{marginTop: "15px", marginBottom: "15px"}}>
            <h5>Your Photos</h5>
          </div>
          <div>
            {imagesCollection}
          </div>
          </div>
          }
        </Modal.Description>
      </Modal.Content>
    </Modal>

    const linkModal = <Modal trigger={
      <Icon onClick={() => this.props.modalController(true, "link")}  name='linkify' />
    }
      open={this.props.modalTwoOpen}
      onClose={() => this.props.modalController(false, "link")}
      size='small'
      closeOnEscape={true}
      closeOnDimmerClick={true}
      closeIcon
    >
      <Modal.Content>
        <Modal.Description className='link-modal'>
          <Input onKeyDown={this.trackKeys} onChange={this.linkHandler} placeholder='ex: https://graphitedocs.com' />
        </Modal.Description>
      </Modal.Content>
    </Modal>

    if(this.state.display) {
      colorPicker = 'colorPicker'
    } else {
      colorPicker = 'hide'
    }

    if(this.state.displayHighlight) {
      colorPickerHighlight = 'colorPickerHighlight'
    } else {
      colorPickerHighlight = 'hide'
    }

    if(this.state.emojiDisplay) {
      emojiPicker = 'emojiPicker';
    } else {
      emojiPicker = 'hide';
    }


    if(window.innerWidth < 620) {
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

          {/*<Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list-item')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Menu.Item>*/}

          <Menu.Item style={{cursor: "pointer"}}>
            <Dropdown text='More'>
              <Dropdown.Menu>
              <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickMark(e, 'code')}><Popup position='bottom center' trigger={<Icon name='code' />} content='Code (ctrl + `)' /></Dropdown.Item>
              <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'list')}><Popup position='bottom center' trigger={<Icon name='list' />} content='List' /></Dropdown.Item>
              <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'ordered')}><Popup position='bottom center' trigger={<Icon name='list ol' />} content='Numbered List' /></Dropdown.Item>
              <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Dropdown.Item>
              <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Popup position='bottom center' trigger={<Icon name='quote right' />} content='Quote' /></Dropdown.Item>
              <Dropdown.Item style={{cursor: "pointer"}}>
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
              </Dropdown.Item>
                <Dropdown.Item onClick={() => this.onColorClick('color')} style={{cursor: "pointer"}}>
                  <Popup position='bottom center' trigger={
                  <Icon name='eye dropper' />
                  } content='Color' />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => this.onColorClick('highlight')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
                  <Icon name='tint' />
                } content='Highlight' />
                </Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}>

                {
                  this.props.hasLinks() ?
                  <Icon style={{color: "#4183c4"}} onPointerDown={(e) => this.props.onClickLink(e, this.state.url)}  name='unlink' /> :
                  linkModal
                }

                </Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'left')}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'center')}><Popup position='bottom center' trigger={<Icon name='align center' />} content='Align center' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'right')}><Popup position='bottom center' trigger={<Icon name='align right' />} content='Align right' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'justify')}><Popup position='bottom center' trigger={<Icon name='align justify' />} content='Align justify' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}>
                  {modal}
                </Dropdown.Item>
                <Dropdown.Item>
                  <a onClick={() => this.setState({ emojiDisplay: !this.state.emojiDisplay })} style={{cursor: "pointer"}}><span role="img" aria-label="smiley">😃</span></a>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Menu>
        <div className={colorPicker}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleChangeComplete}
          />
        </div>

        <div className={colorPickerHighlight}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleHighlightChangeComplete}
          />
        </div>
        </div>
      );
    } else if(window.innerWidth < 720) {
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
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Menu.Item>
          {/*<Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list-item')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Menu.Item>*/}
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'block-quote')}><Popup position='bottom center' trigger={<Icon name='quote right' />} content='Quote' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}}>
            <Dropdown text='More'>
              <Dropdown.Menu>
                <Dropdown.Item style={{cursor: "pointer"}}>
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
                </Dropdown.Item>
                <Dropdown.Item onClick={() => this.onColorClick('color')} style={{cursor: "pointer"}}>
                  <Popup position='bottom center' trigger={
                  <Icon name='eye dropper' />
                  } content='Color' />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => this.onColorClick('highlight')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
                  <Icon name='tint' />
                } content='Highlight' />
                </Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}>

                {
                  this.props.hasLinks() ?
                  <Icon style={{color: "#4183c4"}} onPointerDown={(e) => this.props.onClickLink(e, this.state.url)}  name='unlink' /> :
                  linkModal
                }

                </Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'left')}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'center')}><Popup position='bottom center' trigger={<Icon name='align center' />} content='Align center' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'right')}><Popup position='bottom center' trigger={<Icon name='align right' />} content='Align right' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'justify')}><Popup position='bottom center' trigger={<Icon name='align justify' />} content='Align justify' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}>
                  {modal}
                </Dropdown.Item>
                <Dropdown.Item>
                  <a onClick={() => this.setState({ emojiDisplay: !this.state.emojiDisplay })} style={{cursor: "pointer"}}><span role="img" aria-label="smiley">😃</span></a>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Menu>
        <div className={colorPicker}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleChangeComplete}
          />
        </div>

        <div className={colorPickerHighlight}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleHighlightChangeComplete}
          />
        </div>
        </div>
      );
    } else if(window.innerWidth < 850) {
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
          {/*<Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list-item')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Menu.Item>*/}
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
          <Menu.Item onClick={() => this.onColorClick('color')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
            <Icon name='eye dropper' />
            } content='Color' />
          </Menu.Item>
          <Menu.Item onClick={() => this.onColorClick('highlight')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
            <Icon name='tint' />
          } content='Highlight' />
          </Menu.Item>
          {
            this.props.hasLinks() ?
            <Menu.Item style={{cursor: "pointer"}}><Icon style={{color: "#4183c4"}} onPointerDown={(e) => this.props.onClickLink(e, this.state.url)}  name='unlink' /></Menu.Item> :
            <Menu.Item style={{cursor: "pointer"}}>
            {linkModal}
            </Menu.Item>
          }
          <Menu.Item style={{cursor: "pointer"}}>
            <Dropdown text='More'>
              <Dropdown.Menu>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'left')}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'center')}><Popup position='bottom center' trigger={<Icon name='align center' />} content='Align center' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'right')}><Popup position='bottom center' trigger={<Icon name='align right' />} content='Align right' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'justify')}><Popup position='bottom center' trigger={<Icon name='align justify' />} content='Align justify' /></Dropdown.Item>
                <Dropdown.Item style={{cursor: "pointer"}}>
                  {modal}
                </Dropdown.Item>
                <Dropdown.Item>
                  <a onClick={() => this.setState({ emojiDisplay: !this.state.emojiDisplay })} style={{cursor: "pointer"}}><span role="img" aria-label="smiley">😃</span></a>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Menu>
        <div className={colorPicker}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleChangeComplete}
          />
        </div>

        <div className={colorPickerHighlight}>
          <CompactPicker
            color={ this.state.color }
            onChangeComplete={this.handleHighlightChangeComplete}
          />
        </div>

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
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickBlock(e, 'check-list')}><Popup position='bottom center' trigger={<Icon name='check square outline' />} content='Checklist' /></Menu.Item>
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
          <Menu.Item onClick={() => this.onColorClick('color')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
            <Icon name='eye dropper' />
            } content='Color' />
          </Menu.Item>
          <Menu.Item onClick={() => this.onColorClick('highlight')} style={{cursor: "pointer"}}><Popup position='bottom center' trigger={
            <Icon name='tint' />
          } content='Highlight' />
          </Menu.Item>
          {
            this.props.hasLinks() ?
            <Menu.Item style={{cursor: "pointer"}}><Icon style={{color: "#4183c4"}} onPointerDown={(e) => this.props.onClickLink(e, this.state.url)}  name='unlink' /></Menu.Item> :
            <Menu.Item style={{cursor: "pointer"}}>
            {linkModal}
            </Menu.Item>
          }
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'left')}><Popup position='bottom center' trigger={<Icon name='align left' />} content='Align left' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'center')}><Popup position='bottom center' trigger={<Icon name='align center' />} content='Align center' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'right')}><Popup position='bottom center' trigger={<Icon name='align right' />} content='Align right' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}} onPointerDown={(e) => this.props.onClickAlign(e, 'justify')}><Popup position='bottom center' trigger={<Icon name='align justify' />} content='Align justify' /></Menu.Item>
          <Menu.Item style={{cursor: "pointer"}}>
            {modal}
          </Menu.Item>
          <Menu.Item>
            <a onClick={() => this.setState({ emojiDisplay: !this.state.emojiDisplay })} style={{cursor: "pointer"}}><span role="img" aria-label="smiley">😃</span></a>
          </Menu.Item>
        </Menu>
          <div className={colorPicker}>
            <CompactPicker
              color={ this.state.color }
              onChangeComplete={this.handleChangeComplete}
            />
          </div>

          <div className={colorPickerHighlight}>
            <CompactPicker
              color={ this.state.color }
              onChangeComplete={this.handleHighlightChangeComplete}
            />
          </div>

          <div className={emojiPicker}>
            <Picker
              set='emojione'
              onSelect={this.addEmoji}
              />
          </div>
        </div>
      );
    }
  }
}
