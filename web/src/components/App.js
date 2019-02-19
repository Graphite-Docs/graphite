import React, { Component, setGlobal } from 'reactn';
import { BrowserRouter, Route } from 'react-router-dom';
import AppPage from './shared/AppPage';
import Signin from './shared/Signin';
import Collections from './documents/Collections';
import SingleDoc from './documents/SingleDoc';
import SingleRTCDoc from './documents/SingleRTCDoc';
import SharedCollection from './documents/SharedCollection';
import SharedDocs from './documents/SharedDocs';
import SharedSheets from './sheets/SharedSheets';
import MainSheets from './sheets/MainSheets';
import SingleSheet from './sheets/SingleSheet';
import SharedSheetsCollection from './sheets/SharedSheetsCollection';
import SentSheetsCollection from './sheets/SentSheetsCollection';
import SingleSharedSheet from './sheets/SingleSharedSheet';
import Contacts from './contacts/Contacts';
import VaultCollection from './vault/VaultCollection';
import PublicVault from './vault/PublicVault';
import SingleVaultFile from './vault/SingleVaultFile';
import SharedVault from './vault/SharedVault';
import SharedVaultCollection from './vault/SharedVaultCollection';
import SingleSharedFile from './vault/SingleSharedFile';
import PublicDoc from './documents/PublicDoc';
import ios from '../images/ios.png';
import {
  savePubKey
} from './helpers/encryptionHelpers';
import {
  isUserSignedIn
} from 'blockstack';
import {
  loadDocs,
} from './helpers/helpers';
const Config = require('Config');

export default class App extends Component {

  componentDidMount() {
    if(JSON.parse(localStorage.getItem('authProvider'))) {
      setGlobal({ signedIn: true })
    }

    const { signedIn } = this.global;
    console.log(signedIn);
    signedIn && localStorage.getItem('storageProvider') ? loadDocs() : console.log("not logged in");
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test( userAgent );
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode() && !localStorage.getItem('showInstallMessage')) {
      setGlobal({ showInstallMessage: true });
      localStorage.setItem('showInstallMessage', false);
      setTimeout(localStorage.getItem('showInstallMessage'), 10000);
    }

    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    isUserSignedIn() ? savePubKey() : console.log('not blockstack user');
  }

  dismiss = () => {
    localStorage.setItem('showInstallMessage', false);
    setGlobal({showInstallMessage: false});
  }

  render() {
    const { signedIn } = this.global;
    return (
      <div>
      {
        !signedIn && !window.location.pathname.indexOf("shared") ?
        <Signin handleSignIn={ this.handleSignIn } />
        :
        <BrowserRouter>
            <div className="main-container">
              {
                this.global.showInstallMessage ?
                <div className="ios-install">
                  <p>Install Graphite to your home screen. Tap <img className="ios-share-icon" src={ios} alt="ios share icon" /> then choose "Add to homescreen". <span className="dismiss-ios"><a onClick={this.dismiss}>Dismiss</a></span></p>
                </div>  :
                <div className="hide" />
              }
              <Route exact path="/" component={AppPage} />
              <Route exact path="/documents" component={Collections} />
              <Route exact path="/documents/doc/:id" component={SingleDoc} />
              <Route exact path="/shared/docs/:id/:id/:id/:id" component={PublicDoc} />
              <Route exact path="/contacts" component={Contacts}/>
              <Route exact path="/shared-docs" component={SharedDocs} />
              <Route exact path="/documents/shared/:id" component={SharedCollection} />
              <Route exact path="/documents/single/shared/:id/:id" component={SingleRTCDoc} />
              <Route exact path="/vault" component={VaultCollection} />
              <Route exact path="/vault/:id" component={SingleVaultFile} />
              <Route exact path="/shared-vault" component={SharedVault} />
              <Route exact path="/vault/shared/:id" component={SharedVaultCollection} />
              <Route exact path="/vault/single/shared/:id/:id" component={SingleSharedFile} />
              <Route exact path="/public/vault/:id/:id" component={PublicVault} />
              <Route exact path="/sheets" component={MainSheets} />
              <Route exact path="/sheets/sheet/:id" component={SingleSheet} />
              <Route exact path="/sheets/shared/:id" component={SharedSheetsCollection} />
              <Route exact path="/sheets/sent/:id" component={SentSheetsCollection} />
              <Route exact path="/sheets/single/shared/:id/:id" component={SingleSharedSheet} />
              <Route exact path="/shared-sheets" component={SharedSheets} />
              {/*
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
                  loading={loading}
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
              <Route exact path="/teams/:id/:id" render={(location, match, props) =>
                <SubTeams {...props}
                  addTeammate={this.addTeammate}
                  clearNewTeammate={this.clearNewTeammate}
                  handleTeammateEmail={this.handleTeammateEmail}
                  handleTeammateRole={this.handleTeammateRole}
                  handleTeammateName={this.handleTeammateName}
                  testingDeleteAll={this.testingDeleteAll}
                  teammateToDelete={this.teammateToDelete}
                  updateTeammate={this.updateTeammate}
                  loadTeams={this.loadTeams}
                  handleTeamNameChange={this.handleTeamNameChange}
                  saveNewTeamInfo={this.saveNewTeamInfo}
                  createMember={this.createMember}
                  teams={teams}
                  teamName={teamName}
                  loading={loading}
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

              <Route exact path="/teams" render={(location, match, props) =>
                <Teams {...props}
                  addTeammate={this.addTeammate}
                  clearNewTeammate={this.clearNewTeammate}
                  handleTeammateEmail={this.handleTeammateEmail}
                  handleTeammateRole={this.handleTeammateRole}
                  handleTeammateName={this.handleTeammateName}
                  testingDeleteAll={this.testingDeleteAll}
                  teammateToDelete={this.teammateToDelete}
                  updateTeammate={this.updateTeammate}
                  loadTeams={this.loadTeams}
                  handleTeamNameChange={this.handleTeamNameChange}
                  saveNewTeamInfo={this.saveNewTeamInfo}
                  createTeam={this.createTeam}
                  postToSharedBucket={this.postToSharedBucket}
                  getData={this.getData}
                  createMember={this.createMember}
                  teams={teams}
                  teamName={teamName}
                  loading={loading}
                  peopleList={peopleList}
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
                  loading={loading}
                />
              }/>
              <Route exact path="/export" render={(location, match, props) =>
                <Export {...props}
                  sheets={sheets}
                  value={value}
                  files={files}
                  contacts={contacts}
                  loading={loading}
                />
              }/>
              <Route exact path="/explorer" render={(location, match, props) =>
                <Explorer {...props}
                  loading={loading}
                />
              }/>
              <Route path="/file-explorer" render={(location, match, props) =>
                <SingleExplorerFile {...props}
                  loading={loading}
                  handleRestore={this.handleRestore}
                />
              }/>*/}
            </div>
          </BrowserRouter>
      }
      </div>
    );
  }

}
