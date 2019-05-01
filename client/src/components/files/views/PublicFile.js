import React, { Component } from 'reactn';
import {Image, Container, Pagination} from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import FileSkeleton from './FileSkeleton';
import PDF from "react-pdf-js";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import HotTable from "react-handsontable";
import {CSVLink} from 'react-csv';
import logoSquare from '../../../assets/images/graphite-mark.svg';
import { loadPublicVault } from '../helpers/publicVault';
const single = require('../helpers/singleVaultFile');

export default class PublicFile extends Component {

  componentDidMount() {
    loadPublicVault();
    setInterval(this.loadAgain, 3000)
  }

  loadAgain = () => {
    if(this.refs.player) {
        const { player } = this.refs.player.getState();

        if(player.paused) {
        loadPublicVault()
        }
    } 
  }

  renderPagination(page, pages) {
    return(
      <Pagination
        style={{position: "fixed", bottom: "20px", left: "18%", marginTop: "25px"}}
        defaultActivePage={page} totalPages={pages}
        onPageChange={this.handlePaginationChange}
      />
    )
  }

  render() {
      console.log("public")
    const { type, loading, pages, page, name, link, content, grid, pubVaultShared } = this.global;
    var thisStyle = {
      display: "none"
    };

    let pagination = null;
    if (pages) {
      pagination = this.renderPagination(page, pages);
    }
    let cells;
    if(grid) {
      cells = grid;
    } else {
      cells = [];
    }

    if(loading) {
      return (
        <FileSkeleton />
      )
    } else {
      if(pubVaultShared) {
        return (
          <div>
            <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
              <MainMenu.Item>
                <Image src={logoSquare} style={{ maxHeight: "50px" }} />
              </MainMenu.Item>
              {type.includes("image") ? (
                <MainMenu.Item>
                  <a style={{color:"#fff"}} href={link} download={name}>
                    Download
                  </a>
                </MainMenu.Item>
              ) : type.includes("video") ? (
                <MainMenu.Item>
                  <a style={{color:"#fff"}} href={link} download={name}>
                    Download
                  </a>
                </MainMenu.Item>
              ) : type.includes("application/pdf") ? (
                <MainMenu.Item>
                  <button className="link-button" style={{cursor: 'pointer', color: "#fff"}}
                    onClick={single.downloadPDF}
                    title={name}
                  >
                    Download
                  </button>
                </MainMenu.Item>
              ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                <MainMenu.Item>
                  <button className="link-button"
                    onClick={single.downloadPDF}
                    title={name}
                    style={{color:"#fff"}}
                  >
                    Download
                  </button>
                </MainMenu.Item>
              ) : type.includes("sheet")|| type.includes("csv") ? (
                <MainMenu.Item>
                  <CSVLink style={{color:"#fff"}} data={cells} filename={name + '.csv'} >Download</CSVLink>
                </MainMenu.Item>
              ) : type.includes('html') ?
              <MainMenu.Item>
                <a style={{color: "#fff"}} href={link} download={name}>Download</a>
              </MainMenu.Item> :
               (
                <MainMenu.Item />
              )}
              <MainMenu.Menu position='right'>
              <MainMenu.Item>
                <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
              </MainMenu.Item>
              </MainMenu.Menu>
            </MainMenu>
            <div style={{marginTop: "75px"}}>
              <div className="">
                <div>
                  {type.includes("image") ? (
                    <div style={{maxWidth: "85%", margin: "auto"}}>
                      <Image src={link} fluid />
                    </div>
                  ) : type.includes("pdf") ? (
                    <Container>
                    <div className="center-align container">
                      <div className="single-file-div">
                        <PDF
                          className="card"
                          file={link}
                          onDocumentComplete={single.onDocumentComplete}
                          onPageComplete={single.onPageComplete}
                          page={page}
                          style={{marginBottom: "45px"}}
                        />
                        {pagination}
                        <button className="link-button hide"
                          id="dwnldLnk"
                          download={name}
                          style={thisStyle}
                        >download</button>
                      </div>
                    </div>
                    </Container>
                  ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
                    <div className="">
                      <Container>
                        <div className="card single-file-doc">
                          <div
                            className="print-view no-edit"
                            dangerouslySetInnerHTML={{
                              __html: content
                            }}
                          />
                        </div>
                        <button className="link-button hide"
                          id="dwnldLnk"
                          download={name}
                          style={thisStyle}
                        >Hide</button>
                      </Container>
                    </div>
                  ) : type.includes("video") ? (
                    <Container>
                    <div className="single-file-div">
                      <div className="center-align container">
                        <Player ref="player" id='video' playsInline src={link} />
                      </div>
                    </div>
                    </Container>
                  ) : type.includes("sheet") || type.includes("csv") ? (
                    <div>
                      <div className="spreadsheet-table1">
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
                  ) : type.includes('html') ?
                  <div>
                    <div className='html-card html-card-1'>
                      <div dangerouslySetInnerHTML={{ __html: window.atob(link.split('base64,')[1])  }} />
                    </div>
                  </div> :
                  (
                    <div />
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div>
          <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
            <MainMenu.Item>
              <Image src={logoSquare} style={{ maxHeight: "50px" }} />
            </MainMenu.Item>
            <MainMenu.Menu position='right'>
            <MainMenu.Item>
              <a style={{color: "#fff"}} href="http://graphitedocs.com" target="_blank" rel="noopener noreferrer">About Graphite</a>
            </MainMenu.Item>
            </MainMenu.Menu>
          </MainMenu>
            <h1 style={{maxWidth: "85%", margin: "auto", marginTop: "75px", textAlign: "center"}}>This file is no longer being shared.</h1>
          </div>
        )
      }

    }
  }
}