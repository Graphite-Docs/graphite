import { PROFILE_ERROR, PROFILE_LOADED, CLEAR_PROFILE, PROFILE_UPDATED } from '../actions/types';

const initialState = {
  profile: null, 
  loading: true
};

export default function( state = initialState, action) {
  const { type, payload } = action;
  switch(type) {
    case PROFILE_ERROR: 
    case CLEAR_PROFILE: 
      return {
        ...state, 
        profile: null, 
        loading: false
      }
    case PROFILE_LOADED:
    case PROFILE_UPDATED:  
      return {
        ...state, 
        profile: payload, 
        loading: false
      }
    default: 
      return state;
  }
}