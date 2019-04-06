import React, { Component } from 'reactn';
import {BrowserRouter, Route} from 'react-router-dom';
import Documents from './components/docs/views/Documents';
import SingleDoc from './components/docs/views/SingleDoc';
import Vault from './components/files/views/Vault.js';
import SingleFile from './components/files/views/SingleFile';
import Forms from './components/forms/views/Forms';
import SingleForm from './components/forms/views/SingleForm';
import SingleFormResults from './components/forms/views/SingleFormResults';
import Contacts from './components/contacts/views/Contacts';
import SingleContact from './components/contacts/views/SingleContact';
import Settings from './components/settings/views/Settings';
import Invites from './components/settings/views/Invites';
import SignIn from './components/shared/views/SignIn';
import Skeleton from './components/docs/views/Skeleteon';
import { User } from 'radiks';
import { loadData } from './components/shared/helpers/accountContext';
import {ToastsContainer, ToastsStore} from 'react-toasts';

class App extends Component {
  async componentDidMount() {
    const { userSession } = this.global;
    if(localStorage.getItem('GROUP_MEMBERSHIPS_STORAGE_KEY')) {
      console.log("Radiks user")
      if(userSession.isUserSignedIn()) {
        loadData();
      }
    } else {
      if(userSession.isUserSignedIn()) {
        await User.createWithCurrentUser();
        loadData();
      }
    }
 
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(async () => {
        window.location = window.location.origin;
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
             <Route exact path="/documents/new/:id" component={SingleDoc} />
             <Route exact path="/files" component={Vault} />
             <Route exact path="/files/:id" component={SingleFile} />
             <Route exact path="/contacts" component={Contacts} />
             <Route exact path='/contacts/:id' component={SingleContact} />
             <Route exact path="/forms" component={Forms} />
             <Route exact path='/forms/:id' component={SingleForm} />
             <Route exact path='/forms/results/:id' component={SingleFormResults} />
             <Route exact path='/settings' component={Settings} />
           </div>
         </BrowserRouter>
        </div>
       );
    } else {
      if(window.location.href.includes('?authResponse')) {
        return (
          <Skeleton />
        )
      } else {
        return (
          <div>
            <BrowserRouter>
              <div className="main-container">
                <Route exact path='/invite/:id' component={Invites} />
                <Route exact path='/' component={SignIn} />
                <Route exact path='/?auth=' component={Skeleton} />
                <Route exact path="/:id" component={SignIn} />
              </div>
            </BrowserRouter>
          </div>
         );
      }
    }
  }
}

export default App;
