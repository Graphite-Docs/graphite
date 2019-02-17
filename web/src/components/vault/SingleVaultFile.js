import React, { Component } from "reactn";
import { Link } from 'react-router-dom';
import PDF from "react-pdf-js";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import HotTable from "react-handsontable";
import {CSVLink} from 'react-csv';
import Loading from '../shared/Loading';
import { Pagination, Container, Image, Icon, Modal, Button } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import { loadUserData } from 'blockstack';
import { handleaddItem } from '../helpers/documents';

const single = require('../helpers/singleVaultFile');


export default class SingleVaultFile extends Component {
  state = {activePage: 1}

  componentDidMount() {
    single.loadSingleVaultFile();
  }

  handlePaginationChange = (e, { activePage }) => this.setState({ activePage }, () => {
    single.handlePrevious(this.state.activePage)
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

  copyLink = () => {
      var copyTextarea = document.querySelector('#shared-vault-link').innerHTML;
      console.log(copyTextarea)


      navigator.clipboard.writeText(copyTextarea).then(function() {
        console.log('Async: Copying to clipboard was successful!');
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });

  }

  render() {
    const { publicVaultFile } = this.global;
    var thisStyle = {
      display: "none"
    };
    const { type, loading, pages, page, name, link, content, grid } = this.global
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
    if(!loading) {
      return (
        <div>
        <MainMenu style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/vault'}><Icon style={{color:"fff"}} name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            {name.length > 14 ? name.substring(0,17).toUpperCase() +"..." : name.toUpperCase()}
          </MainMenu.Item>

          {type.includes("image") ? (
            <MainMenu.Item>
              <a style={{color:"#fff"}} href={link} download={name}>
                <Icon style={{color:"#fff"}} name="cloud download" />
              </a>
            </MainMenu.Item>
          ) : type.includes("video") ? (
            <MainMenu.Item>
              <a style={{color:"#fff"}} href={link} download={name}>
                <Icon style={{color:"#fff"}} name="cloud download" />
              </a>
            </MainMenu.Item>
          ) : type.includes("application/pdf") ? (
            <MainMenu.Item>
              <a style={{cursor: 'pointer', color: "#fff"}}
                onClick={single.downloadPDF}
                title={name}
              >
                <Icon style={{color:"#fff"}} name="cloud download" />
              </a>
              {JSON.parse(localStorage.getItem('authProvider')) === 'uPort' ? <li className='hide' /> : <a onClick={() => single.signWithBlockusign(window.location.href.split('vault/')[1])} style={{marginLeft: "20px", cursor: "pointer"}}>
                <img style={{height: "30px"}} src='https://blockusign.co/assets/imgs/blockusignLogoSvg.svg' alt='blockusign' /><span style={{marginLeft: "5px", color: "#fff", position: "relative", top: "-7px"}}>Sign with Blockusign</span>
              </a>}
            </MainMenu.Item>
          ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
            <MainMenu.Item>
              <a
                onClick={single.downloadPDF}
                title={name}
                style={{color:"#fff"}}
              >
                <Icon name="cloud download" />
              </a>
            </MainMenu.Item>
          ) : type.includes("sheet")|| type.includes("csv") ? (
            <MainMenu.Item>
              <CSVLink style={{color:"#fff"}} data={cells} filename={name + '.csv'} ><Icon style={{color:"fff"}} name="cloud download" /></CSVLink>
            </MainMenu.Item>
          ) : type.includes('html') ?
          <MainMenu.Item>
            <a style={{color: "#fff"}} href={link} download={name}><Icon style={{color:"fff"}} name="cloud download" /></a>
          </MainMenu.Item> :
           (
            <MainMenu.Item />
          )}
          <MainMenu.Item>
            <Modal trigger={<a><Icon style={{cursor: "pointer", color: "#fff"}} name='linkify' /></a>}>
              <Modal.Header>Create a Public Link</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <SemanticHeader>Public Link</SemanticHeader>
                  <p>By generating a public link, you will be saving an unencrypted copy of your file. Only those will the link can access it.</p>
                  {
                    publicVaultFile ?
                    <Button style={{ borderRadius: "0" }} onClick={single.stopSharingPubVaultFile} color="red">Stop Sharing Publicly</Button> :
                    <Button style={{ borderRadius: "0" }} onClick={single.shareVaultFile} color="green">Generate Public Link</Button>
                  }
                  <div style={{marginTop: "15px"}}>
                    {
                      publicVaultFile ?
                      <div><a id='shared-vault-link' href={window.location.origin + '/public/vault/' + loadUserData().username + '/' + window.location.href.split('vault/')[1]} target='_blank' style={{wordWrap:"break-word"}}>{ window.location.origin + '/public/vault/' + loadUserData().username + '/' + window.location.href.split('vault/')[1]}</a><Icon onClick={this.copyLink} style={{marginLeft: "10px", cursor: "pointer"}} name='copy outline' /></div> :
                      <div className='hide' />
                    }
                  </div>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </MainMenu.Item>
          {type.includes("word") ? (
            <MainMenu.Item>
              <a style={{color: "#fff", cursor: "pointer"}} onClick={handleaddItem}>
                Edit in Documents
              </a>
            </MainMenu.Item>
          ) :  (
            <MainMenu.Item />
          )}

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
        <Loading />
      )
    }

  }
}
