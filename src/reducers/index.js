import { combineReducers } from 'redux';
import alerts from './alert';
import auth from './auth';
import docs from './docs';
import profile from './profile';
import lang from './lang';

export default combineReducers({
  alerts, 
  auth, docs, 
  profile, 
  lang
});