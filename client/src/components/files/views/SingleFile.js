import React, { Component, setGlobal } from "reactn";
import { Link } from 'react-router-dom';
import PDF from "react-pdf-js";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import HotTable from "react-handsontable";
import {CSVLink} from 'react-csv';
import FileSkeleton from './FileSkeleton';
import { Input, Pagination, Container, Image, Icon, Modal, Button, Item, Accordion, Dropdown } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
// import { handleaddItem } from '../../docs/helpers/singleDoc';

const single = require('../helpers/singleVaultFile');

export default class SingleVaultFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0, 
      activePage: 1 
    }
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  componentDidMount() {
    single.loadSingleVaultFile(window.location.href.split('files/')[1]);
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
    const { proOrgInfo, graphitePro, teamListModalOpen, teamShare, singleFile, type, loading, pages, page, name, link, singleFileContent, grid, userSession } = this.global;
    const { activeIndex } = this.state;
    const teamList = proOrgInfo.teams;
    var thisStyle = {
      display: "none"
    };
    let sharedBy = userSession.loadUserData().username;
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
        <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
          <MainMenu.Item>
            <Link style={{color: "#fff"}} to={'/files'}><Icon style={{color:"fff"}} name='arrow left' /></Link>
          </MainMenu.Item>
          <MainMenu.Item style={{color: "#fff"}}>
            <Input placeholder="Give it a title" value={name} onChange={single.handleName} type="text"/> 
          </MainMenu.Item>

          {type.includes("image") ? (
            <MainMenu.Item>
              <a style={{color:"#fff"}} href={singleFile.link} download={name}>
                <Icon style={{color:"#fff"}} name="cloud download" />
              </a>
            </MainMenu.Item>
          ) : type.includes("video") ? (
            <MainMenu.Item>
              <a style={{color:"#fff"}} href={singleFile.link} download={name}>
                <Icon style={{color:"#fff"}} name="cloud download" />
              </a>
            </MainMenu.Item>
          ) : type.includes("application/pdf") ? (
            <MainMenu.Item>
              <button className="link-button" style={{cursor: 'pointer', color: "#fff"}}
                onClick={single.downloadPDF}
                title={name}
              >
                <Icon style={{color:"#fff"}} name="cloud download" />
              </button>
              <button className="link-button" onClick={() => single.signWithBlockusign(window.location.href.split('files/')[1])} style={{marginLeft: "20px", cursor: "pointer"}}>
                <img style={{height: "30px"}} src='https://blockusign.co/assets/imgs/blockusignLogoSvg.svg' alt='blockusign' /><span style={{marginLeft: "5px", color: "#fff", position: "relative", top: "-7px"}}>Sign with Blockusign</span>
              </button>
            </MainMenu.Item>
          ) : type.includes("word") || type.includes("rtf") || type.includes("text/plain") ? (
            <MainMenu.Item>
              <button
                className="link-button"
                onClick={single.downloadPDF}
                title={name}
                style={{color:"#fff"}}
              >
                <Icon name="cloud download" />
              </button>
            </MainMenu.Item>
          ) : type.includes("sheet")|| type.includes("csv") ? (
            <MainMenu.Item>
              <CSVLink style={{color:"#fff"}} data={cells} filename={name + '.csv'} ><Icon style={{color:"fff"}} name="cloud download" /></CSVLink>
            </MainMenu.Item>
          ) : type.includes('html') ?
          <MainMenu.Item>
            <a style={{color: "#fff"}} href={singleFile.link} download={name}><Icon style={{color:"fff"}} name="cloud download" /></a>
          </MainMenu.Item> :
           (
            <MainMenu.Item />
          )}
          <MainMenu.Item>
            <Dropdown style={{color: "#fff"}} icon='share alternate' simple>
              <Dropdown.Menu>
                {
                  graphitePro ?
                  <Dropdown.Item>
                    <Modal 
                    open={teamListModalOpen}
                    onClose={() => setGlobal({ teamListModalOpen: false})}
                    closeIcon style={{borderRadius: "0"}}
                    trigger={<button onClick={() => setGlobal({ teamListModalOpen: true})} className='link-button'>Share With Team</button>}
                    >
                    <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share With Team</Modal.Header>
                    <Modal.Content>
                      <Modal.Description>
                        <p>By sharing with your entire team, each teammate will have immediate access to the document and will be able to collaborate in real-time.</p>
                        <p>For reference, you can see your list of teammates by expanding each team below.</p>
                        <Item.Group divided>
                        {teamList.map(team => {
                            return (
                                <Item className="contact-search" key={team.id}>
                                <Item.Content verticalAlign='middle'>
                                <Accordion>
                                  <Accordion.Title active={activeIndex === team.id} index={team.id} onClick={this.handleClick}>
                                    <Icon name='dropdown' />
                                    {`${team.name} (${team.users.length} members)`}
                                  </Accordion.Title>
                                  <Accordion.Content active={activeIndex === team.id}>
                                    {
                                      team.users.map(user => {
                                        return (
                                          <p key={user.username}>
                                            {user.username}
                                          </p>
                                        )
                                      })
                                    }
                                  </Accordion.Content>
                                </Accordion>
                                <br/>
                                {
                                  teamShare === false ? 
                                  <Button style={{float: "right", borderRadius: "0px"}} secondary onClick={() => single.shareWithTeam({teamId: team.id, teamName: team.name, initialShare: true})}>Share</Button> : 
                                  <div className="hide" />
                                }
                                </Item.Content>
                                </Item>
                                )
                              }
                            )
                        }
                        </Item.Group>
                        {teamShare === false ? <div className="hide" /> : <Button style={{borderRadius: "0"}}>Sharing...</Button>}
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                  </Dropdown.Item> 
                   : 
                  <Dropdown.Item className="hide" />
                }
                <Dropdown.Item>
                  <Modal closeIcon trigger={<button className="link-button">Create Public Link</button>}>
                    <Modal.Header>Create a Public Link</Modal.Header>
                    <Modal.Content>
                      <Modal.Description>
                        <SemanticHeader>Public Link</SemanticHeader>
                        <p>By generating a public link, you will be saving an unencrypted copy of your file. Only those will the link can access it.</p>
                        {
                          singleFile.publicVaultFile ?
                          <Button style={{ borderRadius: "0" }} onClick={single.stopSharingPubVaultFile} color="red">Stop Sharing Publicly</Button> :
                          <Button style={{ borderRadius: "0" }} onClick={single.shareVaultFile} color="green">Generate Public Link</Button>
                        }
                        <div style={{marginTop: "15px"}}>
                          {
                            singleFile.publicVaultFile && sharedBy ?
                            <div><a id='shared-vault-link' href={window.location.origin + '/public/files/' + sharedBy + '/' + window.location.href.split('files/')[1]} target='_blank' rel="noopener noreferrer" style={{wordWrap:"break-word"}}>{ window.location.origin + '/public/files/' + sharedBy + '/' + window.location.href.split('files/')[1]}</a><Icon onClick={this.copyLink} style={{marginLeft: "10px", cursor: "pointer"}} name='copy outline' /></div> :
                            <div className='hide' />
                          }
                        </div>
                      </Modal.Description>
                    </Modal.Content>
                  </Modal>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </MainMenu.Item>
          {type.includes("word") ? (
            <MainMenu.Item>
              <button className="link-button" style={{color: "#fff", cursor: "pointer"}} onClick={single.addToDocs}>
                Add to Documents
              </button>
            </MainMenu.Item>
          ) :  (
            <MainMenu.Item />
          )}

          </MainMenu>
            <div style={{marginTop: "75px", marginBottom: "45px"}}>
              <div className="">
                <div>
                  {type.includes("image") ? (
                    <div style={{maxWidth: "85%", margin: "auto"}}>
                      <Image style={{maxWidth: "65%", margin: "auto"}} src={singleFile.link} />
                    </div>
                  ) : type.includes("pdf") ? (
                    <Container>
                    <div className="center-align container">
                      <div className="single-file-div">
                        <PDF
                          className="card"
                          file={singleFile.link}
                          onDocumentComplete={single.onDocumentComplete}
                          onPageComplete={single.onPageComplete}
                          page={page}
                          style={{marginBottom: "45px"}}
                        />
                        {pagination}
                        <button
                          id="dwnldLnk"
                          download={name}
                          className="hide link-button"
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
                              __html: singleFileContent
                            }}
                          />
                        </div>
                        <button
                          id="dwnldLnk"
                          download={name}
                          style={thisStyle}
                          className="hide link-button"
                        >Hide</button>
                      </Container>
                    </div>
                  ) : type.includes("video") ? (
                    <Container>
                    <div className="single-file-div">
                      <div className="center-align container">
                        <Player playsInline src={singleFile.link} />
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
                      <div dangerouslySetInnerHTML={{ __html: window.atob(singleFile.link.split('base64,')[1])  }} />
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
        <FileSkeleton />
      )
    }

  }
}

