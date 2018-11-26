import { Editor } from 'slate-react'
import React from 'react'
import { isKeyHotkey } from 'is-hotkey'
import Toolbar from './Toolbar';
// import DeepTable from 'slate-deep-table'
const PluginDeepTable = require('slate-deep-table/dist')

const DEFAULT_NODE = 'paragraph'


const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')
const plugins = [
  PluginDeepTable()
];

class SlateEditor extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.editor = null;
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
    this.props.handleChange(change, options={})
  }


  onKeyDown = (event, editor, next) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underline'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else {
      return next()
    }

    event.preventDefault()
    editor.toggleMark(mark)
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
    if (type !== 'list' && type !== 'ordered') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('list')
          .unwrapBlock('ordered')
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
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



  render() {
    let table = document.getElementsByTagName('table')[0];
    if(table) {
      table.classList.add("ui");
      table.classList.add("unstackable");
      table.classList.add("table");
    }

    return (
      <div>
        <Toolbar
          onClickMark={this.onClickMark}
          onClickBlock={this.onClickBlock}
          onInsertTable={this.onInsertTable}
        />
        <Editor
          className='editor ql-editor'
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
      </div>
    )
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
      case 'ordered':
        return <ol {...attributes}>{children}</ol>
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
      default:
        return next()
    }
  }
}

export default SlateEditor
