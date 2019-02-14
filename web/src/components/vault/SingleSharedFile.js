import React, { Component } from "react";
import { Link } from 'react-router-dom';
import {CSVLink} from 'react-csv';
import PDF from "react-pdf-js";
import { Player } from "video-react";
import HotTable from "react-handsontable";
import "video-react/dist/video-react.css";
import { Pagination, Container, Image, Icon } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import Loading from '../shared/Loading';



export default class SingleSharedFile extends Component {

  componentDidMount() {
    this.props.loadSingleSharedVault();
  }


  handlePaginationChange = (e, { activePage }) => this.setState({ activePage }, () => {
    this.props.handlePrevious(this.state.activePage)
  })

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
    const { type, loading, pages, page, link, content, grid, name} = this.props;
    var thisStyle = {
      display: "none"
    };
    let pagination = null;
    if (pages) {
      pagination = this.renderPagination(page, pages);
    }

    if(!loading) {
      return (
        <div>
        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/shared-vault'}><Icon name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item>
            {name.length > 14 ? name.substring(0,17).toUpperCase() +"..." : name.toUpperCase()}
          </MainMenu.Item>

          {type.includes("image") ? (
            <MainMenu.Item>
              <a href={link} download={name}>
                <i className="material-icons">cloud_download</i>
              </a>
            </MainMenu.Item>
          ) : type.includes("video") ? (
            <MainMenu.Item>
              <a href={link} download={name}>
                <i className="material-icons">cloud_download</i>
              </a>
            </MainMenu.Item>
          ) : type.includes("application/pdf") ? (
            <MainMenu.Item>
              <a
                onClick={this.props.downloadPDF}
                title={name}
              >
                <i className="material-icons">cloud_download</i>
              </a>
            </MainMenu.Item>
          ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
            <MainMenu.Item>
              <a
                onClick={this.props.downloadPDF}
                title={name}
              >
                <i className="material-icons">cloud_download</i>
              </a>
            </MainMenu.Item>
          ) : type.includes("sheet")|| type.includes("csv") ? (
            <MainMenu.Item>
              <CSVLink data={grid} filename={name + '.csv'} ><i className="material-icons">cloud_download</i></CSVLink>
            </MainMenu.Item>
          ) : (
            <MainMenu.Item />
          )}
          <MainMenu.Item>
          <a style={{color: "#fff"}} onClick={this.props.handleAddToVault}>
            Add to Vault
          </a>
          </MainMenu.Item>
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
                        onDocumentComplete={this.props.onDocumentComplete}
                        onPageComplete={this.props.onPageComplete}
                        page={page}
                        style={{marginBottom: "45px"}}
                      />
                      {pagination}
                      <a
                        id="dwnldLnk"
                        download={name}
                        className="hide"
                        style={thisStyle}
                      >download</a>
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
                      <a
                        id="dwnldLnk"
                        download={name}
                        style={thisStyle}
                        className="hide"
                      >Hide</a>
                    </Container>
                  </div>
                ) : type.includes("video") ? (
                  <Container>
                  <div className="single-file-div">
                    <div className="center-align container">
                      <Player playsInline src={link} />
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
                ) : (
                  <div />
                )}
                </div>
                </div>
                </div>
        </div>


      );
    } else {
      return (
        <Loading />
      )
    }
  }
}
