import {
  REGISTRATION_SUCCESS, 
  REGISTRATION_VALIDATED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGIN_VALIDATED,
  LOG_OUT, 
  LOADING
} from "../actions/types";

const initialState = {
  isAuthenticated: false,
  user: null,
  email: null, 
  name: null,
  loading: true,
  emailSent: false, 
  paymentMade: null,
  token: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case AUTH_ERROR:
    case LOGIN_FAIL:
      localStorage.removeItem('token');
      localStorage.removeItem('key');
      return {
        ...state,
        isAuthenticated: false,
        emailSent: false,
        loading: false,
      };
    case LOGIN_SUCCESS:
    case REGISTRATION_SUCCESS: 
      return {
        ...state,
        emailSent: true, 
        token: payload,
        loading: false
      };
    case LOGIN_VALIDATED: 
    case REGISTRATION_VALIDATED:
      localStorage.setItem('token', payload.token);
      localStorage.setItem('key', payload.user.privateKey);
      return {
        ...state, 
        emailSent: false, 
        token: payload.token, 
        user: payload.user, 
        isAuthenticated: true, 
        paymentMade: payload.paymentMade,
        loading: false
      }
    case LOG_OUT:
      localStorage.removeItem('token');
      localStorage.removeItem('key');
      localStorage.removeItem('selected_org');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        emailSent: false
      };
    case LOADING: 
      return {
        ...state, 
        loading: payload
      }
    default:
      return state;
  }
}
