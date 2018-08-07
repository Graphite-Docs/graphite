import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Profile from './Profile';
import AppPage from './AppPage';
import Signin from './Signin';
import Collections from './documents/Collections';
import SingleDoc from './documents/SingleDoc';
import DeleteDoc from './documents/DeleteDoc';
import SharedCollection from './documents/SharedCollection';
import SentCollection from './documents/SentCollection';
import SingleSharedDoc from './documents/SingleSharedDoc';
import Admin from './documents/Admin';
import SharedDocs from './documents/SharedDocs';
import SharedSheets from './sheets/SharedSheets';
import MainSheets from './sheets/MainSheets';
import SingleSheet from './sheets/SingleSheet';
import TestSheet from './sheets/TestSheet';
import DeleteSheet from './sheets/DeleteSheet';
import SharedSheetsCollection from './sheets/SharedSheetsCollection';
import SentSheetsCollection from './sheets/SentSheetsCollection';
import SingleSharedSheet from './sheets/SingleSharedSheet';
import MainContacts from './messages/MainContacts';
import ContactsProfile from './messages/ContactsProfile';
import DeleteContact from './messages/DeleteContact';
import MainVault from './vault/MainVault';
import SingleVaultFile from './vault/SingleVaultFile';
import NewVaultFile from './vault/NewVaultFile';
import DeleteVaultFile from './vault/DeleteVaultFile';
import SharedVault from './vault/SharedVault';
import SharedVaultCollection from './vault/SharedVaultCollection';
import SingleSharedFile from './vault/SingleSharedFile';
import Export from './Export';
import PublicDoc from './PublicDoc';
import Integrations from './Integrations';
import Settings from './Settings';
import PaymentSuccess from './PaymentSuccess';
import Invites from './Invites';
import Acceptances from './Acceptances';
import {
  savePubKey
} from './helpers/encryptionHelpers';
import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
  isUserSignedIn,
  loadUserData
} from 'blockstack';
import {
  loadDocs,
  loadSheets,
  loadContacts,
  loadVault
} from './helpers/helpers';
import {
  loadCollection,
  setTags,
  handleKeyPress,
  addTagManual,
  handleaddItem,
  filterList,
  saveNewFile,
  saveNewSingleDoc,
  handlePageChange,
  handleCheckbox,
  sharedInfo,
  loadSharedCollection,
  loadSingle,
  getCollection,
  share,
  saveSharedFile,
  saveSingleFile,
  sendFile,
  loadSingleTags,
  getCollectionTags,
  saveNewTags,
  saveFullCollectionTags,
  saveSingleDocTags,
  saveCollection,
  deleteTag,
  collabFilter,
  tagFilter,
  dateFilter,
  clearFilter,
  setDocsPerPage
} from './helpers/documents';
import {
  handleChange,
  handleAutoAdd,
  handleTitleChange,
  handleIDChange,
  shareModal,
  hideModal,
  shareDoc,
  sharedInfoSingleDoc,
  handleBack,
  sharePublicly,
  savePublic,
  stopSharing,
  saveStop,
  handleAutoSave,
  autoSave,
  saveSingleDocCollection,
  componentDidMountData,
  loadMyFile,
  handleStealthy,
  print,
  shareToTeam
} from './helpers/singleDoc';
import {
  fetchData,
  loadDoc,
  handlePubChange,
  handlePubTitleChange,
  loadInitial
} from './helpers/publicDoc'
import {
  loadIntegrations,
  connectStealthy,
  loadKey,
  loadSharedDocs,
  saveIntegrations,
  connectBlockusign,
  connectCoins,
  connectNoteRiot,
  connectKanstack,
  loadCoinsKey,
  loadBlockusignKey,
  loadKanstackKey,
  loadNoteRiotKey,
  disconnectCoins,
  disconnectKanstack,
  // disconnectNoteRiot,
  disconnectBlockusign,
  disconnectStealthy,
  loadStealthyKeyDisconnect,
  loadCoinsKeyDisconnect,
  loadBlockusignKeyDisconnect,
  loadNoteRiotKeyDisconnect,
  loadKanstackKeyDisconnect,
  saveStealthyIntegration,
  saveCoinsIntegration,
  updateIntegrations
} from './helpers/integrations';
import {
  handleMediumIntegrationToken,
  connectMedium,
  postToMedium,
  disconnectMedium,
  loadMediumToken,
  handleSlackWebhookUrl,
  connectSlack,
  disconnectSlack,
  postToSlack,
  slackWebhook
} from './helpers/traditionalIntegrations';
import {
  handleTeammateName,
  handleTeammateId,
  handleTeammateEmail,
  handleTeammateRole,
  clearNewTeammate,
  addTeammate,
  saveInvite,
  sendInvite,
  updateRole,
  teammateToDelete,
  updateTeammate
} from './helpers/team';
import {
  saveAll,
  saveAccount,
  saveToTeam,
  checkForLatest,
  setLoadedFile
} from './helpers/teamsync';
import {
  savePlan,
  savePlanFile,
  loadAccountPlan,
  testingDeleteAll,
  accountDetails
} from './helpers/accountPlan';
import {
  acceptInvite,
  loadInvite,
  saveBasicInviteInfo,
  inviteInfo,
  loadInviteStatus,
  saveToInviter,
  sendToInviter,
  sendAcceptEmail,
  loadBasicInviteInfo
} from './helpers/invite';
import {
  confirmAcceptance
} from './helpers/acceptance';
import {
  postToLog,
} from './helpers/audits';
import {
  loadDocToDelete,
  handleDeleteDoc,
  saveNewDocFile,
  saveDocFileTwo
} from './helpers/deleteDoc';
const Config = require('Config');
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      sheets: [],
      contacts: [],
      files: [],
      pubKey: "",
      team: [],
      clients: [],
      person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      shareFile: [],
      singleDoc: {},
      filteredValue: [],
      sharedWith: [],
      tempDocId: "",
      redirect: false,
      loading: "",
      migrationLength: 1,
      migrationCount: 0,
      migrationComplete: false,
      migrateTitle: "",
      migrateContent: "",
      migrateID: "",
      migrateUpdated: "",
      migrateWords: "",
      currentPage: 1,
      docsPerPage: 10,
      docsSelected: [],
      activeIndicator: false,
      shareModal: "hide",
      tagModal: "hide",
      receiverID: "",
      confirmAdd: false,
      title: "",
      content: "",
      id: "",
      words: "",
      updated: "",
      tags: "",
      index: "",
      contactDisplay: "",
      loadingTwo: "hide",
      singleDocTags: [],
      tag: "",
      selectedTagId: "",
      deleteState: false,
      sharedCollection: [],
      sharedWithSingle: [],
      collaboratorsModal: "hide",
      tagDownload: false,
      tagList: "hide",
      dateList: "hide",
      selectedDate: "",
      selectedCollab: "",
      selectedTag: "",
      applyFilterNow: false,
      appliedFilter: false,
      tagIndex: "",
      stealthyConnected: false,
      travelstackConnected: false,
      coinsConnected: false,
      docs: [],
      save: "",
      printPreview: false,
      autoSave: "Saved",
      show: "",
      // singleDocIsPublic: false,
      singlePublic: {},
      publicShare: "hide",
      gaiaLink: "",
      hideStealthy: true,
      hideContact: "",
      revealModule: "innerStealthy",
      to: "",
      blogPost: {},
      blogIndex: [],
      blogModal: "hide",
      docFlex: "test-doc-card",
      remoteStorage: false,
      remoteTitle: "",
      remoteContent: "",
      remoteWords: "",
      remoteId: "",
      remoteUpdated: "",
      highlightedText: "",
      selection: "",
      showCommentModal: "hide",
      comments: [],
      commentInput: "",
      notificationCount: 0,
      listComments: "hide",
      reviewSelection: "",
      commentId: "",
      deleteIndex: "",
      send: false,
      integrations: [],
      // integrations: {},
      userRole: "",
      accountSettings: "",
      teamCount: 0,
      documentId: "",
      userToLoadFrom: "",
      idToLoad: "",
      view: false,
      docLoaded: false,
      lastUpdated: "",
      yjsConnected: false,
      stealthyKey: "",
      blockusignConnected: false,
      blockusignKey: "",
      coinsKey: "",
      kanstackConnected: false,
      kanstackKey: "",
      noteRiotConnected: false,
      noteRiotKey: "",
      mediumConnected: false,
      mediumIntegrationToken: "",
      mediumPost: {},
      slackConnected: false,
      slackWebhookUrl: "",
      graphitePro: false,
      newTeammateEmail: "",
      newTeammateName: "",
      newTeammateRole: "",
      ownerBlockstackId: "",
      newTeammateId: "",
      accountDetails: {},
      ownerName: "",
      ownerEmail: "",
      lastPaymentDate: "",
      inviterKey: "",
      inviteDate: "",
      inviter: "",
      inviteeEmail: "",
      inviteeBlockstackId: "",
      inviteeName: "",
      inviteeRole: "",
      inviteeId: "",
      inviteeKey: "",
      inviterEmail: "",
      inviteAccepted: "",
      inviteDetails: {},
      teamMateMostRecent: "",
      count: 0,
      audits: [],
      action: "",
      deleteDoc: false,
      settingsMain: "hide",
      settingsOnboarding: "hide",
      loadingBar: "",
      teamDocs: []
    }
  } //constructor

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
      });
    }
    //Collections Component Functions
    this.loadDocs = loadDocs.bind(this);
    this.loadSheets = loadSheets.bind(this);
    this.loadContacts = loadContacts.bind(this);
    this.loadVault = loadVault.bind(this);
    this.loadCollection = loadCollection.bind(this);
    this.setTags = setTags.bind(this);
    this.handleKeyPress = handleKeyPress.bind(this);
    this.addTagManual = addTagManual.bind(this);
    this.handleaddItem = handleaddItem.bind(this);
    this.filterList = filterList.bind(this);
    this.saveNewFile = saveNewFile.bind(this);
    this.saveNewSingleDoc = saveNewSingleDoc.bind(this);
    this.handlePageChange = handlePageChange.bind(this);
    this.handleCheckbox = handleCheckbox.bind(this);
    this.sharedInfo = sharedInfo.bind(this);
    this.loadSharedCollection = loadSharedCollection.bind(this);
    this.loadSingle = loadSingle.bind(this);
    this.getCollection = getCollection.bind(this);
    this.share = share.bind(this);
    this.saveSharedFile = saveSharedFile.bind(this);
    this.saveSingleFile = saveSingleFile.bind(this);
    this.saveCollection = saveCollection.bind(this);
    this.sendFile = sendFile.bind(this);
    this.loadSingleTags = loadSingleTags.bind(this);
    this.getCollectionTags = getCollectionTags.bind(this);
    this.saveNewTags = saveNewTags.bind(this);
    this.saveFullCollectionTags = saveFullCollectionTags.bind(this);
    this.saveSingleDocTags = saveSingleDocTags.bind(this);
    this.deleteTag = deleteTag.bind(this);
    this.collabFilter = collabFilter.bind(this);
    this.tagFilter = tagFilter.bind(this);
    this.dateFilter = dateFilter.bind(this);
    this.clearFilter = clearFilter.bind(this);
    this.setDocsPerPage = setDocsPerPage.bind(this);

    //Single Doc Component Functions
    this.handleChange = handleChange.bind(this);
    this.handleAutoAdd = handleAutoAdd.bind(this);
    this.handleTitleChange = handleTitleChange.bind(this);
    this.handleIDChange = handleIDChange.bind(this);
    this.shareModal = shareModal.bind(this);
    this.hideModal = hideModal.bind(this);
    this.shareDoc = shareDoc.bind(this);
    this.sharedInfoSingleDoc = sharedInfoSingleDoc.bind(this);
    this.handleBack = handleBack.bind(this); //this is here to resolve auto-save and home button conflicts
    this.sharePublicly = sharePublicly.bind(this);
    this.savePublic = savePublic.bind(this);
    this.stopSharing = stopSharing.bind(this);
    this.saveStop = saveStop.bind(this);
    this.handleAutoSave = handleAutoSave.bind(this);
    this.loadIntegrations = loadIntegrations.bind(this);
    this.connectStealthy = connectStealthy.bind(this);
    this.loadKey = loadKey.bind(this);
    this.loadSharedDocs = loadSharedDocs.bind(this);
    this.autoSave = autoSave.bind(this);
    this.saveSingleDocCollection = saveSingleDocCollection.bind(this);
    this.componentDidMountData = componentDidMountData.bind(this);
    this.loadMyFile = loadMyFile.bind(this);
    this.print = print.bind(this);
    this.handleStealthy = handleStealthy.bind(this);
    this.saveIntegrations = saveIntegrations.bind(this);
    this.shareToTeam = shareToTeam.bind(this);

    //Delete Document
    this.loadDocToDelete = loadDocToDelete.bind(this);
    this.handleDeleteDoc = handleDeleteDoc.bind(this);
    this.saveNewDocFile = saveNewDocFile.bind(this);
    this.saveDocFileTwo = saveDocFileTwo.bind(this);

    //integrations
    this.connectBlockusign = connectBlockusign.bind(this);
    this.connectCoins = connectCoins.bind(this);
    this.connectNoteRiot = connectNoteRiot.bind(this);
    this.connectKanstack = connectKanstack.bind(this);
    this.loadCoinsKey = loadCoinsKey.bind(this);
    this.loadBlockusignKey = loadBlockusignKey.bind(this);
    this.loadNoteRiotKey = loadNoteRiotKey.bind(this);
    this.loadKanstackKey = loadKanstackKey.bind(this);
    this.disconnectCoins = disconnectCoins.bind(this);
    this.disconnectKanstack = disconnectKanstack.bind(this);
    this.disconnectBlockusign = disconnectBlockusign.bind(this);
    this.disconnectStealthy = disconnectStealthy.bind(this);
    this.loadStealthyKeyDisconnect = loadStealthyKeyDisconnect.bind(this);
    this.loadCoinsKeyDisconnect = loadCoinsKeyDisconnect.bind(this);
    this.loadBlockusignKeyDisconnect = loadBlockusignKeyDisconnect.bind(this);
    this.loadNoteRiotKeyDisconnect = loadNoteRiotKeyDisconnect.bind(this);
    this.loadKanstackKeyDisconnect = loadKanstackKeyDisconnect.bind(this);
    this.saveStealthyIntegration = saveStealthyIntegration.bind(this);
    this.saveCoinsIntegration = saveCoinsIntegration.bind(this);
    this.updateIntegrations = updateIntegrations.bind(this);

    //Traditional Integrations
    this.handleMediumIntegrationToken = handleMediumIntegrationToken.bind(this);
    this.connectMedium = connectMedium.bind(this);
    this.postToMedium = postToMedium.bind(this);
    this.disconnectMedium = disconnectMedium.bind(this);
    this.loadMediumToken = loadMediumToken.bind(this);
    this.handleSlackWebhookUrl = handleSlackWebhookUrl.bind(this);
    this.connectSlack = connectSlack.bind(this);
    this.disconnectSlack = disconnectSlack.bind(this);
    this.postToSlack = postToSlack.bind(this);
    this.slackWebhook = slackWebhook.bind(this);

    //PublicDoc Components
    this.fetchData = fetchData.bind(this);
    this.loadDoc = loadDoc.bind(this);
    this.handlePubChange = handlePubChange.bind(this);
    this.handlePubTitleChange = handlePubTitleChange.bind(this);
    this.loadInitial = loadInitial.bind(this);

    //Team
    this.handleTeammateName = handleTeammateName.bind(this);
    this.handleTeammateId = handleTeammateId.bind(this);
    this.handleTeammateEmail = handleTeammateEmail.bind(this);
    this.handleTeammateRole = handleTeammateRole.bind(this);
    this.clearNewTeammate = clearNewTeammate.bind(this);
    this.addTeammate = addTeammate.bind(this);
    this.saveInvite = saveInvite.bind(this);
    this.sendInvite = sendInvite.bind(this);
    this.saveAll = saveAll.bind(this);
    this.saveAccount = saveAccount.bind(this);
    this.updateRole = updateRole.bind(this);
    this.saveToTeam = saveToTeam.bind(this);
    this.checkForLatest = checkForLatest.bind(this);
    this.setLoadedFile = setLoadedFile.bind(this);
    this.teammateToDelete = teammateToDelete.bind(this);
    this.updateTeammate = updateTeammate.bind(this);

    // Account Plan
    this.savePlan = savePlan.bind(this);
    this.savePlanFile = savePlanFile.bind(this);
    this.loadAccountPlan = loadAccountPlan.bind(this);
    this.testingDeleteAll = testingDeleteAll.bind(this);
    this.accountDetails = accountDetails.bind(this);

    //Invites
    this.acceptInvite = acceptInvite.bind(this);
    this.loadInvite = loadInvite.bind(this);
    this.saveBasicInviteInfo = saveBasicInviteInfo.bind(this);
    this.inviteInfo = inviteInfo.bind(this);
    this.loadInviteStatus = loadInviteStatus.bind(this);
    this.saveToInviter = saveToInviter.bind(this);
    this.sendToInviter = sendToInviter.bind(this);
    this.sendAcceptEmail = sendAcceptEmail.bind(this);
    this.loadBasicInviteInfo = loadBasicInviteInfo.bind(this);

    //Acceptances
    this.confirmAcceptance = confirmAcceptance.bind(this);

    //Audits
    this.postToLog = postToLog.bind(this);

    // isUserSignedIn() ? this.loadIntegrations() : console.warn("App componentWillMount - user is not signed in...");
    isUserSignedIn() ?  this.loadDocs() : loadUserData();
    // isUserSignedIn() ? this.loadAccountPlan() : loadUserData();
    // isUserSignedIn() ? this.loadInviteStatus() : loadUserData();
  }

  componentDidMount() {
    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    isUserSignedIn() ? savePubKey() : loadUserData();
  }

  handleSignIn(e) {
    e.preventDefault();
    redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    const {
      value, sheets, contacts, files, pubKey, appliedFilter, dateList, tagList, collaboratorsModal, singleDocTags,
      contactDisplay, loadingTwo, confirmAdd, shareModal, tagModal, currentPage, docsPerPage, loading, redirect, tempDocId,
      filteredValue, activeIndicator, tag, publicShare, remoteStorage, save, autoSave, hideStealthy, revealModule, title,
      content, gaiaLink, sharedWith, idToLoad, docLoaded, yjsConnected, docs, integrations,
      stealthyConnected,stealthyKey, coinsConnected, coinsKey, blockusignKey, blockusignConnected, noteRiotKey, noteRiotConnected,
      mediumConnected, mediumIntegrationToken, graphitePro, slackConnected, team, newTeammateName, newTeammateRole,
      newTeammateEmail, audits, settingsOnboarding, settingsMain, loadingBar
    } = this.state;
    console.log(audits)
    return (
      <div>
      { !isUserSignedIn() && !window.location.pathname.indexOf("shared") ?
        <Signin handleSignIn={ this.handleSignIn } />
        :
        <BrowserRouter>
            <div className="main-container">
              <Route exact path="/" render={(props) =>
                    <AppPage {...props}
                    postToLog={this.postToLog}
                    value={value}
                    sheets={sheets}
                    contacts={contacts}
                    files={files}
                    pubKey={pubKey}
                    />}
              />
              <Route exact path="/documents"
                render={(props) =>
                      <Collections {...props}
                      setTags={this.setTags}
                      handleKeyPress={this.handleKeyPress}
                      addTagManual={this.addTagManual}
                      handleSignOut={this.handleSignOut}
                      handleaddItem={this.handleaddItem}
                      filterList={this.filterList}
                      saveNewFile={this.saveNewFile}
                      saveNewSingleDoc={this.saveNewSingleDoc}
                      handlePageChange={this.handlePageChange}
                      handleCheckbox={this.handleCheckbox}
                      sharedInfo={this.sharedInfo}
                      loadSharedCollection={this.loadSharedCollection}
                      loadSingle={this.loadSingle}
                      getCollection={this.getCollection}
                      share={this.share}
                      saveSharedFile={this.saveSharedFile}
                      saveSingleFile={this.saveSingleFile}
                      saveCollection={this.saveCollection}
                      sendFile={this.sendFile}
                      loadSingleTags={this.loadSingleTags}
                      getCollectionTags={this.getCollectionTags}
                      saveNewTags={this.saveNewTags}
                      saveFullCollectionTags={this.saveFullCollectionTags}
                      saveSingleDocTags={this.saveSingleDocTags}
                      deleteTag={this.deleteTag}
                      collabFilter={this.collabFilter}
                      tagFilter={this.tagFilter}
                      dateFilter={this.dateFilter}
                      clearFilter={this.clearFilter}
                      setDocsPerPage={this.setDocsPerPage}
                      value={value}
                      contacts={contacts}
                      pubKey={pubKey}
                      appliedFilter={appliedFilter}
                      dateList={dateList}
                      tagList={tagList}
                      collaboratorsModal={collaboratorsModal}
                      singleDocTags={singleDocTags}
                      contactDisplay={contactDisplay}
                      loadingTwo={loadingTwo}
                      confirmAdd={confirmAdd}
                      shareModal={shareModal}
                      tagModal={tagModal}
                      currentPage={currentPage}
                      docsPerPage={docsPerPage}
                      loading={loading}
                      redirect={redirect}
                      tempDocId={tempDocId}
                      filteredValue={filteredValue}
                      activeIndicator={activeIndicator}
                      tag={tag}
                      hideStealthy={hideStealthy}
                      />}
              />
              <Route exact path="/documents/doc/:id" render={(props) =>

              //  <TestDoc {...props}
              <SingleDoc {...props}
                  componentDidMountData={this.componentDidMountData}
                  handleAutoAdd={this.handleAutoAdd}
                  handleChange={this.handleChange}
                  print={this.print}
                  sharePublicly={this.sharePublicly}
                  handleTitleChange={this.handleTitleChange}
                  handleBack={this.handleBack}
                  sharedInfoSingleDoc={this.sharedInfoSingleDoc}
                  handleStealthy={this.handleStealthy}
                  postToMedium={this.postToMedium}
                  shareToTeam={this.shareToTeam}
                  publicShare={publicShare}
                  remoteStorage={remoteStorage}
                  loading={loading}
                  autoSave={autoSave}
                  save={save}
                  contacts={contacts}
                  revealModule={revealModule}
                  title={title}
                  content={content}
                  hideStealthy={hideStealthy}
                  gaiaLink={gaiaLink}
                  sharedWith={sharedWith}
                  docLoaded={docLoaded}
                  // singleDocIsPublic={singleDocIsPublic}
                  idToLoad={idToLoad}
                  yjsConnected={yjsConnected}
                  mediumConnected={mediumConnected}
                  graphitePro={graphitePro}
                />
              }/>
              <Route exact path="/shared/docs/:id" render={(location, match, props) =>
                <PublicDoc
                  title={title} //testing...
                  readOnlyStateFromSingleDoc={this.state.readOnlyStateFromSingleDoc} //NOTE: passing this state as prop to PublicDoc, but can move this to a container instead, like PublicDocContainer...
                  singleDocIsPublicFromApp={this.state.singleDocIsPublicFromSingleDoc} //NOTE: passing this state as prop to PublicDoc, but can move this to a container instead, like PublicDocContainer...
                />
              }/>
              <Route exact path="/documents/doc/delete/:id" render={(location, match, props) =>
                <DeleteDoc
                  loadDocToDelete={this.loadDocToDelete}
                  handleDeleteDoc={this.handleDeleteDoc}
                  title={title}
                  content={content}
                  loading={loading}
                  save={save}
                />
              }/>
              <Route exact path="/documents/shared/:id" component={SharedCollection} />
              <Route exact path="/documents/sent/:id" component={SentCollection} />
              <Route exact path="/documents/single/shared/:id" component={SingleSharedDoc} />
              <Route exact path="/admin-docs" component={Admin} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/shared-docs" component={SharedDocs} />
              <Route exact path="/sheets" component={MainSheets} />
              <Route exact path="/sheets/sheet/:id" component={SingleSheet} />
              <Route exact path="/sheets/sheet/delete/:id" component={DeleteSheet} />
              <Route exact path="/sheets/shared/:id" component={SharedSheetsCollection} />
              <Route exact path="/sheets/sent/:id" component={SentSheetsCollection} />
              <Route exact path="/sheets/single/shared/:id" component={SingleSharedSheet} />
              <Route exact path="/testsheet" component={TestSheet} />
              <Route exact path="/shared-sheets" component={SharedSheets} />
              <Route exact path="/export" component={Export} />
              <Route exact path="/contacts" component={MainContacts} />
              <Route exact path="/contacts/profile/:id" component={ContactsProfile} />
              <Route exact path="/contacts/delete/:id" component={DeleteContact} />
              <Route exact path="/vault" component={MainVault} />
              <Route exact path="/vault/new/file" component={NewVaultFile} />
              <Route exact path="/vault/:id" component={SingleVaultFile} />
              <Route exact path="/vault/delete/:id" component={DeleteVaultFile} />
              <Route exact path="/shared-vault" component={SharedVault} />
              <Route exact path="/vault/shared/:id" component={SharedVaultCollection} />
              <Route exact path="/vault/single/shared/:id" component={SingleSharedFile} />
              <Route exact path="/integrations" render={(location, match, props) =>
                <Integrations {...props}
                  loadIntegrations={this.loadIntegrations}
                  connectStealthy={this.connectStealthy}
                  connectCoins={this.connectCoins}
                  connectBlockusign={this.connectBlockusign}
                  connectNoteRiot={this.connectNoteRiot}
                  connectKanstack={this.connectKanstack}
                  disconnectCoins={this.disconnectCoins}
                  disconnectKanstack={this.disconnectKanstack}
                  disconnectNoteRiot={this.disconnectNoteRiot}
                  disconnectStealthy={this.disconnectStealthy}
                  disconnectBlockusign={this.disconnectBlockusign}
                  handleMediumIntegrationToken={this.handleMediumIntegrationToken}
                  connectMedium={this.connectMedium}
                  disconnectMedium={this.disconnectMedium}
                  handleSlackWebhookUrl={this.handleSlackWebhookUrl}
                  connectSlack={this.connectSlack}
                  disconnectSlack={this.disconnectSlack}
                  testingDeleteAll={this.testingDeleteAll}
                  docs={docs}
                  integrations={integrations}
                  stealthyConnected={stealthyConnected}
                  stealthyKey={stealthyKey}
                  coinsConnected={coinsConnected}
                  coinsKey={coinsKey}
                  blockusignConnected={blockusignConnected}
                  blockusignKey={blockusignKey}
                  noteRiotConnected={noteRiotConnected}
                  noteRiotKey={noteRiotKey}
                  mediumConnected={mediumConnected}
                  mediumIntegrationToken={mediumIntegrationToken}
                  slackConnected={slackConnected}
                  graphitePro={graphitePro}
                />
              }/>
              <Route exact path="/settings" render={(location, match, props) =>
                <Settings {...props}
                  addTeammate={this.addTeammate}
                  clearNewTeammate={this.clearNewTeammate}
                  handleTeammateEmail={this.handleTeammateEmail}
                  handleTeammateRole={this.handleTeammateRole}
                  handleTeammateName={this.handleTeammateName}
                  testingDeleteAll={this.testingDeleteAll}
                  teammateToDelete={this.teammateToDelete}
                  updateTeammate={this.updateTeammate}
                  team={team}
                  newTeammateName={newTeammateName}
                  newTeammateRole={newTeammateRole}
                  newTeammateEmail={newTeammateEmail}
                  graphitePro={graphitePro}
                  settingsMain={settingsMain}
                  settingsOnboarding={settingsOnboarding}
                  loadingBar={loadingBar}
                  audits={audits}
                />
              }/>
              <Route exact path="/success" render={(location, match, props) =>
                <PaymentSuccess {...props}
                  savePlan={this.savePlan}
                />
              }/>
              <Route exact path="/invites" render={(location, match, props) =>
                <Invites {...props}
                  acceptInvite={this.acceptInvite}
                  loadInvite={this.loadInvite}
                />
              }/>
              <Route exact path="/acceptances" render={(location, match, props) =>
                <Acceptances {...props}
                  confirmAcceptance={this.confirmAcceptance}
                />
              }/>
            </div>
          </BrowserRouter>
      }
      </div>
    );
  }

}
