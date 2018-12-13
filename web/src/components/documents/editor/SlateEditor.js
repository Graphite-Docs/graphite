import { Editor } from 'slate-react'
import React from 'react'
import { isKeyHotkey } from 'is-hotkey'
import Loading from '../../Loading';
import { List } from 'semantic-ui-react';
// import EditCode from 'slate-edit-code'
import Toolbar from './Toolbar';
// import DeepTable from 'slate-deep-table'
const PluginDeepTable = require('slate-deep-table/dist')

const DEFAULT_NODE = 'paragraph'


const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')
const isStrikeHotKey = isKeyHotkey('mod+shift+s')


const plugins = [
  PluginDeepTable()
];

let thisMark;

//TODO: Move these into their own plugin modules

//Links

function wrapLink(editor, href) {
  editor.wrapInline({
    type: 'link',
    data: { href },
  })

  editor.moveToEnd()
}

function unwrapLink(editor) {
  editor.unwrapInline('link')
}

class SlateEditor extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalOpen: false
    };
    this.editor = null;
}

getType = chars => {
  switch (chars) {
    case '*':
    case '-':
    case '+':
      return 'list-item'
    case '>':
      return 'block-quote'
    case '#':
      return 'heading-one'
    case '##':
      return 'heading-two'
    case '###':
      return 'heading-three'
    case '####':
      return 'heading-four'
    case '#####':
      return 'heading-five'
    case '######':
      return 'heading-six'
   case '_':
    return 'italic'
   case '**':
    return 'bold'
   case '`':
    return 'code'
    default:
      return null
  }
}

  hasLinks = () => {
    const { content } = this.props;
    if(content.inlines) {
      return content.inlines.some(inline => inline.type === 'link')
    }

  }

  hasColor = () => {
    const { content } = this.props;
    return content.marks.some(mark => mark.type === 'color')
  }

  hasAlign = (foundAlign) => {
    const {content} = this.props
    return content.blocks.some(node => node.data.get('align') === foundAlign)
  }

  hasMark = type => {
    const { content } = this.props;
    return content.activeMarks.some(mark => mark.type === type)
  }

  hasBlock = type => {
    const { content } = this.props
    return content.blocks.some(node => node.type === type)
  }

  ref = editor => {
    this.editor = editor
  }

  onChange = (change, options={}) => {
    if(window.location.href.includes('shared/docs')) {
      this.props.handlePubChange(change)
    } else {
      this.props.handleChange(change)
    }

    if (!this.remote) {
      this.props.onChange(change)
    } else {
      this.remote = false
    }
  }

  // onCheckboxChange = (event) => {
  //   const checked = event.target.checked;
  // }


  onKeyDown = (event, editor, next) => {
    // const { value } = editor
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
      event.preventDefault()
      editor.toggleMark(mark)
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
      event.preventDefault()
      editor.toggleMark(mark)
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underline'
      event.preventDefault()
      editor.toggleMark(mark)
    } else if (isCodeHotkey(event)) {
      mark = 'code'
      event.preventDefault()
      editor.toggleMark(mark)
    } else if (isStrikeHotKey(event)) {
      mark = 'strikethrough'
      event.preventDefault()
      editor.toggleMark(mark)
    } else if(event.key === ' ') {
      this.onSpace(event, editor, next)
    } else if(event.key === 'Backspace') {
      this.onBackspace(event, editor, next)
    } else if(event.key === 'Enter') {
      this.onEnter(event, editor, next)
    } else {
      return next()
    }
  }

  onEnter = (event, editor, next) => {
    const { value } = editor
    const { selection } = value
    const { start, end, isExpanded } = selection
    if (isExpanded) return next()

    const { startBlock } = value
    if (start.offset === 0 && startBlock.text.length === 0)
      return this.onBackspace(event, editor, next)
    if (end.offset !== startBlock.text.length) {
      return next()
    }
    if (
      startBlock.type !== 'heading-one' &&
      startBlock.type !== 'heading-two' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return next()
    } else {
      event.preventDefault()
      editor.splitBlock().setBlocks('paragraph')
    }


  }

onSpace = (event, editor, next) => {
  const { value } = editor
  const { selection } = value
  if (selection.isExpanded) return next()

  const { startBlock } = value
  const { start } = selection
  const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '')
  const type = this.getType(chars)
  if (!type) return next()
  if (type === 'list-item' && startBlock.type === 'list-item') {
    return next()
  } else if(type === 'italic') {
    event.preventDefault()
    thisMark = 'italic';
  } else if(type === 'code') {
    event.preventDefault()
    thisMark = 'code';
  } else {
    event.preventDefault()
    editor.setBlocks(type)
  }

  if (type === 'list-item') {
    event.preventDefault()
    editor.wrapBlock('list')
  }

  if(thisMark) {
    editor.moveFocusToStartOfNode(startBlock).delete().toggleMark(thisMark)
  } else {
    editor.moveFocusToStartOfNode(startBlock).delete()
  }

}

onBackspace = (event, editor, next) => {
  const { value } = editor
  const { selection } = value
  if (selection.isExpanded) return next()
  if (selection.start.offset !== 0) return next()

  const { startBlock } = value
  if (startBlock.type === 'paragraph') return next()

  event.preventDefault()
  editor.setBlocks('paragraph')

  if (startBlock.type === 'list-item') {
    editor.unwrapBlock('list')
  }
}

onClickAlign = (event, align) => {
  event.preventDefault()
  const { editor } = this
  // const { value } = editor
  const hasAlign = this.hasAlign(align)
  if (hasAlign) {
    editor.setBlocks({
      type: 'align',
      data: { class: null },
    }).focus()
  } else {
    editor.setBlocks({
      type: 'align',
      data: { class: `align_${align}` },
    }).focus()
  }
}

  onClickLink = (event, url) => {

    event.preventDefault()
    const { editor } = this
    const { value } = editor
    const hasLinks = this.hasLinks()

    if (hasLinks) {
      editor.command(unwrapLink)
    } else if (value.selection.isExpanded) {
      const href = url
      if (href === null) {
        return
      }

      editor.command(wrapLink, href)
    } else {
      const href = url

      if (href === null) {
        return
      }

      const text = window.prompt('Enter the text for the link:')

      if (text === null) {
        return
      }

      editor
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href)
    }
  }


  onClickColor = (color) => {
    const { editor } = this
    const { value } = this.editor
    const hasColor = this.hasColor()

    if(hasColor) {
      if(value.selection.isExpanded) {
        value.marks.filter(mark => mark.type === 'color').forEach(mark => {
        editor
        .removeMark(mark).focus()
        .addMark({ type: 'color', data: { class: 'color_' + color.hex.split('#')[1] } }).focus()
      })
      }
    } else {
      editor.addMark({ type: 'color', data: { class: 'color_' + color.hex.split('#')[1] } }).focus()
    }

    // if (hasColor) {
    //   editor.command(unwrapColor)
    // } else if (value.selection.isExpanded) {
    //   const style = {
    //     color: color.hex
    //   }
    //
    //   if (style === null) {
    //     return
    //   }
    //
    //   editor.command(wrapColor, style)
    // } else {
    //   const style = {
    //     color: color.hex
    //   }
    //
    //   if (style === null) {
    //     return
    //   }
    //
    //   editor.command(wrapColor, style)
    // }
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    this.editor.toggleMark(type)
  }

  onClickBlock = (event, type) => {
    event.preventDefault()
    const { editor } = this
    const { value } = editor
    const { document } = value

    // Handle everything but list buttons.
    if (type !== 'list' && type !== 'ordered' && type !== 'check-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')
      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('list')
          .unwrapBlock('ordered')
          .unwrapBlock('check-list')
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      if(type === 'check-list') {
        const isCheckList = this.hasBLock('check-list-item')
        const isType = value.blocks.some(block => {
          return !!document.getClosest(block.key, parent => parent.type === type)
        })
        if(isCheckList && isType) {
          editor
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock('check-list')
        } else if (isCheckList) {
          editor
          .unwrapBlock('check-list')
          .wrapBlock(type)
        }
      } else {
        const isList = this.hasBlock('list-item');
        const isType = value.blocks.some(block => {
          return !!document.getClosest(block.key, parent => parent.type === type)
        })
        if (isList && isType) {
          editor
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock('list')
            .unwrapBlock('ordered')
        } else if (isList) {
          editor
            .unwrapBlock(
              type === 'list' ? 'ordered' : 'list'
            )
            .wrapBlock(type)
        }
      }

        if(type === 'check-list') {
          editor.setBlocks('check-list-item', { data: { checked: false } }).wrapBlock(type)
        } else {
          editor.setBlocks('list-item').wrapBlock(type)
        }

    }
  }


  onInsertTable = () => {
    this.onChange(
      this.editor.insertTable()
    );
    this.onChange(
      this.editor.toggleTableHeaders()
    )
  }

  onInsertCol = () => {
    this.onChange(
        this.editor.insertColumn()
    );
  }

  onInsertRow = () => {
    this.onChange(
        this.editor.insertRow()
    );
  }

  onRemoveCol = () => {
    this.onChange(
        this.editor.removeColumn()
    );
  }

  onRemoveRow = () => {
    this.onChange(
        this.editor.removeRow()
    );
  }

  onRemoveTable = () => {
    this.onChange(
      this.editor.removeTable()
    );
  }

  modalController = (props) => {
    this.setState({ modalOpen: props });
  }

  applyOperations = operations => {
    this.remote = true;
    if(operations) {
      operations.forEach(o => this.editor.applyOperation(o))
    }
  }



  render() {
    let table = document.getElementsByTagName('table')[0];
    if(table) {
      table.classList.add("ui");
      table.classList.add("unstackable");
      table.classList.add("table");
    }

    const isTable = this.editor && this.editor.isSelectionInTable(this.props.content);
    if(this.props.content) {
      return (
        <div>
          {this.props.readOnly ?
            <div className='hide' /> :
            <Toolbar
              onClickMark={this.onClickMark}
              onClickBlock={this.onClickBlock}
              onFontColorClick={this.onFontColorClick}
              onInsertTable={this.onInsertTable}
              onInsertCol={this.onInsertCol}
              onInsertRow={this.onInsertRow}
              onRemoveCol={this.onRemoveCol}
              onRemoveRow={this.onRemoveRow}
              onRemoveTable={this.onRemoveTable}
              onClickLink={this.onClickLink}
              onClickColor={this.onClickColor}
              modalOpen={this.state.modalOpen}
              modalController={this.modalController}
              hasLinks={this.hasLinks}
              onClickAlign={this.onClickAlign}
              isTable={isTable}
            />
          }
          <div className="ql-editor">
          {this.props.collabContent ?
            <Editor
              className='editor'
              spellCheck
              autoFocus
              plugins={plugins}
              placeholder="Write something great..."
              ref={this.ref}
              value={this.props.collabContent}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              renderNode={this.renderNode}
              renderMark={this.renderMark}
            /> :
            <Editor
              className='editor'
              spellCheck
              autoFocus
              plugins={plugins}
              placeholder="Write something great..."
              ref={this.ref}
              value={this.props.content}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              renderNode={this.renderNode}
              renderMark={this.renderMark}
            />
          }

          </div>
        </div>
      )
    } else {
      return (
        <Loading />
      )
    }
  }

  renderNode = (props, editor, next) => {
    const { attributes, children, node } = props
    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'check-list-item':
        const checked = node.data.get('checked')
        return <List.Item {...attributes}><input type='checkbox' checked={checked} onChange={this.onCheckboxChange} style={{paddingTop: "3px"}} /><span style={{ marginLeft: "5px"}}>{children}</span></List.Item>
      case 'ordered':
        return <ol {...attributes}>{children}</ol>
      case 'link': {
          const { data } = node
          const href = data.get('href')
          return (
            <a {...attributes} href={href}>
              {children}
            </a>
          )
        }
      case 'align':
        const align = node.data.get('class')
        return <div {...attributes} className={align}>{children}</div>
      case 'check-list':
        return <List className='check-list' {...props}>{children}</List>
      default:
        return next()
    }
  }

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underline':
        return <u {...attributes}>{children}</u>
      case 'strikethrough':
        return <strike {...attributes}>{children}</strike>
      case 'color':
        const color = mark.data.get('class');
        return <span className={color} {...attributes}>{children}</span>
      default:
        return next()
    }
  }
}

export default SlateEditor
