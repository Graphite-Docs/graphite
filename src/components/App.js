import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Profile from './Profile';
import AppPage from './AppPage';
import Signin from './Signin';
import Collections from './documents/Collections';
import TestDoc from './documents/TestDoc';
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
// import MainProject from './projects/MainProject';
// import SingleProject from './projects/SingleProject';
// import MainJournalism from './journalism/MainJournalism';
// import SingleJournoDoc from './journalism/SingleJournoDoc';
// import EditorAdmin from './journalism/EditorAdmin';
import Export from './Export';
import PublicDoc from './PublicDoc';
// import MainGraphiteScreen from './graphite/MainGraphiteScreen';
// import AccountSettings from './graphite/AccountSettings';
// import DeleteClient from './graphite/DeleteClient';
import Integrations from './Integrations';
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
  print
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
  saveDocsStealthy,
  saveIntegrations
} from './helpers/integrations';
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
      singleDocIsPublic: false,
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
      userRole: "",
      accountSettings: "",
      teamCount: 0,
      documentId: "",
      userToLoadFrom: "",
      idToLoad: "",
      view: false,
      docLoaded: false,
      lastUpdated: "",
      yjsConnected: false
    }
  }

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
    this.saveDocsStealthy = saveDocsStealthy.bind(this);
    this.autoSave = autoSave.bind(this);
    this.saveSingleDocCollection = saveSingleDocCollection.bind(this);
    this.componentDidMountData = componentDidMountData.bind(this);
    this.loadMyFile = loadMyFile.bind(this);
    this.print = print.bind(this);
    this.handleStealthy = handleStealthy.bind(this);
    this.saveIntegrations = saveIntegrations.bind(this);

    //PublicDoc Components
    this.fetchData = fetchData.bind(this);
    this.loadDoc = loadDoc.bind(this);
    this.handlePubChange = handlePubChange.bind(this);
    this.handlePubTitleChange = handlePubTitleChange.bind(this);
    this.loadInitial = loadInitial.bind(this);
    isUserSignedIn() ? this.loadIntegrations() : console.log("");
    isUserSignedIn() ?  this.loadDocs() : loadUserData();
  }

  componentDidMount() {
    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    isUserSignedIn() ? savePubKey() : console.log("");
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
      content, gaiaLink, sharedWith, lastUpdated, idToLoad, docLoaded, singleDocIsPublic, yjsConnected
    } = this.state;

    return (
      <div>
      { !isUserSignedIn() && !window.location.pathname.indexOf("shared") ?
        <Signin handleSignIn={ this.handleSignIn } />
        :
        <BrowserRouter>
            <div className="main-container">
              <Route exact path="/" render={(props) =>
                    <AppPage {...props}
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
                  singleDocIsPublic={singleDocIsPublic}
                  idToLoad={idToLoad}
                  yjsConnected={yjsConnected}
                />
              }/>
              <Route exact path="/shared/docs/:id" render={(location, match, props) =>
                <PublicDoc
                  handlePubTitleChange={this.handlePubTitleChange}
                  handlePubChange={this.handlePubChange}
                  loadInitial={this.loadInitial}
                  title={title}
                  lastUpdated={lastUpdated}
                  idToLoad={idToLoad}
                  docLoaded={docLoaded}
                  content={content}
                />
              }/>
              <Route exact path="/documents/doc/delete/:id" component={DeleteDoc} />
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
              <Route exact path="/integrations" component={Integrations} />
            </div>
          </BrowserRouter>
      }
      </div>
    );
  }

}

// <Route exact path="/projects" component={MainProject} />
// <Route exact path="/projects/:id" component={SingleProject} />
// <Route exact path="/journalism" component={MainJournalism} />
// <Route exact path="/journalism/:id" component={SingleJournoDoc} />
// <Route exact path="/journalism-admin" component={EditorAdmin} />
// <Route exact path="/admin" component={MainGraphiteScreen} />
// <Route exact path="/admin/settings" component={AccountSettings} />
// <Route exact path="/admin/delete/:id" component={DeleteClient} />
