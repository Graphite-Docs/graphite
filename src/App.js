import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Alerts from './components/Alerts';
import "./App.css";

import PrivateRoute from './components//PrivateRoute';
//  Redux
import { Provider } from "react-redux";
import store from "./store";
//  Actions
import { loadUser } from './actions/auth';
//  Components
import Docs from './components/Docs/Docs';
import SingleDoc from './components/Docs/SingleDoc';
import SharedDoc from './components/Docs/SharedDoc';
import Profile from './components/Profile/Profile';
import Verify from './components/Auth/Verify';
import VerifyPayment from './components/Auth/VerifyPayment';
import Cancel from './components/Billing/Cancel';
import Plans from './components/Billing/Plans';


const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Alerts />
      <Fragment>
        <Router>
          <Fragment>            
            <section>
              <Switch>
                <Route path='/verify' component={Verify} />
                <Route path='/success' component={VerifyPayment} />
                <Route path='/canceled' component={VerifyPayment} />
                <Route path='/shared/link/:id' component={SharedDoc} />
                <PrivateRoute exact path='/' component={Docs} />                  
                <PrivateRoute path='/documents/:id' component={SingleDoc} /> 
                <Route path='/plans' component={Plans} />   {/*Need to implement a separate route check*/}
                <PrivateRoute path='/profile' component={Profile} />            
                <PrivateRoute exact path='/cancel' component={Cancel} />  
              </Switch>
            </section>
          </Fragment>
        </Router>
      </Fragment>
    </Provider>
  )
};

export default App;
