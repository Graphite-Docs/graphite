import { SET_ORG_SELECTOR, SET_ORG_DATA, SELECT_ORG } from '../actions/types';

const initialState = {
  organizations: [], 
  orgSelector: false,
  selectedOrg: {},
  loading: true
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ORG_DATA:
      return {
        ...state,
        organizations: payload,
        loading: false,
      };
    case SET_ORG_SELECTOR:
      return {
        ...state,
        orgSelector: payload,
        loading: false,
      };
    case SELECT_ORG: 
      return {
        ...state, 
        selectedOrg: payload, 
        loading: false
      }
    default:
      return state;
  }
}