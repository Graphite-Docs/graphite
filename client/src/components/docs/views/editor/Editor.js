import React from 'reactn';
import { Editor } from 'slate-react';
import { Block, Value } from 'slate';
import { handlePubChange } from '../../helpers/publicDoc';
import { onChange, onKeyDown, clickBlock } from './editorHandler';
import { renderMark, renderBlock, renderInline } from './renderers';
import Toolbar from './Toolbar';
import TableMenu from './TableMenu';
import TableModal from './TableModal';
import MainMenu from './MainMenu';
import { handleDragOver, handleImageDrop, handleImageUpload } from './imagehandler';
import { onClickLink } from './linkHandler';
import { onClickComment } from './commentHandler';
import { onClickList } from './listHandler';
import MenuBar from './MenuBar';
import Tables from 'slate-tables';
import initialValue from './initialValue.json';
import Dimmer from './Dimmer';
import Outline from './Outline';
import WordModal from './WordModal';
import CommentReview from './CommentReview';
import PageSettings from './PageSettings';
import bold from './assets/icons/bold.svg';
import italic from './assets/icons/italic.svg';
import underline from './assets/icons/underline.svg';
import alignLeft from './assets/icons/align-left.svg';
import alignRight from './assets/icons/align-right.svg';
import alignCenter from './assets/icons/align-center.svg';

let tableMenu = false;

let initialLoad = false;

const plugins = [
  Tables({ /* options object here; see below */ }),
];

const schema = {
    document: {
      last: { type: 'paragraph' },
      normalize: (editor, { code, node, child }) => {
        switch (code) {
          case 'last_child_type_invalid': {
            const paragraph = Block.create('paragraph')
            return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
          }
        }
      },
    },
    blocks: {
      image: {
        isVoid: true,
      },
    },
  }

export default class SlateEditor extends React.Component {

  componentDidMount() {
      //Setting this to true so that when onChange fires for the first time due to editor focus, it doesn't trigger and auto-save
      initialLoad = true;
      let editor = document.getElementById('editor-section');
      let thisDoc = this.global.document;
      if(thisDoc.marginRight) {
        editor.style.paddingRight = `${(thisDoc.marginRight * 60 * 1.65)}px`;
        editor.style.paddingLeft = `${(thisDoc.marginLeft * 60 * 1.65)}px`;
        editor.style.paddingTop = `${(thisDoc.marginTop * 60 * 1.65)}px`;
        editor.style.paddingBottom = `${(thisDoc.marginBottom * 60 * 1.65)}px`;
      }
      editor.style.lineHeight = this.global.spacing;
  }

  ref = (editor) => {
    this.editor = editor
  }


setTable = (size) => {
  //event.preventDefault();
  const col = size.split('x')[0];
  const rows = size.split('x')[1];
  this.editor.insertTable(col,rows);
  document.getElementById('table-drop').style.display = "none";
}

onClickBlock = (event, type) => {
    event.preventDefault();
    //Close any menus that might have been open
    let menus = document.getElementsByClassName('menu-drops');
    for (const menu of menus) {
        menu.style.display = "none";
    }

    const { editor } = this;
    if(type === 'undo') {
        editor.undo();
    } else if(type === 'redo') {
        editor.redo();
    } else if(type === "link") {
        onClickLink(event, editor);
    } else if(type === 'comment') {
        onClickComment(event, editor);
    } else if(type === "unordered-list" || type === "ordered-list") {
        onClickList(event, editor, type);
    } else {
        clickBlock(editor, type);
    }
}

onImageClick = (event) => {
    if(document.getElementById('insert-drop')) {
      document.getElementById('insert-drop').style.display = "none";
    } 
    const { editor } = this;
    handleImageUpload(event, editor);
}

handleMenus = (event) => {
    document.getElementById('font-drop') ? document.getElementById('font-drop').style.display = "none" : console.log(null);
    document.getElementById('heading-drop') ? document.getElementById('heading-drop').style.display = "none" : console.log(null);
    document.getElementById('size-drop') ? document.getElementById('size-drop').style.display = "none" : console.log(null);
    document.getElementById('color-drop') ? document.getElementById('color-drop').style.display = "none" : console.log(null);
    document.getElementById('highlight-drop') ? document.getElementById('highlight-drop').style.display = "none" : console.log(null);
    let menus = document.getElementsByClassName('menu-drops');
      for (const menu of menus) {
          menu.style.display = "none";
      }
      if(document.getElementById('table-drop')) {
        document.getElementById('table-drop').style.display = "none";
      }
      if(document.getElementById('shape-menu')) {
        document.getElementById('shape-menu').style.display = "none";
      }
}

handleHeaderClick = (e) => {
  e.preventDefault();
  document.getElementById('header-controls').style.display = "block";
}

handleFooterClick = (e) => {
  e.preventDefault();
  document.getElementById('footer-controls').style.display = "block";
}

handleEditorFocus = (e) => {
  e.preventDefault();
  document.getElementById('header-controls').style.display = "none";
  document.getElementById('footer-controls').style.display = "none";
}

style = (type) => {
  if(type === 'bold') {
    document.execCommand('bold', false, null)
  } else if(type === "italic") {
    document.execCommand('italic', false, null)
  } else if(type === "underline") {
    document.execCommand('underline', false, null)
  } else if(type === "left") {
    document.execCommand('justifyLeft', false, null)
  } else if(type === "center") {
    document.execCommand('justifyCenter', false, null)
  } else if(type === "right") {
    document.execCommand('justifyRight', false, null)
  }
}

handleChange = (editor) => {
  if(initialLoad) {
    //Do nothing besides set initial load to false
    initialLoad = false;
  } else {
    if (window.location.href.includes("shared/docs")) {
      handlePubChange(editor);
    } else {
      onChange(editor)
    }
  }
}

  render() {
    const { content } = this.global;
    const { editor } = this;
    //Checking to see if the editor exists and if there is a table and if the user has clicked into the table
    if(editor) {
      if(editor.isSelectionInTable()) {
        tableMenu = true;
      } else {
        tableMenu = false;
      }
    } else {
      tableMenu = false;
    }
    return (
    <div>
        <TableModal 
          setTable={this.setTable}
        />
        <MainMenu />
        {
          tableMenu ? 
          <TableMenu 
            editor={editor}
          /> : 
          <MenuBar 
            onClickBlock={this.onClickBlock}
            onImageClick={this.onImageClick}
          />
        }
        <Toolbar
          editor={this.ref}
          onClickBlock={this.onClickBlock}
          currentColor={this.currentColor}
          currentHightlight={this.currentHighlight}
          onImageClick={this.onImageClick}
        />  
        <div id="doc-background" onClick={this.handleMenus}>
          <div className="page-view">
            <div onClick={this.handleHeaderClick} style={{display: "none"}} id="header-wrapper">
              <div suppressContentEditableWarning={true} contentEditable={true} id="header">Header</div>
              <div style={{display: "none"}} id="header-controls">
              <div className="toolbar">
                <ul>
                    <li onClick={() => this.style('bold')}><img src={bold} alt="bold icon" /></li>
                    <li onClick={() => this.style('italic')}><img src={italic} alt="italic icon" /></li>
                    <li onClick={() => this.style('underline')}><img src={underline} alt="underline icon" /></li>
                    <li onClick={() => this.style('left')}>
                        <img src={alignLeft} alt="align left icon" />
                    </li>
                    <li onClick={() => this.style('center')}>
                        <img src={alignCenter} alt="align center icon" />
                    </li>
                    <li onClick={() => this.style('right')}>
                        <img src={alignRight} alt="align right icon" />
                    </li>
                </ul>
            </div>
              </div>
            </div>
            <Dimmer />
            <Outline />
            <WordModal />
            <CommentReview />
            <PageSettings />
            <Editor 
                onClick={this.handleEditorFocus}
                className="main-editor" 
                id="editor-section"
                schema={schema}
                plugins={plugins}
                onClickUndo={this.onClickUndo}
                onDrop={handleImageDrop} 
                onDragOver={handleDragOver} 
                value={content ? content : Value.fromJSON(initialValue)} 
                onChange={this.handleChange} 
                onKeyDown={onKeyDown}
                renderMark={renderMark}
                renderBlock={renderBlock}
                renderInline={renderInline}
                spellCheck
                autoFocus
                ref={this.ref}
            />

            <div onClick={this.handleFooterClick} style={{display: "none"}} id="footer-wrapper">
              <div suppressContentEditableWarning={true} contentEditable={true} id="footer">Footer</div>
              <div style={{display: "none"}} id="footer-controls">
              <div className="toolbar">
                <ul>
                    <li onClick={() => this.style('bold')}><img src={`${__dirname}/assets/icons/bold.svg`} alt="bold icon" /></li>
                    <li onClick={() => this.style('italic')}><img src={`${__dirname}/assets/icons/italic.svg`} alt="italic icon" /></li>
                    <li onClick={() => this.style('underline')}><img src={`${__dirname}/assets/icons/underline.svg`} alt="underline icon" /></li>
                    <li onClick={() => this.style('left')}>
                        <img src={`${__dirname}/assets/icons/align-left.svg`} alt="align left icon" />
                    </li>
                    <li onClick={() => this.style('center')}>
                        <img src={`${__dirname}/assets/icons/align-center.svg`} alt="align center icon" />
                    </li>
                    <li onClick={() => this.style('right')}>
                        <img src={`${__dirname}/assets/icons/align-right.svg`} alt="align right icon" />
                    </li>
                </ul>
            </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    );
  }
}
