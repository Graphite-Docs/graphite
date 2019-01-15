import { Editor, getEventTransfer } from 'slate-react'
import React from 'react'
import { isKeyHotkey } from 'is-hotkey'
import Html from 'slate-html-serializer'
import Loading from '../../Loading';
import { Block } from 'slate';
import { List, Image, Modal, Button, Table, Input, Grid } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
// import EditCode from 'slate-edit-code'
import Toolbar from './Toolbar';
// import DeepTable from 'slate-deep-table'
import initialTimeline from './initialTimeline.json';
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

//Images
function insertImage(editor, src, target) {
  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type: 'image',
    data: { src, class: 'img-center' },
  })
}

//Embeds
function insertEmbed(editor, src, target) {
  let updatedSrc;
  if(src) {
    if(src.includes('youtube')) {
      updatedSrc = "https://www.youtube.com/embed/" + src.split('=')[1]
    } else if(src.includes("tu.be")) {
      updatedSrc = "https://www.youtube.com/embed/" + src.split('be/')[1]
    } else if(src.includes('vimeo')) {
      updatedSrc = "https://player.vimeo.com/video/" + src.split('com/')[1]
    } else {
      updatedSrc = src.split('status/')[1]
    }
  } else {
    updatedSrc = "none"
  }

  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type: 'embed',
    data: {
      src: updatedSrc,
    },
  })
  setTimeout(() => {
    if(src) {
      if(src.includes("status/")) {
        //Find all tweets that have been embeded and fetch the content via Twitter
        var tweets = document.getElementsByClassName("tweet");

        var t;
        for (t = 0; t < tweets.length; t++) {
          let id = document.getElementsByClassName("tweet")[t].getAttribute("id");
          window.twttr.widgets.createTweet(
            id, tweets[t],
            {
              conversation : 'none',    // or all
              cards        : 'hidden',  // or visible
              linkColor    : '#cc0000', // default is blue
              theme        : 'light'    // or dark
            });
        }
      }
    }

    new window.TL.Timeline('timeline-embed',
          initialTimeline);

  }, 1000)
}

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor, { code, node, child }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph')
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
        }
        default: return null
      }
    },
  },
  blocks: {
    image: {
      isVoid: true,
    },
    video: {
      isVoid: true,
    },
    embed: {
      isVoid: true,
    }
  },
  inlines: {
    emoji: {
      isVoid: true,
    },
  },
}

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
}

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]

      if (block) {
        return {
          object: 'block',
          type: block,
          nodes: next(el.childNodes),
        }
      }
    },
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()]

      if (mark) {
        return {
          object: 'mark',
          type: mark,
          nodes: next(el.childNodes),
        }
      }
    },
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'pre') {
        const code = el.childNodes[0]
        const childNodes =
          code && code.tagName.toLowerCase() === 'code'
            ? code.childNodes
            : el.childNodes

        return {
          object: 'block',
          type: 'code',
          nodes: next(childNodes),
        }
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'img') {
        return {
          object: 'block',
          type: 'image',
          nodes: next(el.childNodes),
          data: {
            src: el.getAttribute('src'),
          },
        }
      }
    },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() === 'a') {
        return {
          object: 'inline',
          type: 'link',
          nodes: next(el.childNodes),
          data: {
            href: el.getAttribute('href'),
          },
        }
      }
    },
  },
]

const html = new Html({ rules: RULES })

class SlateEditor extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalOpen: false,
      modalTwoOpen: false,
      showCollab: false,
      uniqueID: "",
      versions: [],
      v: '',
      timelineModal: false,
      timelineTitleOpen: false,
      timelineEventOpen: false
    };
    this.editor = null;
}

componentDidMount() {
  //Find all tweets that have been embeded and fetch the content via Twitter
  var tweets = document.getElementsByClassName("tweet");

  var t;
  for (t = 0; t < tweets.length; t++) {
    let id = document.getElementsByClassName("tweet")[t].getAttribute("id");
    window.twttr.widgets.createTweet(
      id, tweets[t],
      {
        conversation : 'none',    // or all
        cards        : 'hidden',  // or visible
        linkColor    : '#cc0000', // default is blue
        theme        : 'light'    // or dark
      });
  }
  setTimeout(() => {
    if(document.getElementById('timeline-embed')) {
      new window.TL.Timeline('timeline-embed',
            this.props.myTimeline);
    }
  }, 500)

}

getType = chars => {
  switch (chars) {
    case '*':
    case '-':
    case '+':
      return 'list-item'
    case '[]':
      return 'check-list-item'
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

  hasHighlight = () => {
    const { content } = this.props;
    return content.marks.some(mark => mark.type === 'highlight')
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
      this.props.handlePubChange(change, this.state.versions)
    } else {
      this.props.handleChange(change, this.state.versions)
    }

    if (!this.remote) {
      this.props.onChange(change)
    } else {
      this.remote = false
    }
  }

  onCheckboxChange = (event, node) => {
    const checked = event.target.checked
    this.editor.setNodeByKey(node.key, { data: { checked } })
  }

  onCheckboxClick = (node, checked) => {
    this.editor.setNodeByKey(node.key, { data: { checked } })
  }


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
    if (isExpanded){
      return next()
    }

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
  } else if(type === 'check-list-item') {
    event.preventDefault()
    editor.wrapBlock('check-list')
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
  } else if (startBlock.type === 'check-list-item') {
    editor.unwrapBlock('check-list')
  }
}

onClickEmbed = (type, src) => {
  this.editor.command(insertEmbed, src)
}

onClickImage = (props) => {
  // event.preventDefault()
  this.props.loadSingleVaultFile(props)
  this.setState({ modalOpen: false });
  setTimeout(() => {
    if(this.props.link) {
      console.log("Link is here")
      const src = this.props.link;
      // const src = this.props.file.file["preview"];
      this.editor.command(insertImage, src)
    } else {
      console.log("no link, trying again")
      setTimeout(() => {
        const src = this.props.link;
        // const src = this.props.file.file["preview"];
        if (!src) return
        this.editor.command(insertImage, src)
      }, 1000)
    }
  }, 1000)

}

onImageUpload = (files) => {
  this.props.handleVaultDrop(files)
  this.setState({ modalOpen: false });
  setTimeout(() => {
    if(this.props.link) {
      console.log("Link is here")
      const src = this.props.link;
      this.editor.command(insertImage, src)
    } else {
      console.log("no link, trying again")
      setTimeout(() => {
        console.log('Link: ' + this.props.link)
        const src = this.props.link;
        if (!src) return
        this.editor.command(insertImage, src)
      }, 1000)
    }
  }, 1000)
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
  }

  onClickHighlight = (color) => {
    const { editor } = this
    const { value } = this.editor
    const hasHighlight = this.hasHighlight()

    if(hasHighlight) {
      if(value.selection.isExpanded) {
        value.marks.filter(mark => mark.type === 'highlight').forEach(mark => {
        editor
        .removeMark(mark).focus()
        .addMark({ type: 'highlight', data: { class: 'background_' + color.hex.split('#')[1] } }).focus()
      })
      }
    } else {
      editor.addMark({ type: 'highlight', data: { class: 'background_' + color.hex.split('#')[1] } }).focus()
    }
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    this.editor.toggleMark(type)
  }

  onClickBlock = (event, type) => {
    event.preventDefault()
    console.log("click")
    console.log(type)
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
        const isCheckList = this.hasBlock('check-list-item')
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

  onClickEmoji = (code) => {
    console.log(code);
    this.editor
      .insertText(code.native)
      .focus()
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

  onClickRedo = event => {
    event.preventDefault()
    this.editor.redo()
  }

  onClickUndo = event => {
    event.preventDefault()
    this.editor.undo()
  }

  onPaste = (event, editor, next) => {
    const transfer = getEventTransfer(event)
    if (transfer.type !== 'html') return next()
    const { document } = html.deserialize(transfer.html)
    editor.insertFragment(document)
  }

  modalController = (props, type) => {
    if(type === "link") {
      this.setState({ modalTwoOpen: props })
    } else {
      this.setState({ modalOpen: props });
    }
  }

  applyOperations = (operations) => {
    this.remote = true;
    if(operations) {
      operations.forEach(o => this.editor.applyOperation(o))
    }
  }

  closeConfigShow = (closeOnEscape, closeOnDimmerClick) => () => {
    this.setState({ closeOnEscape, closeOnDimmerClick, timelineTitleOpen: true })
  }

  close = () => this.setState({ timelineTitleOpen: false })

  handleTimelineTitleUpdate = () => {
    this.close()
    this.props.handleUpdateTimelineTitle()
  }

  closeConfig2Show = (closeOnEscape, closeOnDimmerClick) => () => {
    this.setState({ closeOnEscape, closeOnDimmerClick, timelineEventOpen: true })
  }

  close2 = () => this.setState({ timelineEventOpen: false })

  handleTimelineEventUpdate = () => {
    this.close2()
    this.props.handleAddNewTimelineEvent()
  }

  handleTimelineSave = () => {
    new window.TL.Timeline('timeline-embed',
          this.props.myTimeline);
    this.setState({timelineModal: false})
    this.props.handleTimelineSave();
  }

  handleTimelineDeleteEvent = () => {

  }

  handleOpen = () => this.setState({ timelineModal: true })
  handleClose = () => this.setState({ timelineModal: false })


  render() {

    //Style all tables in doc
    let table = document.getElementsByTagName('table');

    let length = table !== null ? table.length : 0;
    let i = 0;
    for(i; i < length; i++) {
      if(table) {
        if(table[i].classList.length > 0) {

        } else {
          table[i].classList.add("ui");
          table[i].classList.add("unstackable");
          table[i].classList.add("table");
        }
      }
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
              onClickHighlight={this.onClickHighlight}
              modalOpen={this.state.modalOpen}
              modalTwoOpen={this.state.modalTwoOpen}
              modalController={this.modalController}
              hasLinks={this.hasLinks}
              onClickAlign={this.onClickAlign}
              onClickImage={this.onClickImage}
              onImageUpload={this.onImageUpload}
              onClickEmbed={this.onClickEmbed}
              onClickEmoji={this.onClickEmoji}
              onClickRedo={this.onClickRedo}
              onClickUndo={this.onClickUndo}
              isTable={isTable}
              files={this.props.files}
            />
          }
          {
            this.props.showCollab ?
            <div className='authorship'>
              <div>
                <h4 style={{color: "#fff", marginLeft: "15px"}}>{this.props.uniqueID}...</h4>
              </div>
            </div>:
            <div className="hide" />
          }
          <div className="ql-editor">
          {this.props.collabContent ?
            <Editor
              className='editor'
              spellCheck
              autoFocus
              plugins={plugins}
              schema={schema}
              placeholder="Write something great..."
              ref={this.ref}
              value={this.props.collabContent}
              onChange={this.onChange}
              onPaste={this.onPaste}
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
              schema={schema}
              ref={this.ref}
              value={this.props.content}
              onChange={this.onChange}
              onPaste={this.onPaste}
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
    const { myTimeline } = this.props;
    console.log(myTimeline)
    const { attributes, children, node, isFocused } = props
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
        const checked = node.data.get('checked') || false
        return <List.Item style={{marginLeft: "10px", marginBottom: "12px"}}{...attributes}>
          <label className='checkmarkContainer'>
            <input type='checkbox' checked={checked} onChange={() => console.log("clicked")} />
            <span onClick={() => this.onCheckboxClick(node, !checked)} className="checkmark"></span>
          </label>
          <span style={{ marginLeft: "30px"}}>{checked ? <strike style={{color: "#cecece"}}>{children}</strike> : <span>{children}</span>}</span>
        </List.Item>
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
      case 'image': {
        const src = node.data.get('src')
        const imageClass = node.data.get('class')
        return <Image className={imageClass} selected={isFocused} src={src} {...attributes} />
      }
      case 'emoji': {
        const code = node.data.get('code')
        return (
          <span
            {...attributes}
            selected={isFocused}
            contentEditable={false}
          >
            {code}
          </span>
        )
      }
      case 'align':
        const align = node.data.get('class')
        return <div {...attributes} className={align}>{children}</div>
      case 'check-list':
        return <List className='check-list'>{children}</List>
      case 'embed': {
          const src = node.data.get('src');
          if(src !== "none") {
            if(src.includes('youtube') || src.includes('vimeo')) {
              return(
                <div className='video-center'>
                <iframe
                  title="youtube video"
                  id="ytplayer"
                  type="text/html"
                  width="640"
                  height="476"
                  src={src}
                  frameBorder="0"
                  allowFullScreen="allowfullscreen"
                  mozallowFullScreen="mozallowfullscreen"
                  msallowfullscreen="msallowfullscreen"
                  oallowfullscreen="oallowfullscreen"
                  webkitallowfullscreen="webkitallowfullscreen"
                />
                </div>
              )
            } else {
              return (
                <div className='tweet' id={src} />
              )
            }
          } else {
            return (
              <div>
              <Modal
                trigger={<Button secondary circular icon='add' style={{cursor: "pointer"}} onClick={this.handleOpen}></Button>}
                open={this.state.timelineModal}
                onClose={this.handleClose}
                closeIcon
                size='small'
                >
                <Modal.Content>
                  <SemanticHeader icon='browser' content='Update Your Timeline' />
                  <h3>Add new events or update the starting information</h3>
                  <div>
                  <h5><a onClick={this.closeConfigShow(true, true)}>Update Timeline Title Card</a></h5>
                  <Modal
                    open={this.state.timelineTitleOpen}
                    closeOnEscape={this.state.closeOnEscape}
                    closeOnDimmerClick={this.state.closeOnDimmerClick}
                    onClose={this.close}
                  >
                    <Modal.Header>Update Timeline Title Card</Modal.Header>
                    <Modal.Content>
                      <Grid columns='two' divided>
                        <Grid.Row>
                          <Grid.Column>
                            <p>Media URL</p>
                            <Input onChange={this.props.handleTimelineTitleMediaUrl} placeholder='Enter a url to the media you want to use' /> <br/>
                            <p>Media Caption</p>
                            <Input onChange={this.props.handleTimelineTitleMediaCaption} placeholder='Enter a caption for the media you want to use' /> <br/>
                            <p>Media Credit</p>
                            <Input onChange={this.props.handleTimelineTitleMediaCredit} placeholder='Give credit to the creator of the media' /> <br/>
                          </Grid.Column>
                          <Grid.Column>
                            <p>Title Headline</p>
                            <Input onChange={this.props.handleTimelineTitleTextHeadline} placeholder='Enter a headline' /> <br/>
                            <p>Title Sub-Text</p>
                            <Input onChange={this.props.handleTimelineTitleTextText} placeholder='Enter some sub-text' /> <br/>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                      <Button
                        onClick={this.handleTimelineTitleUpdate}
                        secondary
                        style={{borderRadius: "0"}}
                        content='Update'
                      />
                      <Button style={{borderRadius: "0"}} onClick={this.close}>
                        Cancel
                      </Button>
                    </Modal.Actions>
                  </Modal>
                  <h3>Timeline Events ({myTimeline.events.length}) <Button onClick={this.closeConfig2Show(true, true)} secondary style={{borderRadius: "0"}}>New Event</Button></h3>

                  <Modal
                    open={this.state.timelineEventOpen}
                    closeOnEscape={this.state.close2OnEscape}
                    closeOnDimmerClick={this.state.close2OnDimmerClick}
                    onClose={this.close2}
                  >
                    <Modal.Header>Add New Timeline Event</Modal.Header>
                    <Modal.Content>
                      <Grid columns='two' divided>
                        <Grid.Row>
                          <Grid.Column>
                            <p>Media URL</p>
                            <Input onChange={this.props.handleTimelineEventMediaUrl} placeholder='Enter a url to the media you want to use' /> <br/>
                            <p>Media Caption</p>
                            <Input onChange={this.props.handleTimelineEventMediaCaption} placeholder='Enter a caption for the media you want to use' /> <br/>
                            <p>Media Credit</p>
                            <Input onChange={this.props.handleTimelineEventMediaCredit} placeholder='Give credit to the creator of the media' /> <br/>
                          </Grid.Column>
                          <Grid.Column>
                            <p>Event Headline</p>
                            <Input onChange={this.props.handleTimelineEventTextHeadline} placeholder='Enter a headline' /> <br/>
                            <p>Event Sub-Text</p>
                            <Input onChange={this.props.handleTimelineEventTextText} placeholder='Enter some sub-text' /> <br/>
                            <p>Event Month</p>
                            <Input onChange={this.props.handleTimelineEventStartMonth} placeholder='Enter a headline' /> <br/>
                            <p>Event Day</p>
                            <Input onChange={this.props.handleTimelineEventStartDay} placeholder='Enter some sub-text' /> <br/>
                            <p>Event Year</p>
                            <Input onChange={this.props.handleTimelineEventStartYear} placeholder='Enter some sub-text' /> <br/>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                      <Button
                        onClick={this.handleTimelineEventUpdate}
                        secondary
                        style={{borderRadius: "0"}}
                        content='Update'
                      />
                      <Button style={{borderRadius: "0"}} onClick={this.close2}>
                        Cancel
                      </Button>
                    </Modal.Actions>
                  </Modal>


                  <Table unstackable style={{borderRadius: "0"}}>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                        <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {
                        myTimeline.events.reverse().map(a => {
                        return(
                          <Table.Row key={a.unique_id}>
                            <Table.Cell>{a.text.headline}</Table.Cell>
                            <Table.Cell><a style={{cursor: "pointer", color: "red"}} onClick={() => this.props.handleDeleteTimelineEvent(a.unique_id)}>Delete</a></Table.Cell>
                          </Table.Row>
                        );
                        })
                      }
                    </Table.Body>
                  </Table>
                  </div>

                </Modal.Content>
                <Modal.Actions>
                  <Button color='black' onClick={this.handleTimelineSave}>
                    Save
                  </Button>
                </Modal.Actions>
                </Modal>
                <div id='timeline-embed' style={{width: "100%", height: "600px"}}></div>
              </div>
            )
          }

      }
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
      case 'highlight':
        const highlight = mark.data.get('class');
        return <span className={highlight} {...attributes}>{children}</span>
      default:
        return next()
    }
  }
}

export default SlateEditor
