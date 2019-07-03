import React, { setGlobal } from 'reactn';
import { exportAsWord, exportAsRTF, exportAsTXT, exportAsPDF } from '../../helpers/exportHelpers';
import { handlePageSettings, lineHeight } from '../../helpers/settings';
import Countable from 'countable';

export default class MenuBar extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
          menuSelection: "file"
      }
  }

  handleSelection = async (menuSelection) => {
    let menus = document.getElementsByClassName('menu-drops');
      for (const menu of menus) {
          menu.style.display = "none";
      }
      if(menuSelection === "file") {
        await this.setState({ menuSelection })
        document.getElementById('file-drop').style.display = "inline-block";
      } else if(menuSelection === "edit") {
        await this.setState({ menuSelection })
        document.getElementById('edit-drop').style.display = "inline-block";
      } else if(menuSelection === "insert") {
        await this.setState({ menuSelection })
        document.getElementById('insert-drop').style.display = "inline-block";
      } else if(menuSelection === "format") {
        await this.setState({ menuSelection })
        document.getElementById('format-drop').style.display = "inline-block";
      } else if(menuSelection === "tools") {
        await this.setState({ menuSelection })
        document.getElementById('tools-drop').style.display = "inline-block";
      }
      if(document.getElementById('table-drop')) {
        document.getElementById('table-drop').style.display = "none";
      }
      if(document.getElementById('shape-menu')) {
        document.getElementById('shape-menu').style.display = "none";
      }

  }

  triggerFilePicker = (event) => {
    document.getElementById('file-input-menu').click()
  }

  handleTableModal = () => {
     document.getElementById('insert-drop').style.display = "none";
     document.getElementById('table-drop').style.display = "inline-block";
  }

  handleShapeList = () => {
      document.getElementById('insert-drop').style.display = "none";
      document.getElementById('shape-menu').style.display = "block";
  }

  handleWordModal = () => {
    if(document.getElementById('editor-section')) {
        Countable.count(document.getElementById('editor-section'), (counter) => setGlobal({ words: counter.words, paragraphs: counter.paragraphs, sentences: counter.sentences, charactersNoSpaces: counter.characters, charactersSpaces: counter.all }), {
            hardReturns: false,
            stripTags: true,
            ignore: []
        })
    }
      document.getElementById('tools-drop').style.display = "none";
      document.getElementById('dimmer').style.display = 'block';
      document.getElementById('word-modal').style.display = 'block';
  }

  commentModal = () => {
    document.getElementById('tools-drop').style.display = "none";
    document.getElementById('comment-review-modal').style.display = 'block';
  }

  handlePrint = () => {
      const { marginRight, marginLeft, marginTop, marginBottom, orientation } = this.global;
      var cssPagedMedia = (function () {
            var style = document.createElement('style');
            document.head.appendChild(style);
            return function (rule) {
                style.innerHTML = rule;
            };
        }());
        
        cssPagedMedia.size = function (size) {
            cssPagedMedia(`@page {size: ' + ${size} + '; margin-top: ${marginTop}in; margin-bottom: ${marginBottom}in; margin-right: ${marginRight}in; margin-left: ${marginLeft}in;}`);
        };
        
        cssPagedMedia.size(orientation);
      let content = document.getElementById('editor-section').innerHTML;
      let printContainer = document.getElementById('print-container')
      printContainer.innerHTML = content;
      window.print();
  }

  render() {
    const { menuSelection } = this.state;
    return (
    <div className="menu-bar no-print" >
        <ul>
            <li><span onClick={() => this.handleSelection('file')}>File</span>
                {
                    menuSelection === "file" ? 
                    <div style={{display: "none"}} id="file-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={exportAsWord}>Export to DOCX</li>
                            <li onClick={exportAsRTF}>Export to RTF</li>
                            <li onClick={exportAsTXT}>Export to TXT</li>
                            <li className="divider"></li>
                            <li onClick={handlePageSettings}>Page Settings</li>
                            <li onClick={this.handlePrint}>Print</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('edit')}>Edit</span>
                {
                    menuSelection === "edit" ? 
                    <div style={{display: "none"}} id="edit-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={(e) => this.props.onClickBlock(e, 'undo')}>Undo</li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'redo')}>Redo</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('insert')}>Insert</span>
                {
                    menuSelection === "insert" ? 
                    <div style={{display: "none"}} id="insert-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={this.triggerFilePicker}>Image
                                <input onChange={this.props.onImageClick} style={{display: "none"}} type="file" id="file-input-menu" accept=".png, .jpg, .jpeg, .gif" />
                            </li>
                            <li onClick={this.handleTableModal}>Table</li>
                            {/*<li onClick={this.handleShapeList}>Shape</li>*/}
                            <li onClick={(e) => this.props.onClickBlock(e,'hr')}>Horizontal Line</li>
                            <li className="divider"></li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'header')}>Header</li>
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'footer')}>Footer</li>*/}
                            {/*<li>Page Numbers</li>*/}
                            <li onClick={(e) => this.props.onClickBlock(e, 'table-of-contents')}>Table of Contents</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('format')}>Format</span>
                {
                    menuSelection === "format" ? 
                    <div style={{display: "none"}} id="format-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li><span onClick={() => document.getElementById('line-spacing').style.display="inline-block"}>Line Spacing</span>
                                <ul style={{display: "none"}} id="line-spacing">
                                    <li onClick={() => lineHeight('single')}>Single</li>
                                    <li onClick={() => lineHeight('1.50')}>1.50</li>
                                    <li onClick={() => lineHeight('double')}>Double</li>
                                </ul> 
                            </li>
                            <li onClick={handlePageSettings}>Page Settings</li>
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'two-column')}>Two-Column Layout</li>*/}
                            {/*<li onClick={(e) => this.props.onClickBlock(e, 'three-column')}>Three-Column Layout</li>*/}
                            <li className="divider"></li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'clear-formatting')}>Clear Formatting</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
            <li><span onClick={() => this.handleSelection('tools')}>Tools</span>
                {
                    menuSelection === "tools" ? 
                    <div style={{display: "none"}} id="tools-drop" className="dropdown menu-drops">
                        <ul className="dropdown-menu-content">
                            <li onClick={this.handleWordModal}>Word Count</li>
                            {/*<li>Spell Check</li>*/}
                            {/*<li>Grammar</li>*/}
                            <li onClick={this.commentModal}>Review Comments</li>
                            <li onClick={(e) => this.props.onClickBlock(e, 'doc-outline')}>Document Outline</li>
                        </ul>
                    </div> : 
                    <div className="hide" />
                }
            </li>
        </ul>
    </div>
    );
  }
}
