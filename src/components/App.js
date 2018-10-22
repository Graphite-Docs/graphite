import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Profile from './Profile';
import AppPage from './AppPage';
import Signin from './Signin';
import SSO from './SSO';
import Collections from './documents/Collections';
import SingleDoc from './documents/SingleDoc';
import SingleRTCDoc from './documents/SingleRTCDoc';
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
import Contacts from './messages/Contacts';
import ContactsProfile from './messages/ContactsProfile';
import DeleteContact from './messages/DeleteContact';
import VaultCollection from './vault/VaultCollection';
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
import NoUsername from './NoUsername';
import OAUTH from './OAUTH';
import Calendar from './Calendar';
import Forms from './forms/Forms';
import SingleForm from './forms/SingleForm';
import PublicForm from './forms/PublicForm';
import ios from '../images/ios.png';
import {
  savePubKey
} from './helpers/encryptionHelpers';
import {
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
  setDocsPerPage,
  sharedInfoStatic,
  loadTeamDocs
} from './helpers/documents';
import {
  handleChange,
  handleAutoAdd,
  handleTitleChange,
  handleIDChange,
  shareModal,
  hideModal,
  shareDoc,
  sharedInfoSingleDocRTC,
  sharedInfoSingleDocStatic,
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
  shareToTeam,
  initialDocLoad,
  getYjsConnectionStatus,
  toggleReadOnly,
  stealthyChat,
  loadAvatars,
  noCollaboration,
  downloadDoc,
  formatSpacing
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
  slackWebhook,
  completeAuth,
  createMediumPost,
  connectWebhook,
  handleWebhookUrl,
  postToWebhook,
  postHook,
  disconnectWebhooks,
  connectGoogleDocs,
  filterGDocsList,
  fetchGDocs,
  singleGDoc,
  handleAddGDoc,
  importAllGDocs
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
  updateTeammate,
  updateRoleAfterConfirmation
} from './helpers/team';
import {
  saveAll,
  saveAccount,
  saveToTeam,
  checkForLatest,
  setLoadedFile,
  saveToMainAdmin,
  saveMainAccount,
  saveOriginalConfig,
  loadOriginalConfig
} from './helpers/teamsync';
import {
  savePlan,
  savePlanFile,
  loadAccountPlan,
  testingDeleteAll,
  accountDetails,
  loadMainAccount
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
  loadBasicInviteInfo,
  saveInfo
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
import {
  dataLoad,
  postToDB,
  loadAnalytics
} from './helpers/analytics';
import {
  loadFilesCollection,
  filterVaultList,
  handleVaultPageChange,
  handleVaultCheckbox,
  sharedVaultInfo,
  loadSharedVaultCollection,
  loadVaultSingle,
  getVaultCollection,
  vaultShare,
  saveSharedVaultFile,
  saveSingleVaultFile,
  saveVaultCollection,
  sendVaultFile,
  loadSingleVaultTags,
  getVaultCollectionTags,
  setVaultTags,
  handleVaultKeyPress,
  addVaultTagManual,
  saveNewVaultTags,
  saveFullVaultCollectionTags,
  saveSingleVaultFileTags,
  applyVaultFilter,
  filterVaultNow,
  deleteVaultTag,
  clearVaultFilter,
  collabVaultFilter,
  tagVaultFilter,
  dateVaultFilter,
  typeVaultFilter,
  setPagination
} from './helpers/vaultFiles';
import {
  profileLoad,
  fetchContactData
} from './helpers/contactsProfile';
import {
  initialDeleteLoad,
  handleDeleteVaultItem,
  saveVaultDelete,
  saveVaultDeleteTwo
} from './helpers/deleteVaultFile';
import {
  handleVaultDrop,
  saveNewVaultFile,
  saveNewVaultFileTwo
} from './helpers/newVaultFile';
import {
  loadSingleVaultFile,
  onDocumentComplete,
  onPageComplete,
  handlePrevious,
  handleNext,
  downloadPDF,
  handleToDocs,
  handleAddToDocsTwo,
  handleaddSheet,
  handleaddTwoSheet,
  saveToDocs,
  saveToDocsTwo,
  saveToSheets,
  saveToSheetsTwo
} from './helpers/singleVaultFile';
import {
  handleIDChangeVault,
  loadVaultContacts,
  loadSharedVault,
  saveVaultUser,
  loadSingleSharedVault,
  handleAddToVault,
  handleAddToVaultTwo,
  saveNewVaultTwo
} from './helpers/sharedVaultFiles';
import {
  loadContactsCollection,
  addNewContact,
  handleAddContact,
  saveNewContactsFile,
  handleNewContact,
  handleManualAdd,
  manualAdd,
  filterContactsList,
  handleContactsCheckbox,
  setTypes,
  handleContactsKeyPress,
  addTypeManual,
  loadSingleTypes,
  saveNewTypes,
  saveFullCollectionTypes,
  handleContactsPageChange,
  deleteType,
  applyContactsFilter,
  filterContactsNow,
  dateFilterContacts,
  typeFilter,
  clearContactsFilter
} from './helpers/contacts';
import {
  loadSharedRTC,
  handleAddRTC,
  findDoc,
  loadSingleRTC,
  handleAddStatic,
  saveNewSharedFile,
  saveNewSingleSharedDoc
} from './helpers/singleRTC';
import {
  handleAddForm,
  saveForm,
  addQuestion,
  loadSingleForm,
  loadForms,
  updateForm,
  formTitleChange,
  handleQuestionTitle,
  updateQuestion,
  handleHelpText,
  deleteQuestion,
  handleOptionValue,
  addOptions,
  removeOption,
  handleRequired,
  requiredSave,
  publishForm,
  saveNewFormToSheet,
  saveFormToSingleSheet,
  publishPublic,
  deleteForm,
  finalDelete
} from './helpers/forms';
import {
  loadPublicForm,
  postFormResponses
} from './helpers/publicForms';
import work from 'webworkify-webpack';
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
      teamDocs: [],
      sharedDocsCount: 0,
      analytics: [],
      fileCreation: false,
      combined: [],
      filesPerPage: 10,
      filesSelected: [],
      file: "",
      name: "",
      lastModifiedDate: "",
      link: "",
      type: "",
      singleFile: {},
      singleFileTags: [],
      uploaded: "",
      typeList: "hide",
      selectedType: "",
      applyFilter: false,
      filteredVault: [],
      currentVaultPage: 1,
      description: "",
      appsUsed: "",
      conversationUser: "",
      img: "",
      page: 1,
      sharedWithMe: true,
      shareFileIndex: [],
      user: "",
      singleDocIsPublic: false,
      readOnly: false,
      filteredContacts: [],
      add: false,
      results: [],
      newContact: "",
      showFirstLink: false,
      types: [],
      manualResults: {},
      contactsPerPage: 10,
      contactsSelected: [],
      rtc: false,
      avatars: [],
      privateKey: "",
      publicKey: "",
      adminAddress: "",
      adminToken: "",
      tokenRefreshDate: "",
      accountInfo: {},
      originalConfig: {},
      invite: {},
      teamShare: false,
      loadingIndicator: false,
      auditThis: false,
      teamDoc: false,
      isTeamDoc: false,
      webhookUrl: "",
      webhookConnected: false,
      gDocs: [],
      filteredGDocs: [],
      token: "",
      compressed: false,
      importAll: false,
      showInstallMessage: false,
      forms: [],
      singleForm: {},
      formContents: [],
      qIndex: 0,
      questionTitle: "",
      optionValue: "",
      options: [],
      required: false,
      deleteLastOption: false,
      publicForm: {},
      fullFile: "",
      spacing: 2
    }
    this.launchWorker = this.launchWorker.bind(this);
  } //constructor

  componentWillMount() {

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
    this.sharedInfoStatic = sharedInfoStatic.bind(this);
    this.loadTeamDocs = loadTeamDocs.bind(this);

    //Single Doc Component Functions
    this.handleChange = handleChange.bind(this);
    this.handleAutoAdd = handleAutoAdd.bind(this);
    this.handleTitleChange = handleTitleChange.bind(this);
    this.handleIDChange = handleIDChange.bind(this);
    this.shareModal = shareModal.bind(this);
    this.hideModal = hideModal.bind(this);
    this.shareDoc = shareDoc.bind(this);
    this.downloadDoc = downloadDoc.bind(this);
    // this.sharedInfoSingleDoc = sharedInfoSingleDoc.bind(this);
    this.sharedInfoSingleDocRTC = sharedInfoSingleDocRTC.bind(this);
    this.sharedInfoSingleDocStatic = sharedInfoSingleDocStatic.bind(this);
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
    this.getYjsConnectionStatus = getYjsConnectionStatus.bind(this);
    this.initialDocLoad = initialDocLoad.bind(this);
    this.toggleReadOnly = toggleReadOnly.bind(this);
    this.stealthyChat = stealthyChat.bind(this);
    this.loadAvatars = loadAvatars.bind(this);
    this.noCollaboration = noCollaboration.bind(this);
    this.formatSpacing = formatSpacing.bind(this);

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
    this.createMediumPost = createMediumPost.bind(this);

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
    this.handleSlackWebhookUrl = handleSlackWebhookUrl.bind(this);
    this.connectWebhook = connectWebhook.bind(this);
    this.postToWebhook = postToWebhook.bind(this);
    this.postHook = postHook.bind(this);
    this.disconnectWebhooks = disconnectWebhooks.bind(this);
    this.handleWebhookUrl = handleWebhookUrl.bind(this);
    this.connectGoogleDocs = connectGoogleDocs.bind(this);
    this.filterGDocsList = filterGDocsList.bind(this);
    this.fetchGDocs = fetchGDocs.bind(this);
    this.singleGDoc = singleGDoc.bind(this);
    this.handleAddGDoc = handleAddGDoc.bind(this);
    this.importAllGDocs = importAllGDocs.bind(this);

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
    this.updateRoleAfterConfirmation = updateRoleAfterConfirmation.bind(this);
    this.saveToMainAdmin = saveToMainAdmin.bind(this);
    this.saveMainAccount = saveMainAccount.bind(this);
    this.loadOriginalConfig = loadOriginalConfig.bind(this);
    this.saveOriginalConfig = saveOriginalConfig.bind(this);

    // Account Plan
    this.savePlan = savePlan.bind(this);
    this.savePlanFile = savePlanFile.bind(this);
    this.loadAccountPlan = loadAccountPlan.bind(this);
    this.testingDeleteAll = testingDeleteAll.bind(this);
    this.accountDetails = accountDetails.bind(this);
    this.loadMainAccount = loadMainAccount.bind(this);

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
    this.saveInfo = saveInfo.bind(this);

    //Acceptances
    this.confirmAcceptance = confirmAcceptance.bind(this);

    //Audits
    this.postToLog = postToLog.bind(this);

    //Analytics
    this.dataLoad = dataLoad.bind(this);
    this.postToDB = postToDB.bind(this);
    this.loadAnalytics = loadAnalytics.bind(this);

    //Vault
    this.loadFilesCollection = loadFilesCollection.bind(this);
    this.filterVaultList = filterVaultList.bind(this);
    this.handleVaultPageChange = handleVaultPageChange.bind(this);
    this.handleVaultCheckbox = handleVaultCheckbox.bind(this);
    this.sharedVaultInfo = sharedVaultInfo.bind(this);
    this.loadSharedVaultCollection = loadSharedVaultCollection.bind(this);
    this.loadVaultSingle = loadVaultSingle.bind(this);
    this.getVaultCollection = getVaultCollection.bind(this);
    this.vaultShare = vaultShare.bind(this);
    this.saveSharedVaultFile = saveSharedVaultFile.bind(this);
    this.saveSingleVaultFile = saveSingleVaultFile.bind(this);
    this.saveVaultCollection = saveVaultCollection.bind(this);
    this.sendVaultFile = sendVaultFile.bind(this);
    this.loadSingleVaultTags = loadSingleVaultTags.bind(this);
    this.getVaultCollectionTags = getVaultCollectionTags.bind(this);
    this.setVaultTags = setVaultTags.bind(this);
    this.handleVaultKeyPress = handleVaultKeyPress.bind(this);
    this.addVaultTagManual = addVaultTagManual.bind(this);
    this.saveNewVaultTags = saveNewVaultTags.bind(this);
    this.saveFullVaultCollectionTags = saveFullVaultCollectionTags.bind(this);
    this.saveSingleVaultFileTags = saveSingleVaultFileTags.bind(this);
    this.applyVaultFilter = applyVaultFilter.bind(this);
    this.filterVaultNow = filterVaultNow.bind(this);
    this.deleteVaultTag = deleteVaultTag.bind(this);
    this.clearVaultFilter = clearVaultFilter.bind(this);
    this.collabVaultFilter = collabVaultFilter.bind(this);
    this.tagVaultFilter = tagVaultFilter.bind(this);
    this.dateVaultFilter = dateVaultFilter.bind(this);
    this.typeVaultFilter = typeVaultFilter.bind(this);
    this.setPagination = setPagination.bind(this);
    this.initialDeleteLoad = initialDeleteLoad.bind(this);
    this.handleDeleteVaultItem = handleDeleteVaultItem.bind(this);
    this.saveVaultDelete = saveVaultDelete.bind(this);
    this.saveVaultDeleteTwo = saveVaultDeleteTwo.bind(this);
    this.handleVaultDrop = handleVaultDrop.bind(this);
    this.saveNewVaultFile = saveNewVaultFile.bind(this);
    this.saveNewVaultFileTwo = saveNewVaultFileTwo.bind(this);
    this.loadSingleVaultFile = loadSingleVaultFile.bind(this);
    this.onDocumentComplete = onDocumentComplete.bind(this);
    this.onPageComplete = onPageComplete.bind(this);
    this.handlePrevious = handlePrevious.bind(this);
    this.handleNext = handleNext.bind(this);
    this.downloadPDF = downloadPDF.bind(this);
    this.handleToDocs = handleToDocs.bind(this);
    this.handleAddToDocsTwo = handleAddToDocsTwo.bind(this);
    this.handleaddSheet = handleaddSheet.bind(this);
    this.handleaddTwoSheet = handleaddTwoSheet.bind(this);
    this.saveToDocs = saveToDocs.bind(this);
    this.saveToDocsTwo = saveToDocsTwo.bind(this);
    this.saveToSheets = saveToSheets.bind(this);
    this.saveToSheetsTwo = saveToSheetsTwo.bind(this);
    this.handleIDChangeVault = handleIDChangeVault.bind(this);
    this.loadVaultContacts = loadVaultContacts.bind(this);
    this.loadSharedVault = loadSharedVault.bind(this);
    this.saveVaultUser = saveVaultUser.bind(this);
    this.loadSingleSharedVault = loadSingleSharedVault.bind(this);
    this.handleAddToVault = handleAddToVault.bind(this);
    this.handleAddToVaultTwo = handleAddToVaultTwo.bind(this);
    this.saveNewVaultTwo = saveNewVaultTwo.bind(this);

    //Contacts
    this.profileLoad = profileLoad.bind(this);
    this.fetchContactData = fetchContactData.bind(this);
    this.loadContactsCollection = loadContactsCollection.bind(this);
    this.addNewContact = addNewContact.bind(this);
    this.handleAddContact = handleAddContact.bind(this);
    this.saveNewContactsFile = saveNewContactsFile.bind(this);
    this.handleNewContact = handleNewContact.bind(this);
    this.handleManualAdd = handleManualAdd.bind(this);
    this.manualAdd = manualAdd.bind(this);
    this.filterContactsList = filterContactsList.bind(this);
    this.handleContactsCheckbox = handleContactsCheckbox.bind(this);
    this.setTypes = setTypes.bind(this);
    this.handleContactsKeyPress = handleContactsKeyPress.bind(this);
    this.addTypeManual = addTypeManual.bind(this);
    this.loadSingleTypes = loadSingleTypes.bind(this);
    this.saveNewTypes = saveNewTypes.bind(this);
    this.saveFullCollectionTypes = saveFullCollectionTypes.bind(this);
    this.handleContactsPageChange = handleContactsPageChange.bind(this);
    this.deleteType = deleteType.bind(this);
    this.applyContactsFilter = applyContactsFilter.bind(this);
    this.filterContactsNow = filterContactsNow.bind(this);
    this.dateFilterContacts = dateFilterContacts.bind(this);
    this.typeFilter = typeFilter.bind(this);
    this.clearContactsFilter = clearContactsFilter.bind(this);

    //Single rtc
    this.loadSharedRTC = loadSharedRTC.bind(this);
    this.handleAddRTC = handleAddRTC.bind(this);
    this.findDoc = findDoc.bind(this);
    this.loadSingleRTC = loadSingleRTC.bind(this);
    this.handleAddStatic = handleAddStatic.bind(this);
    this.saveNewSharedFile = saveNewSharedFile.bind(this);
    this.saveNewSingleSharedDoc = saveNewSingleSharedDoc.bind(this);
    this.handleQuestionTitle = handleQuestionTitle.bind(this);
    this.updateQuestion = updateQuestion.bind(this);

    //Auth
    this.completeAuth = completeAuth.bind(this);

    //Forms
    this.handleAddForm = handleAddForm.bind(this);
    this.saveForm = saveForm.bind(this);
    this.addQuestion = addQuestion.bind(this);
    this.loadSingleForm = loadSingleForm.bind(this);
    this.loadForms = loadForms.bind(this);
    this.updateForm = updateForm.bind(this);
    this.formTitleChange = formTitleChange.bind(this);
    this.handleHelpText = handleHelpText.bind(this);
    this.deleteQuestion = deleteQuestion.bind(this);
    this.handleOptionValue = handleOptionValue.bind(this);
    this.addOptions = addOptions.bind(this);
    this.removeOption = removeOption.bind(this);
    this.handleRequired = handleRequired.bind(this);
    this.requiredSave = requiredSave.bind(this);
    this.publishForm = publishForm.bind(this);
    this.saveFormToSingleSheet = saveFormToSingleSheet.bind(this);
    this.saveNewFormToSheet = saveNewFormToSheet.bind(this);
    this.publishPublic = publishPublic.bind(this);
    this.loadPublicForm = loadPublicForm.bind(this);
    this.postFormResponses = postFormResponses.bind(this);
    this.deleteForm = deleteForm.bind(this);
    this.finalDelete = finalDelete.bind(this);

    // isUserSignedIn() ? this.loadIntegrations() : console.warn("App componentWillMount - user is not signed in...");
    isUserSignedIn() ?  this.loadDocs() : loadUserData();
    // isUserSignedIn() ? this.loadAccountPlan() : loadUserData();
    // isUserSignedIn() ? this.loadInviteStatus() : loadUserData();
  }

  componentDidMount() {
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test( userAgent );
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode() && !localStorage.getItem('showInstallMessage')) {
      this.setState({ showInstallMessage: true });
      localStorage.setItem('showInstallMessage', false);
      setTimeout(localStorage.getItem('showInstallMessage'), 10000);
    }
    // // this.launchWorker();
    // const ADMIN_ADDRESS = "14zTFZn5NkBtHQgEzKFJA9RyUce9UJaHvv"
    // const ADMIN_AUTH_TOKEN = "eyJwdWJsaWNrZXkiOiIwMzVlODg4YTU4NDc3MGNjMGMyOTZkNDBjNGJhZDI3N2Y5MzA4OTllNjczMzZmYjFmNDdmNTIxNGQ5MDZmODkzNjIiLCJzaWduYXR1cmUiOiIzMDQ0MDIyMDFkZDRiOGIwODNlMDFhMjIwMjM1ZDMzN2U5ZmQ4MmNkY2M5MDY3ZjY0NjhlMmE2NmEyMGVjYWE0MjI0NWFjZmUwMjIwNWRhZDI0MDAwNTliZTE4MTkzNjBhZjZjNTE1MWZmZDg1MGVlY2NlZWFlNzQzNjJiMTU1ZDVmYTMyNWNjYmY4MSJ9"
    //
    // if(loadUserData().username === "khunter.id") {
    //   const gaiaConfigJSON = localStorage.getItem('blockstack-gaia-hub-config')
    //   const gaiaConfig = JSON.parse(gaiaConfigJSON)
    //   gaiaConfig.address = ADMIN_ADDRESS
    //   gaiaConfig.token = ADMIN_AUTH_TOKEN
    //   localStorage.setItem('blockstack-gaia-hub-config', JSON.stringify(gaiaConfig))
    //   setTimeout(this.testing, 300)
    // }

    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    isUserSignedIn() ? savePubKey() : loadUserData();
  }
  launchWorker() {
    if(this.state.contacts.length > 0) {
      let w = work(require.resolve('./worker.js'));
      w.addEventListener('message', event => {
          console.log(event.data);
      });

      w.postMessage(this.state.contacts); // send the worker a message
    } else {
      setTimeout(this.launchWorker, 500)
    }

  }

  // handleSignIn(e) {
  //   e.preventDefault();
  //   redirectToSignIn();
  // }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  dismiss = () => {
    localStorage.setItem('showInstallMessage', false);
    this.setState({showInstallMessage: false});
  }

  render() {
    const {
      value, sheets, contacts, files, pubKey, appliedFilter, dateList, tagList, collaboratorsModal, singleDocTags,
      contactDisplay, loadingTwo, confirmAdd, shareModal, tagModal, currentPage, docsPerPage, loading, redirect, tempDocId,
      filteredValue, activeIndicator, tag, publicShare, remoteStorage, save, autoSave, hideStealthy, revealModule, title,
      content, gaiaLink, sharedWith, idToLoad, docLoaded, yjsConnected, docs, integrations,
      stealthyConnected,stealthyKey, coinsConnected, coinsKey, blockusignKey, blockusignConnected, noteRiotKey, noteRiotConnected,
      mediumConnected, mediumIntegrationToken, graphitePro, slackConnected, team, newTeammateName, newTeammateRole,
      newTeammateEmail, audits, settingsOnboarding, settingsMain, loadingBar, filteredVault, currentVaultPage, deleteState,
      applyFilter, typeList, singleFileTags, tagDownload, filesPerPage, name, username, img, description, show, page,
      type, pages, link, grid, sharedWithMe, shareFileIndex, user, singleDocIsPublic, readOnly,
      manualResults, typesList, typeDownload, typeModal, contactsPerPage, add, filteredContacts, results, newContact,
      showFirstLink, types, checked, rtc, hideButton, avatars, docsSelected, loadingIndicator, userRole, teamDoc,
      webhookConnected, webhookUrl, gDocs, filteredGDocs, importAll, forms, singleForm, formContents, questionTitle,
      optionValue, required, publicForm, fullFile, spacing
    } = this.state;
    return (
      <div>
      { isUserSignedIn() && loadUserData().username === null ?
        <NoUsername
          handleSignIn={this.handleSignIn}
        />
        :
        !isUserSignedIn() && !window.location.pathname.indexOf("shared") ?
        <Signin handleSignIn={ this.handleSignIn } />
        :
        <BrowserRouter>
            <div className="main-container">
              {
                this.state.showInstallMessage ?
                <div className="ios-install">
                  <p>Install Graphite to your home screen. Tap <img className="ios-share-icon" src={ios} alt="ios share icon" /> then choose "Add to homescreen". <span className="dismiss-ios"><a onClick={this.dismiss}>Dismiss</a></span></p>
                </div>  :
                <div className="hide" />
              }
              <Route exact path="/" render={(props) =>
                    <AppPage {...props}
                    postToLog={this.postToLog}
                    value={value}
                    sheets={sheets}
                    contacts={contacts}
                    files={files}
                    pubKey={pubKey}
                    graphitePro={graphitePro}
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
                      sharedInfoStatic={this.sharedInfoStatic}
                      loadTeamDocs={this.loadTeamDocs}
                      docs={docs}
                      graphitePro={graphitePro}
                      rtc={rtc}
                      docsSelected={docsSelected}
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
              <SingleDoc {...props}
                  componentDidMountData={this.componentDidMountData}
                  handleAutoAdd={this.handleAutoAdd}
                  handleChange={this.handleChange}
                  print={this.print}
                  sharePublicly={this.sharePublicly}
                  handleTitleChange={this.handleTitleChange}
                  handleBack={this.handleBack}
                  sharedInfoSingleDocRTC={this.sharedInfoSingleDocRTC}
                  sharedInfoSingleDocStatic={this.sharedInfoSingleDocStatic}
                  handleStealthy={this.handleStealthy}
                  postToMedium={this.postToMedium}
                  shareToTeam={this.shareToTeam}
                  initialDocLoad={this.initialDocLoad}
                  getYjsConnectionStatus={this.getYjsConnectionStatus}
                  toggleReadOnly={this.toggleReadOnly}
                  stopSharing={this.stopSharing}
                  stealthyChat={this.stealthyChat}
                  downloadDoc={this.downloadDoc}
                  handleaddItem={this.handleaddItem}
                  formatSpacing={this.formatSpacing}
                  spacing={spacing}
                  teamDoc={teamDoc}
                  loadingIndicator={loadingIndicator}
                  userRole={userRole}
                  team={team}
                  avatars={avatars}
                  sharedWith={sharedWith}
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
                  docLoaded={docLoaded}
                  idToLoad={idToLoad}
                  yjsConnected={yjsConnected}
                  mediumConnected={mediumConnected}
                  graphitePro={graphitePro}
                  singleDocIsPublic={singleDocIsPublic}
                  readOnly={readOnly}
                  rtc={rtc}
                />
              }/>
              <Route exact path="/shared/docs/:id" render={(location, match, props) =>
                <PublicDoc
                  title={title}
                  content={content}
                  readOnly={readOnly}
                  idToLoad={idToLoad}
                  singleDocIsPublic={singleDocIsPublic}
                  loadInitial={this.loadInitial}
                  fetchData={this.fetchData}
                  loadDoc={this.loadDoc}
                  handlePubTitleChange={this.handlePubTitleChange}
                  docLoaded={docLoaded}
                  readOnlyStateFromSingleDoc={this.state.readOnlyStateFromSingleDoc}
                  singleDocIsPublicFromApp={this.state.singleDocIsPublicFromSingleDoc}
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
              <Route exact path="/documents/single/shared/:id/:id" render={(props) =>
              <SingleRTCDoc {...props}
                  loadSharedRTC={this.loadSharedRTC}
                  handleTitleChange={this.handleTitleChange}
                  handleChange={this.handleChange}
                  handleIDChange={this.handleIDChange}
                  findDoc={this.findDoc}
                  handleAddStatic={this.handleAddStatic}
                  title={title}
                  rtc={rtc}
                  content={content}
                  docLoaded={docLoaded}
                  idToLoad={idToLoad}
                  yjsConnected={yjsConnected}
                  autoSave={autoSave}
                  hideButton={hideButton}
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
              <Route exact path="/contacts" render={(location, match, props) =>
                <Contacts {...props}
                  loadContactsCollection={this.loadContactsCollection}
                  addNewContact={this.addNewContact}
                  handleAddContact={this.handleAddContact}
                  handleNewContact={this.handleNewContact}
                  handleManualAdd={this.handleManualAdd}
                  manualAdd={this.manualAdd}
                  filterContactsList={this.filterContactsList}
                  handleContactsCheckbox={this.handleContactsCheckbox}
                  setTypes={this.setTypes}
                  addTypeManual={this.addTypeManual}
                  loadSingleTypes={this.loadSingleTypes}
                  saveNewTypes={this.saveNewTypes}
                  saveFullCollectionTypes={this.saveFullCollectionTypes}
                  handleContactsPageChange={this.handleContactsPageChange}
                  deleteType={this.deleteType}
                  applyContactsFilter={this.applyContactsFilter}
                  filterContactsNow={this.filterContactsNow}
                  handleContactsKeyPress={this.handleContactsKeyPress}
                  dateFilterContacts={this.dateFilterContacts}
                  typeFilter={this.typeFilter}
                  clearContactsFilter={this.clearContactsFilter}
                  graphitePro={graphitePro}
                  manualResults={manualResults}
                  typesList={typesList}
                  dateList={dateList}
                  appliedFilter={appliedFilter}
                  deleteState={deleteState}
                  typeDownload={typeDownload}
                  loadingTwo={loadingTwo}
                  typeModal={typeModal}
                  currentPage={currentPage}
                  contactsPerPage={contactsPerPage}
                  add={add}
                  filteredContacts={filteredContacts}
                  show={show}
                  loading={loading}
                  results={results}
                  newContact={newContact}
                  showFirstLink={showFirstLink}
                  types={types}
                  activeIndicator={activeIndicator}
                  checked={checked}
                  type={type}
                />
              }/>
              <Route exact path="/contacts/profile/:id" render={(location, match, props) =>
                <ContactsProfile {...props}
                  profileLoad={this.profileLoad}
                  fetchContactData={this.fetchContactData}
                  name={name}
                  username={username}
                  description={description}
                  img={img}
                  graphitePro={graphitePro}
                />
              }/>
              <Route exact path="/contacts/delete/:id" component={DeleteContact} />
              <Route exact path="/vault" render={(props) =>
                <VaultCollection {...props}
                  loadVaultFiles={this.loadVaultFiles}
                  filterVaultList={this.filterVaultList}
                  handleVaultPageChange={this.handleVaultPageChange}
                  handleVaultCheckbox={this.handleVaultCheckbox}
                  sharedVaultInfo={this.sharedVaultInfo}
                  loadSharedVault={this.loadSharedVault}
                  loadVaultSingle={this.loadVaultSingle}
                  getVaultCollection={this.getVaultCollection}
                  vaultShare={this.vaultShare}
                  saveSharedVaultFile={this.saveSharedVaultFile}
                  saveSingleVaultFile={this.saveSingleVaultFile}
                  saveVaultCollection={this.saveVaultCollection}
                  sendVaultFile={this.sendVaultFile}
                  loadSingleVaultTags={this.loadSingleVaultTags}
                  getVaultCollectionTags={this.getVaultCollectionTags}
                  setVaultTags={this.setVaultTags}
                  handleVaultKeyPress={this.handleVaultKeyPress}
                  addVaultTagManual={this.addVaultTagManual}
                  saveNewVaultTags={this.saveNewVaultTags}
                  saveFullVaultCollectionTags={this.saveFullVaultCollectionTags}
                  saveSingleVaultFileTags={this.saveSingleVaultFileTags}
                  applyVaultFilter={this.applyVaultFilter}
                  filterVaultNow={this.filterVaultNow}
                  deleteVaultTag={this.deleteVaultTag}
                  clearVaultFilter={this.clearVaultFilter}
                  collabVaultFilter={this.collabVaultFilter}
                  tagVaultFilter={this.tagVaultFilter}
                  dateVaultFilter={this.dateVaultFilter}
                  typeVaultFilter={this.typeVaultFilter}
                  setPagination={this.setPagination}
                  graphitePro={graphitePro}
                  files={files}
                  filteredVault={filteredVault}
                  deleteState={deleteState}
                  applyFilter={applyFilter}
                  typeList={typeList}
                  collaboratorsModal={collaboratorsModal}
                  tagList={tagList}
                  dateList={dateList}
                  singleFileTags={singleFileTags}
                  tagDownload={tagDownload}
                  confirmAdd={confirmAdd}
                  loadingTwo={loadingTwo}
                  contacts={contacts}
                  contactDisplay={contactDisplay}
                  appliedFilter={appliedFilter}
                  currentPage={currentPage}
                  filesPerPage={filesPerPage}
                  activeIndicator={activeIndicator}
                  tag={tag}
                  currentVaultPage={currentVaultPage}
                />}
              />
              <Route exact path="/vault/new/file" render={(location, match, props) =>
                <NewVaultFile
                  loadFilesCollection={this.loadFilesCollection}
                  handleVaultDrop={this.handleVaultDrop}
                  files={files}
                  show={show}
                  loading={loading}
                  graphitePro={graphitePro}
                />
              }/>
              <Route exact path="/vault/:id" render={(location, match, props) =>
                <SingleVaultFile {...props}
                  loadSingleVaultFile={this.loadSingleVaultFile}
                  onDocumentComplete={this.onDocumentComplete}
                  onPageComplete={this.onPageComplete}
                  handlePrevious={this.handlePrevious}
                  handleNext={this.handleNext}
                  downloadPDF={this.downloadPDF}
                  handleToDocs={this.handleToDocs}
                  handleaddSheet={this.handleaddSheet}
                  page={page}
                  type={type}
                  loading={loading}
                  show={show}
                  shareModal={shareModal}
                  contacts={contacts}
                  pages={pages}
                  name={name}
                  link={link}
                  content={content}
                  grid={grid}
                  graphitePro={graphitePro}
                />
              }/>
              <Route exact path="/vault/delete/:id" render={(location, match, props) =>
                <DeleteVaultFile {...props}
                  initialDeleteLoad={this.initialDeleteLoad}
                  handleDeleteVaultItem={this.handleDeleteVaultItem}
                  name={name}
                  loading={loading}
                  save={save}
                />
              }/>
              <Route exact path="/shared-vault" render={(location, match, props) =>
                <SharedVault {...props}
                  loadVaultContacts={this.loadVaultContacts}
                  handleIDChangeVault={this.handleIDChangeVault}
                  show={show}
                  contacts={contacts}
                  sharedWithMe={sharedWithMe}
                />
              }/>
              <Route exact path="/vault/shared/:id" render={(location, match, props) =>
                <SharedVaultCollection {...props}
                  loadSharedVault={this.loadSharedVault}
                  user={user}
                  shareFileIndex={shareFileIndex}
                />
              }/>
              <Route exact path="/vault/single/shared/:id" render={(location, match, props) =>
                <SingleSharedFile {...props}
                  loadSingleSharedVault={this.loadSingleSharedVault}
                  onDocumentComplete={this.onDocumentComplete}
                  onPageComplete={this.onPageComplete}
                  handlePrevious={this.handlePrevious}
                  handleNext={this.handleNext}
                  downloadPDF={this.downloadPDF}
                  handleAddToVault={this.handleAddToVault}
                  user={user}
                  type={type}
                  loading={loading}
                  show={show}
                  pages={pages}
                  page ={page}
                  link={link}
                  content={content}
                  grid={grid}
                  name={name}
                />
              }/>
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
                  handleWebhookUrl={this.handleWebhookUrl}
                  connectWebhook={this.connectWebhook}
                  disconnectWebhooks={this.disconnectWebhooks}
                  webhookConnected={webhookConnected}
                  webhookUrl={webhookUrl}
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
                  userRole={userRole}
                />
              }/>
              <Route exact path="/integrations/:id" render={(location, match, props) =>
                <OAUTH {...props}
                  connectMedium={this.connectMedium}
                  connectSlack={this.connectSlack}
                  filterGDocsList={this.filterGDocsList}
                  singleGDoc={this.singleGDoc}
                  importAllGDocs={this.importAllGDocs}
                  importAll={importAll}
                  gDocs={gDocs}
                  filteredGDocs={filteredGDocs}
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
                  userRole={userRole}
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
                  loadingIndicator={loadingIndicator}
                />
              }/>
              <Route exact path="/acceptances" render={(location, match, props) =>
                <Acceptances {...props}
                  confirmAcceptance={this.confirmAcceptance}
                  loadingIndicator={loadingIndicator}
                />
              }/>
              <Route exact path="/calendar" render={(location, match, props) =>
                <Calendar {...props}

                />
              }/>
              <Route exact path="/forms" render={(location, match, props) =>
                <Forms {...props}
                  forms={forms}
                  appliedFilter={appliedFilter}
                  loading={loading}
                  graphitePro={graphitePro}
                  docsPerPage={docsPerPage}
                  currentPage={currentPage}
                  handleAddForm={this.handleAddForm}
                  loadForms={this.loadForms}
                  deleteForm={this.deleteForm}
                />
              }/>
              <Route exact path="/forms/form/:id" render={(location, match, props) =>
                <SingleForm {...props}
                  addQuestion={this.addQuestion}
                  loadForms={this.loadForms}
                  formTitleChange={this.formTitleChange}
                  updateForm={this.updateForm}
                  handleQuestionTitle={this.handleQuestionTitle}
                  updateQuestion={this.updateQuestion}
                  handleHelpText={this.handleHelpText}
                  deleteQuestion={this.deleteQuestion}
                  handleOptionValue={this.handleOptionValue}
                  addOptions={this.addOptions}
                  removeOption={this.removeOption}
                  handleRequired={this.handleRequired}
                  requiredSave={this.requiredSave}
                  publishForm={this.publishForm}
                  singleForm={singleForm}
                  formContents={formContents}
                  questionTitle={questionTitle}
                  optionValue={optionValue}
                  required={required}
                  fullFile={fullFile}
                />
              }/>
              <Route exact path="/forms/public/:id" render={(location, match, props) =>
                <PublicForm {...props}
                  loadPublicForm={this.loadPublicForm}
                  postFormResponses={this.postFormResponses}
                  publicForm={publicForm}
                  formContents={formContents}
                />
              }/>
              <Route exact path="/oauth/verify" render={(location, match, props) =>
                <SSO {...props}

                />
              }/>
              <Route exact path="/export" render={(location, match, props) =>
                <Export {...props}
                  sheets={sheets}
                  value={value}
                  files={files}
                  contacts={contacts}
                />
              }/>
            </div>
          </BrowserRouter>
      }
      </div>
    );
  }

}
