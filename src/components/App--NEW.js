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
import ContactsProfile from './messages/ContactsProfile';
import DeleteContact from './messages/DeleteContact';
import MainVault from './vault/MainVault';
import SingleVaultFile from './vault/SingleVaultFile';
import NewVaultFile from './vault/NewVaultFile';
import DeleteVaultFile from './vault/DeleteVaultFile';
import SharedVault from './vault/SharedVault';
import SharedVaultCollection from './vault/SharedVaultCollection';
import SingleSharedFile from './vault/SingleSharedFile';
import MainProject from './projects/MainProject';
import SingleProject from './projects/SingleProject';
import MainJournalism from './journalism/MainJournalism';
import SingleJournoDoc from './journalism/SingleJournoDoc';
import EditorAdmin from './journalism/EditorAdmin';
import Export from './Export';
import PublicDoc from './PublicDoc';
import MainGraphiteScreen from './graphite/MainGraphiteScreen';
import AccountSettings from './graphite/AccountSettings';
import DeleteClient from './graphite/DeleteClient';
import Yjs from './graphite/Yjs';
import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';
const Config = require('Config');

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // userToLoadFrom: "",
      // idToLoad: "",
      // gaiaLink: "",
      // title: "",
      content: "hiiiiii", //testing passing this to SingleDoc
      currentDocs: [], //getting currentDocs from Collections, via Main
      // words: "",
      // view: false,
      // docLoaded: false
    }
    this.updateParentApp = this.updateParentApp.bind(this);
    this.getCurrentDocs = this.getCurrentDocs.bind(this);
  }

  handleSignIn(e) {
    e.preventDefault();
    redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  handleAppStateChange = event => {
    console.log('handleAppStateChange, event is: ', event)
    // this.setState({ content: event.target.value });
  };

  getCurrentDocs(currentDocs) {
    console.log('getCurrentDocs called in App...., currentDocs is: ', currentDocs)
    console.warn('getCurrentDocs called in App...., typeof currentDocs is: ', typeof currentDocs)
    if (currentDocs.length > 0) {
      console.log('more than 0 currentDoc here!!!!!')
      // this.setState({ currentDocs: currentDocs }); //this should receive an array from Main and setState in App of that array, then access that array in SingleDoc, to match it.
    }
  }

  updateParentApp(updateString) { //this is mostly same as handleChangeInTextEdit
    console.warn('updateParentApp called in Apppppppppppppppppppppppppppppp!!!')
    console.warn('updateParent called in App!!!, updateString is: ', updateString)
    this.setState({ content: updateString });
    // clearTimeout(this.timeout); //why is this being clared before being called? i don't get it.
    // this.timeout = setTimeout(this.handleAutoAdd, 1500)
  }

  render() {
    console.log('Build Date: ', Config.BUILD_DATE_STAMP)
    console.log('Build Time: ', Config.BUILD_TIME_STAMP)
    console.log('App - this.state: ', this.state)
    return (
      <div>
      <BrowserRouter>
          <div className="main-container">

            <Route exact path="/" component={AppPage} />
            {/* <Route exact path="/documents" component={Main} /> */}
            <Route
              exact path="/documents"
              render={props => <Main getCurrentDocs={this.getCurrentDocs} {...props} />}
              />
            <Route exact path="/documents/blog" component={Blog} />
            <Route exact path="/test" component={TestDoc} />
            <Route exact path="/documents/doc/new" component={Doc} />
            {/* <Route
              exact path="/documents/doc/:id"
              component={SingleDoc}
            /> */}
            <Route
              exact path="/documents/doc/:id"
              render={props => <SingleDoc appState={this.state.content} handleAppStateChange={this.handleAppStateChange} {...props} />}
            />


{/* WORKING ON THIS, NEED props.docs in App.... */}
            {/* <Route
              exact path="/documents/doc/:id"
              render={({match}) => {
                const doc = props.docs.find( d => d.id === parseInt(match.params.id, 10)) //need props.docs!!!!
                return
                <div>
                  <SingleDoc
                    appState={this.state.content}
                    handleAppStateChange={this.handleAppStateChange}
                    // {...props}
                  />
                </div>
              }}
            /> */}


{/* example from WordNerds:: */}
            {/* <Route
              path='/stories/:id/edit'
              render={({match}) => {
                const story = props.stories.find( s => s.id === parseInt(match.params.id, 10))
                return <div className="EditStoryForm-blue">
                  <EditStoryForm
                    story={story}
                    replacePlotTitleWithEmoji={props.replacePlotTitleWithEmoji}
                    handleUpdateStory={props.handleUpdateStory}
                    handleDeleteStory={props.handleDeleteStory}
                  />
                </div>
              }} /> */}
              {/* example from WordNerds:: */}

            {/* <Route
              exact path="/shared/docs/:id"
              component={PublicDoc}
            /> */}
            <Route
              exact path="/shared/docs/:id"
              render={props => <PublicDoc updateParentApp={this.updateParentApp} {...props} />}
            />

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
            {/* <Route exact path="/shared/docs/:id" component={PublicDoc} /> */}
            <Route exact path="/projects" component={MainProject} />
            <Route exact path="/projects/:id" component={SingleProject} />
            <Route exact path="/journalism" component={MainJournalism} />
            <Route exact path="/journalism/:id" component={SingleJournoDoc} />
            <Route exact path="/journalism-admin" component={EditorAdmin} />
            <Route exact path="/admin" component={MainGraphiteScreen} />
            <Route exact path="/admin/settings" component={AccountSettings} />
            <Route exact path="/admin/delete/:id" component={DeleteClient} />
            <Route exact path="/admin/yjs" component={Yjs} />
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
