import React, { Component } from "react";

import PDF from "react-pdf-js";
import { Player } from "video-react";
import HotTable from "react-handsontable";


export default class SingleVaultFile extends Component {

  componentDidMount() {
    window.$('.materialboxed').materialbox();
    this.props.loadSingleVaultFile();
  }

  renderPagination(page, pages) {
    let previousButton = (
      <li className="previous" onClick={this.props.handlePrevious}>
        <a>
          <i className="fa fa-arrow-left" /> Previous
        </a>
      </li>
    );
    if (page === 1) {
      previousButton = (
        <li className="previous disabled">
          <a>
            <i className="fa fa-arrow-left" /> Previous
          </a>
        </li>
      );
    }
    let nextButton = (
      <li className="next" onClick={this.props.handleNext}>
        <a>
          Next <i className="fa fa-arrow-right" />
        </a>
      </li>
    );
    if (page === pages) {
      nextButton = (
        <li className="next disabled">
          <a>
            Next <i className="fa fa-arrow-right" />
          </a>
        </li>
      );
    }
    return (
      <nav>
        <ul className="pager">
          {previousButton}
          {nextButton}
        </ul>
      </nav>
    );
  }

  render() {
    console.log(this.props.link)
    window.$('.materialboxed').materialbox();
    var thisStyle = {
      display: "none"
    };
    const { type, loading, show, shareModal, contacts, pages, page, name, link, content, grid } = this.props
    let pagination = null;
    if (pages) {
      pagination = this.renderPagination(page, pages);
    }
    return (
      <div>
        <div className="navbar-fixed toolbar">
          <nav className="toolbar-nav">
            <div className="nav-wrapper">
              <a href="/vault" className="brand-logo left">
                <i className="material-icons small-brand">arrow_back</i>
              </a>

              <ul className="left toolbar-menu">
                <li>
                  <a className="small-menu">{name.length > 14 ? name.substring(0,17).toUpperCase() +"..." : name.toUpperCase()}</a>
                </li>
                {type.includes("image") ? (
                  <li>
                    <a href={link} download={name}>
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("video") ? (
                  <li>
                    <a href={link} download={name}>
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("application/pdf") ? (
                  <li>
                    <a
                      onClick={this.props.downloadPDF}
                      title={name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                  <li>
                    <a
                      onClick={this.props.downloadPDF}
                      title={name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : type.includes("sheet")|| type.includes("csv") ? (
                  <li>
                    <a
                      onClick={this.props.downloadPDF}
                      title={name}
                    >
                      <i className="material-icons">cloud_download</i>
                    </a>
                  </li>
                ) : (
                  <li />
                )}
                {/*<li>
                  <a onClick={this.shareModal}>
                    <i className="material-icons">share</i>
                  </a>
                </li>*/}
                {type.includes("word") ? (
                  <li>
                    <a onClick={this.props.handleaddItem}>
                      Edit in Documents
                    </a>
                  </li>
                ) : type.includes("sheet") ? (
                  <li>
                    <a onClick={this.props.handleaddSheet}>
                      Edit in Sheets
                    </a>
                  </li>
                ) : type.includes("csv") ? (
                  <li>
                    <a onClick={this.props.handleaddSheet}>
                      Edit in Sheets
                    </a>
                  </li>
                ) : (
                  <li />
                )}
              </ul>
            </div>
          </nav>
        </div>

        <div className={shareModal}>

          <div id="modal1" className="modal bottom-sheet">
            <div className="modal-content">
              <h4>Share</h4>
              <p>Select from your contacts.</p>
              <div className={show}>
                <button onClick={this.props.hideModal} className="btn grey">Cancel</button>
              </div>
              <div className={show}>
                <div className="container">
                  <h4 className="contacts-share center-align">Your Contacts</h4>
                  <ul className="collection">
                  {contacts.slice(0).reverse().map(contact => {
                      return (
                        <li key={contact.contact}className="collection-item avatar">
                          <a onClick={() => this.setState({ receiverID: contact.contact, confirmAdd: true })}>
                          <p><img src={contact.img} alt="avatar" className="circle" /></p>
                          <span className="title black-text">{contact.contact}</span>
                          </a>
                        </li>
                      )
                    })
                  }
                  </ul>
                </div>
              </div>
            </div>
            <div className={loading}>
              <div className="preloader-wrapper small active">
                <div className="spinner-layer spinner-green-only">
                  <div className="circle-clipper left">
                    <div className="circle"></div>
                  </div><div className="gap-patch">
                    <div className="circle"></div>
                  </div><div className="circle-clipper right">
                    <div className="circle"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

        <div className="container">
          <div className={loading}>
            <div className="file-loading progress">
              <div className="indeterminate" />
            </div>
          </div>
        </div>
        <div className={show}>
          <div className="file-view">
            <div className="">
              <div>
                {type.includes("image") ? (
                  <div className="vault-img single-file-div center-align">
                    <img
                      className="responsive-img materialboxed"
                      src={link}
                      alt={name}
                    />
                  </div>
                ) : type.includes("pdf") ? (
                  <div className="center-align container">
                    <div className="single-file-div">
                      <PDF
                        className="card"
                        file={link}
                        onDocumentComplete={this.props.onDocumentComplete}
                        onPageComplete={this.props.onPageComplete}
                        page={page}
                      />
                      {pagination}
                      <link
                        id="dwnldLnk"
                        download={name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                  <div className="">
                    <div className={loading}>
                      <div className="edit-button">
                        <div className="preloader-wrapper small active">
                          <div className="spinner-layer spinner-green-only">
                            <div className="circle-clipper left">
                              <div className="circle" />
                            </div>
                            <div className="gap-patch">
                              <div className="circle" />
                            </div>
                            <div className="circle-clipper right">
                              <div className="circle" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      <div className="card single-file-doc">
                        <div
                          className="print-view no-edit"
                          dangerouslySetInnerHTML={{
                            __html: content
                          }}
                        />
                      </div>
                      <link
                        id="dwnldLnk"
                        download={name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : type.includes("video") ? (
                  <div className="single-file-div">
                    <div className="center-align container">
                      <Player playsInline src={link} />
                    </div>
                  </div>
                ) : type.includes("sheet") || type.includes("csv") ? (
                  <div>
                    <div className="spreadsheet-table">
                      <HotTable
                        root="hot"
                        settings={{
                          data: grid,
                          readOnly: true,
                          stretchH: "all",
                          manualRowResize: true,
                          manualColumnResize: true,
                          colHeaders: true,
                          rowHeaders: true,
                          colWidths: 100,
                          rowHeights: 30,
                          minCols: 26,
                          minRows: 100,
                          contextMenu: true,
                          formulas: true,
                          columnSorting: true,
                          autoRowSize: true,
                          manualColumnMove: true,
                          manualRowMove: true,
                          ref: "hot",
                          fixedRowsTop: 0,
                          minSpareRows: 1,
                          comments: true
                        }}
                      />

                      <link
                        id="dwnldLnk"
                        download={name}
                        style={thisStyle}
                      />
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
