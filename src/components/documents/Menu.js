import React, { Component } from "react";

export default class Menu extends Component {

  doCommand = (props) => {
    if(props === 'undo') {
      window.document.execCommand('undo')
    } else if(props === 'redo') {
      window.document.execCommand('redo')
    } else if(props === 'copy') {
      console.log('copy')
      window.document.execCommand('copy')
    }
  }

  render() {

    return (

              <div className="cm-e-menu">
                  <ul>
                      <li className="topmenu">
                          <a>file</a>
                          <ul className="submenu">
                              <li><a onClick={this.props.handleaddItem}>New document</a></li>
                              {/*<li><a>Add tag</a></li>*/}
                              <li className="divider-menu"><hr /></li>
                              <li><a className="modal-trigger" href="#editName">rename</a></li>
                              <li><a href={'/documents/doc/delete/'+ window.location.href.split('doc/')[1]}>delete</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li>
                                  <a>Download</a>
                                  <ul className="submenu">
                                      <li><a onClick={() => this.props.downloadDoc('word')}>Microsoft Word (.docx)</a></li>
                                      {/*<li><a onClick={() => this.props.downloadDoc('odt')}>OpenDocument (.odt)</a></li>
                                      <li><a onClick={() => this.props.downloadDoc('rtf')}>Rich Text (.rtf)</a></li>*/}
                                      <li><a onClick={() => this.props.downloadDoc('txt')}>Plain Text (.txt)</a></li>
                                      <li><a onClick={this.props.print}>PDF (.pdf)</a></li>

                                  </ul>
                              </li>
                              <li><a onClick={this.props.print}>Print</a></li>
                          </ul>
                      </li>
                      {/*<li className="topmenu">
                          <a>edit</a>
                          <ul className="submenu">
                              <li><a onClick={() => this.doCommand('undo')}>undo</a></li>
                              <li><a onClick={() => this.doCommand('redo')}>redo</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a onClick={() => this.doCommand('copy')}>copy</a></li>
                              <li><a onClick={() => this.doCommand('cut')}>cut</a></li>
                              <li><a onClick={() => this.doCommand('paste')}>paste</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a onClick={() => this.doCommand('select-all')}>select all</a></li>
                          </ul>
                      </li>*/}
                      {/*<li className="topmenu">
                          <a>view</a>
                          <ul className="submenu">
                              <li><a>hide tabs</a></li>
                              <li><a>hide menu</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a>wordwrap</a></li>
                              <li><a>line numbers</a></li>
                              <li><a>fullscreen</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a>highlight active line</a></li>
                              <li>
                                  <a>sidebar</a>
                                  <ul className="submenu">
                                      <li><a>hide sidebar</a></li>
                                  </ul>
                              </li>
                          </ul>
                      </li>*/}
                      { this.props.mediumConnected ? Object.keys(this.props.mediumConnected).length > 0 && this.props.graphitePro ?
                        <li className="topmenu">
                          <a>Export</a>
                          <ul className="submenu">
                            <li><a>Post to Medium</a></li>
                          </ul>
                        </li> :
                        <li className="hide"></li> : <li className="hide"></li>
                      }


                      <li className="topmenu">
                      <a>Share</a>
                      <ul className="submenu">
                          <li><a className="modal-trigger" href="#publicModal">Public link</a></li>
                          {
                            this.props.graphitePro ? <li><a className="modal-trigger" href="#teamShare">Share with team</a></li> : <li className="hide"></li>
                          }
                          {
                            this.props.teamDoc && this.props.userRole === "User" ? <li className="hide"></li> : <li><a className="modal-trigger" href="#contactsModal">Share with contact</a></li>
                          }
                      </ul>
                      </li>
                      <li className="topmenu">
                          <a>Info</a>
                          <ul className="submenu">
                              <li><a href="https://github.com/Graphite-Docs/graphite" target="_blank" rel="noopener noreferrer">github</a></li>
                              <li><a href="https://graphitedocs.com/about" target="_blank" rel="noopener noreferrer">about</a></li>
                              <li className="divider-menu"><hr /></li>
                              <li><a href="https://github.com/Graphite-Docs/graphite/issues" target="_blank" rel="noopener noreferrer">bug report</a></li>
                          </ul>
                      </li>
                      <li className="topmenu">
                          <a>Page settings</a>
                          <ul className="submenu">
                              <li><a onClick={() => this.props.formatSpacing('single')}>Single Space</a></li>
                              <li onClick={() => this.props.formatSpacing('double')}><a>Double Space</a></li>
                          </ul>
                      </li>
                  </ul>
              </div>
    );
  }
}
