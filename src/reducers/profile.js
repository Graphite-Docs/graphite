import { LOADING, END_LOADING } from '../actions/types';

const initialState = {
  avatar: null,
  profile: null, 
  loading: false
};

export default function( state = initialState, action) {
  const { type } = action;
  switch(type) {
    case LOADING: 
      return {
        ...state, 
        loading: true
      }
    case END_LOADING: 
      return {
        ...state, 
        loading: false
      }
    default: 
      return state;
  }
}