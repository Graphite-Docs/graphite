import { setAlert } from './alert';
import { PROFILE_ERROR, PROFILE_LOADED } from './types';

export const loadProfile = (box) => async dispatch => {
  try {
    const profile = await box.public.all();
    dispatch({
      type: PROFILE_LOADED, 
      payload: profile
    })  
  } catch (error) {
    dispatch(setAlert(error.message, 'error'));
    dispatch({
      type: PROFILE_ERROR
    })  
  }
}