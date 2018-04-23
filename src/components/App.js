import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Profile from './Profile';
import AppPage from './AppPage';
import Main from './documents/Main';
import Doc from './documents/Document';
import TestDoc from './documents/TestDoc';
import SingleDoc from './documents/SingleDoc';
import DeleteDoc from './documents/DeleteDoc';
import Blog from './documents/Blog';
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
import Conversations from './messages/Conversations';
import ContactsProfile from './messages/ContactsProfile';
import SingleConversation from './messages/SingleConversation';
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
import {
  isSignInPending,
  loadUserData,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';
const Config = require('Config');

export default class App extends Component {

  handleSignIn(e) {
    e.preventDefault();
    redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    console.log(loadUserData());
    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    return (
      <div>
      <BrowserRouter>
          <div className="main-container">

            <Route exact path="/" component={AppPage} />
            <Route exact path="/documents" component={Main} />
            <Route exact path="/documents/blog" component={Blog} />
            <Route exact path="/test" component={TestDoc} />
            <Route exact path="/documents/doc/new" component={Doc} />
            <Route exact path="/documents/doc/:id" component={TestDoc} />
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
            <Route exact path="/conversations" component={Conversations} />
            <Route exact path="/contacts/profile/:id" component={ContactsProfile} />
            <Route exact path="/contacts/delete/:id" component={DeleteContact} />
            <Route exact path="/contacts/conversations/:id" component={SingleConversation} />
            <Route exact path="/vault" component={MainVault} />
            <Route exact path="/vault/new/file" component={NewVaultFile} />
            <Route exact path="/vault/:id" component={SingleVaultFile} />
            <Route exact path="/vault/delete/:id" component={DeleteVaultFile} />
            <Route exact path="/shared-vault" component={SharedVault} />
            <Route exact path="/vault/shared/:id" component={SharedVaultCollection} />
            <Route exact path="/vault/single/shared/:id" component={SingleSharedFile} />
            <Route exact path="/publicdoc" component={PublicDoc} />
          </div>
        </BrowserRouter>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }
}
