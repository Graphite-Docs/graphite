import { combineReducers } from 'redux';
import alerts from './alert';
import auth from './auth';
import docs from './docs';
import profile from './profile';

export default combineReducers({
  alerts, 
  auth, docs, 
  profile
});