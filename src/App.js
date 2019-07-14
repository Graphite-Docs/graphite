import React, { Component } from 'reactn';
import {BrowserRouter, Route} from 'react-router-dom';
import Documents from './components/docs/views/Documents';
import SingleDoc from './components/docs/views/SingleDoc';
import DeleteDoc from './components/docs/views/DeleteDoc';
import PublicDoc from './components/docs/views/PublicDoc';
import SingleSharedDoc from './components/docs/views/SingleSharedDoc';
import Vault from './components/files/views/Vault.js';
import SingleFile from './components/files/views/SingleFile';
import PublicFile from './components/files/views/PublicFile';
import SingleSharedFile from './components/files/views/SingleSharedFile';
import Forms from './components/forms/views/Forms';
import SingleForm from './components/forms/views/SingleForm';
import PublicForm from './components/forms/views/PublicForm';
import SingleFormResults from './components/forms/views/SingleFormResults';
import Contacts from './components/contacts/views/Contacts';
import SingleContact from './components/contacts/views/SingleContact';
import Settings from './components/pro/views/Settings/Settings';
import Invites from './components/pro/views/Invites/Invites';
import Walkthrough from './components/pro/views/Walkthrough';
import Trial from './components/pro/views/Trial';
import ApiDocs from './components/pro/views/API/ApiDocs';
import SignIn from './components/shared/views/SignIn';
import Skeleton from './components/docs/views/Skeleteon';
import DevTools from './components/shared/views/DevTools';
import { handleProCheck } from './components/pro/helpers/account';
import { loadData } from './components/shared/helpers/accountContext';
import {ToastsContainer, ToastsStore} from 'react-toasts';

class App extends Component {
  async componentDidMount() {
    const { userSession } = this.global;
    document.body.style.background = "#fff";
    if(userSession.isUserSignedIn()) {
      await handleProCheck();
      loadData();
    }
 
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(async () => {
        if(window.location.href.includes('invite')) {
          window.location = `${window.location.origin}/invite/accept`;
        } else {
          window.location = window.location.origin;
        }
      });
    }
  }


  render() {
    const { userSession } = this.global;
    //Check if the user is signed in with Blockstack ID
    if(userSession.isUserSignedIn()) {
      return (
        <div>
        <ToastsContainer store={ToastsStore}/>
         <BrowserRouter>
           <div className="main-container">
             <Route exact path='/' component={Documents} />
             <Route exact path='/documents' component={Documents} />
             <Route exact path="/documents/:id" component={SingleDoc} />
             <Route exact path="/documents/team/:id/:id" component={SingleDoc} />
             <Route exact path="/documents/new/:id" component={SingleDoc} />
             <Route exact path="/documents/delete/:id" component={DeleteDoc} />
             <Route exact path="/shared/docs/:id" component={PublicDoc} />
             <Route exact path="/shared/documents/:id" component={SingleSharedDoc} />
             <Route exact path="/files" component={Vault} />
             <Route exact path="/files/:id" component={SingleFile} />
             <Route exact path="/files/team/:id/:id" component={SingleFile} />
             <Route exact path="/shared/files/:id" component={SingleSharedFile} />
             <Route exact path="/public/files/:id/:id" component={PublicFile} />
             <Route exact path="/contacts" component={Contacts} />
             <Route exact path='/contacts/:id' component={SingleContact} />
             <Route exact path="/forms" component={Forms} />
             <Route exact path='/forms/:id' component={SingleForm} />
             <Route exact path='/team/:id/forms/:id' component={SingleForm} />
             <Route exact path='/forms/new/:id' component={SingleForm} />
             <Route exact path='/team/:id/forms/new/:id' component={SingleForm} />
             <Route exact path='/public/forms/:id/:id' component={PublicForm} />
             <Route exact path='/single/forms/:id/:id/:id' component={PublicForm} />
             <Route exact path='/forms/results/:id' component={SingleFormResults} />
             <Route exact path='/settings' component={Settings} />
             <Route exact path='/trial' component={Trial} />
             <Route exact path='/invite/:id' component={Invites} />
             <Route exact path='/walkthrough' component={Walkthrough} />
             <Route exact path='/pro/api' component={ApiDocs} />
             <Route exact path='/dev/tools' component={DevTools} />
           </div>
         </BrowserRouter>
        </div>
       );
    } else {
      if(window.location.href.includes('?authResponse') || window.location.href.includes('?echoReply')) {
        if(window.location.href.includes('invite')) {
          return (
            <h1>Loading Invite...</h1>
          )
        } else {
          return (
            <BrowserRouter>
              <Skeleton />
            </BrowserRouter>
          )
        }
      } else {
        return (
          <div>
            <BrowserRouter>
              <div className="main-container">
                <Route exact path='/invite/:id' component={Invites} />
                <Route exact path='/' component={SignIn} />
                <Route exact path='/?auth=' component={Skeleton} />
                <Route exact path="/:id" component={SignIn} />
                <Route exact path="/shared/docs/:id" component={PublicDoc} />
                <Route exact path='/pro/api' component={ApiDocs} />
                <Route exact path="/public/files/:id/:id" component={PublicFile} />
                <Route exact path='/public/forms/:id/:id' component={PublicForm} />
                <Route exact path='/single/forms/:id/:id/:id' component={PublicForm} />
              </div>
            </BrowserRouter>
          </div>
         );
      }
    }
  }
}

export default App;
