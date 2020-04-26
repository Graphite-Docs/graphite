import {
  NEW_DOC,
  LOAD_DOC,
  LOAD_INDEX,
  DELETE_DOC,
  SAVED_DOC,
  INDEX_ERROR,
  DOC_ERROR,
  SAVING,
  SHARE_LINK,
  LOAD_SHARED_DOC,
  LOADING
} from "../actions/types";

const initialState = {
  documents: [],
  singleDoc: null,
  sharedDoc: null,
  loading: true,
  saving: false,
  newDoc: false,
  shareLink: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case INDEX_ERROR:
      return {
        ...state,
        documents: [],
        loading: false,
      };
    case DOC_ERROR:
      return {
        ...state,
        singleDoc: null,
        loading: false,
      };
    case NEW_DOC:
      return {
        ...state,
        newDoc: true,
        loading: false,
      };
    case LOAD_DOC:
      return {
        ...state,
        singleDoc: payload,
        loading: false,
      };
    case LOAD_SHARED_DOC:
      return {
        ...state,
        sharedDoc: payload,
        loading: false,
      };
    case LOAD_INDEX:
      return {
        ...state,
        documents: payload,
        loading: false,
      };
    case DELETE_DOC:
      return {
        ...state,
        singleDoc: null,
        documents: payload,
        loading: false,
      };
    case SAVING:
      return {
        ...state,
        saving: true,
      };
    case SHARE_LINK:
      return {
        ...state,
        shareLink: payload,
      };
    case SAVED_DOC:
      return {
        ...state,
        singleDoc: payload,
        loading: false,
        saving: false,
      };
    case LOADING: 
      return {
        ...state, 
        loading: true
      }
    default:
      return state;
  }
}
