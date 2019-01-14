import React, { Component } from "react";
import { Image, Icon, Modal, Input, Button, Message, List } from 'semantic-ui-react';
import {Menu as MainMenu} from 'semantic-ui-react';
import Loading from '../Loading';
import Menu from './Menu';
import SocketEditor from './editor/SocketEditor';
import MDEditor from '../MDEditor';
// import Html from 'slate-html-serializer';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class SingleDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactToShareWith: "",
      modalOpen: false,
    }
  }

  componentDidMount() {
    this.props.initialDocLoad();
  } //end of componentDidMount

  render() {
    const { markdown, displayMessage, userRole, teamDoc, avatars, rtc, mediumConnected, graphitePro, loading, save, autoSave, contacts, hideStealthy, title, singleDocIsPublic, readOnly, gaiaLink, team} = this.props;

    let teamList;
    if(team) {
      teamList = team;
    } else {
      teamList = []
    }
    let uniqueAva = avatars.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index)
    // let words ;
    // if(content) {
    //   words = wordcount(html.serialize(content).replace(/<(?:.|\n)*?>/gm, ''));
    // } else {
    //   words = 0;
    // }
    // const stealthy = (hideStealthy) ? "hide" : "";

    let docFlex;
    if(hideStealthy === true) {
      docFlex = "test-doc-card";
    } else {
      docFlex = "test-with-module";
    }

    if(!loading) {
      return (
        <div>

        <MainMenu className='item-menu' style={{ borderRadius: "0", background: "#282828", color: "#fff" }}>
          <MainMenu.Item onClick={this.props.handleBack}>
            <Icon name='arrow left' />
          </MainMenu.Item>
          <MainMenu.Item>
          {
            title
            ?
            (title.length > 15 ? title.substring(0,15)+"..." : title)
            :
            "Title here..."
          }
          <Modal
            trigger={<a style={{ cursor: "pointer", color: "#fff"}}  onClick={() => this.setState({ modalOpen: true})}><Icon style={{marginLeft: "10px"}} name='edit outline' /></a> }
            closeIcon
            open={this.state.modalOpen}
            closeOnEscape={true}
            closeOnDimmerClick={true}
            onClose={() => this.setState({ modalOpen: false})}
            >
            <Modal.Header>Edit Document Title</Modal.Header>
            <Modal.Content>
              <Modal.Description>

                {
                  title === "Untitled" ?
                  <div>
                  Title <br/>
                  <Input
                    placeholder="Give it a title"
                    type="text"
                    value=""
                    onChange={this.props.handleTitleChange}
                  />
                  </div>
                  :
                  <div>
                  Title<br/>
                  <Input
                    placeholder="Title"
                    type="text"
                    value={title}
                    onChange={this.props.handleTitleChange}
                  />
                  <Button onClick={() => this.setState({ modalOpen: false })} style={{ borderRadius: "0"}} secondary>Save</Button>
                  </div>
                }
              </Modal.Description>
            </Modal.Content>
          </Modal>
          </MainMenu.Item>
          <MainMenu.Item>
            {autoSave}
          </MainMenu.Item>
          <MainMenu.Menu position='right'>
            <MainMenu.Item>
            <ul className="avatar-ul">
              {
                uniqueAva ? uniqueAva.length < 4 ? uniqueAva.map(img => {
                  let image;
                  if(img.image) {
                    image = img.image[0].contentUrl;
                  } else {
                    image = avatarFallbackImage
                  }
                  return(
                      <li key={img.name} className="avatar-li"><span className="hidden-span">{img.name}</span>
                      <Image src={image} avatar className='shared-avatar circle' /></li>
                  )
                })
                 :
                 <li id="ava-length">
                  {uniqueAva.length}
                 </li> :
                 <li className='hide' />
              }
              </ul>
            </MainMenu.Item>
            {/*<MainMenu.Item>
              <Image className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/>
            </MainMenu.Item>*/}
          </MainMenu.Menu>
          </MainMenu>
          <Menu
            downloadDoc={this.props.downloadDoc}
            handleaddItem={this.props.handleaddItem}
            formatSpacing={this.props.formatSpacing}
            print={this.props.print}
            modalOpen={this.state.modalOpen}
            handleTitleChange={this.props.handleTitleChange}
            handleNewContact={this.props.handleNewContact}
            sharedInfoSingleDocRTC={this.props.sharedInfoSingleDocRTC}
            sharedInfoSingleDocStatic={this.props.sharedInfoSingleDocStatic}
            results={this.props.results}
            shareToTeam={this.props.shareToTeam}
            sharePublicly={this.props.sharePublicly}
            toggleReadOnly={this.props.toggleReadOnly}
            stopSharing={this.props.stopSharing}
            changeEditor={this.props.changeEditor}
            setVersion={this.props.setVersion}
            markdown={markdown}
            versions={this.props.versions}
            versionModal={this.props.versionModal}
            rtc={rtc}
            singleDocIsPublic={singleDocIsPublic}
            readOnly={readOnly}
            gaiaLink={gaiaLink}
            teamList={teamList}
            contacts={contacts}
            title={title}
            graphitePro={graphitePro}
            teamDoc={teamDoc}
            userRole={userRole}
            mediumConnected={mediumConnected}
          />

          <div id='ava-modal'>
            <List>
            {
              uniqueAva.map(img => {
                let image;
                if(img.image) {
                  image = img.image[0].contentUrl;
                } else {
                  image = avatarFallbackImage
                }
                return(
                  <List.Item key={img.name}>
                    <Image avatar src={image} />
                    <List.Content>
                      <List.Header>{img.name}</List.Header>
                    </List.Content>
                  </List.Item>
                )
              })
            }
            </List>
          </div>

          {displayMessage ?
            <Message
              style={{borderRadius: "0", background: "#282828", bottom: "200px", color: "#fff"}}
              header='This user has not yet logged into Graphite'
              content='Ask them to log in first so that you can share encrypted files.'
            /> :
            null
          }

          <div className="test-docs">
            <div className={docFlex}>
              <div className="double-space doc-margin">

                <p className="hide">
                  document access: <span>&nbsp;</span>
                  {
                    (singleDocIsPublic === true) ?
                    <span style={{backgroundColor: "green", color: "white"}}>public</span>
                    :
                    <span style={{backgroundColor: "blue", color: "white"}}>private</span>
                  }
                </p>

              <div>
              {
                markdown ?
                <MDEditor
                  markdownContent={this.props.markdownContent}
                  handleMDChange={this.props.handleMDChange}
                /> :
                <div>
                  <div>
                      <SocketEditor
                        content={this.props.content}
                        value={this.props.content}
                        applyOperations={this.props.applyOperations}
                        hasMark={this.props.hasMark}
                        onKeyDown={this.props.onKeyDown}
                        onClickMark={this.props.onClickMark}
                        handleChange={this.props.handleChange}
                        loadSingleVaultFile={this.props.loadSingleVaultFile}
                        docLoaded={this.props.docLoaded}
                        idToLoad={this.props.idToLoad}
                        handleVaultDrop={this.props.handleVaultDrop}
                        versions={this.props.versions}
                        revertTo={this.props.revertTo}
                        link={this.props.link}
                        files={this.props.files}
                        file={this.props.file}
                        myTimeline={this.props.myTimeline}
                        timelineTitle={this.props.timelineTitle}
                        timelineEvents={this.props.timelineEvents}
                        handleAddNewTimelineEvent={this.props.handleAddNewTimelineEvent}
                        handleTimelineSave={this.props.handleTimelineSave}
                        timelineTitleMediaUrl={this.props.timelineTitleMediaUrl}
                        timelineTitleMediaCaption={this.props.timelineTitleMediaCaption}
                        timelineTitleMediaCredit={this.props.timelineTitleMediaCredit}
                        timelineTitleTextHeadline={this.props.timelineTitleTextHeadline}
                        timelineTitleTextText={this.props.timelineTitleTextText}
                        timelineEventMediaUrl={this.props.timelineEventMediaUrl}
                        timelineEventMediaCaption={this.props.timelineEventMediaCaption}
                        timelineEventMediaCredit={this.props.timelineEventMediaCredit}
                        timelineEventStartMonth={this.props.timelineEventStartMonth}
                        timelineEventStartDay={this.props.timelineEventStartDay}
                        timelineEventStartYear={this.props.timelineEventStartYear}
                        timelineEventTextHeadline={this.props.timelineEventTextHeadline}
                        timelineEventTextText={this.props.timelineEventTextText}
                        handleTimelineTitleTextText={this.props.handleTimelineTitleTextText}
                        handleTimelineTitleTextHeadline={this.props.handleTimelineTitleTextHeadline}
                        handleTimelineTitleMediaUrl={this.props.handleTimelineTitleMediaUrl}
                        handleTimelineTitleMediaCredit={this.props.handleTimelineTitleMediaCredit}
                        handleTimelineTitleMediaCaption={this.props.handleTimelineTitleMediaCaption}
                        handleTimelineEventMediaUrl={this.props.handleTimelineEventMediaUrl}
                        handleTimelineEventMediaCaption={this.props.handleTimelineEventMediaCaption}
                        handleTimelineEventMediaCredit={this.props.handleTimelineEventMediaCredit}
                        handleTimelineEventTextText={this.props.handleTimelineEventTextText}
                        handleTimelineEventTextHeadline={this.props.handleTimelineEventTextHeadline}
                        handleTimelineEventStartDay={this.props.handleTimelineEventStartDay}
                        handleTimelineEventStartYear={this.props.handleTimelineEventStartYear}
                        handleTimelineEventStartMonth={this.props.handleTimelineEventStartMonth}
                        handleUpdateTimelineTitle={this.props.handleUpdateTimelineTitle}
                      />
                  </div>
                </div>
              }
              </div>

              <div style={{ float: "right", margin: "40px"}} className="right-align wordcounter">
                <p className="wordcount">
                  {this.props.wordCount} words
                </p>
              </div>
              <div className={save}></div>
            </div>
          </div>
        </div>
      </div>
    );

    } else {
      return(
        <Loading />
      )
    }
}
}
