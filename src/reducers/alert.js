import { SET_ALERT, REMOVE_ALERT } from '../actions/types';
import { toast } from 'react-toastify';

const initialState = [];

export default function( state = initialState, action) {
  const { type, payload } = action;
  switch(type) {
    case SET_ALERT: 
      toast[payload.alertType](payload.msg);
      return [...state, payload];
    case REMOVE_ALERT: 
      return state.filter(alert => alert.id !== payload);
    default: 
      return state;
  }
}