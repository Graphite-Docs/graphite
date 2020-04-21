import { LANG_SET } from '../actions/types';

const initialState = 'English';

export default function( state = initialState, action) {
  const { type, payload } = action;
  switch(type) {
    case LANG_SET: 
      return payload;
    default: 
      return state;
  }
}