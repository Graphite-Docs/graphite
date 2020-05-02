import { CANCEL_ACCOUNT, BILLING_INFO } from '../actions/types';
const initialState = {
  subscriptionEndDate: null, 
  loading: true, 
  cancelled: false
};

export default function( state = initialState, action) {
  const { type, payload } = action;
  switch(type) {
    case CANCEL_ACCOUNT: 
      return {
        ...state, 
        subscriptionEndDate: payload.subscriptionEndDate,
        cancelled: payload.cancelled, 
        loading: payload.loading
      }
    case BILLING_INFO: 
      return {
        ...state, 
        subscriptionEndDate: payload.subscriptionEndDate, 
        loading: false
      }
    default: 
      return state;
  }
}