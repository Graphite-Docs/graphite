import { URL, config } from '../utils/api';
import axios from "axios";
import { CANCEL_ACCOUNT } from './types';
import { setAlert } from './alert';
export const cancelAccount = (token) => async dispatch => {
  dispatch({
    type: CANCEL_ACCOUNT, 
    payload: {loading: true, cancelled: null, subscriptionEndDate: null}
  });

  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    const res = await axios.post(
      `${URL}/v1/payment/cancel`,
      JSON.stringify({}),
      config
    );
    
    dispatch({
      type: CANCEL_ACCOUNT, 
      payload: {loading: false, cancelled: true, subscriptionEndDate: res.data.current_period_end}
    })
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, 'error'));
  }
}

export const restartSubscription = (token, plan) => async dispatch => {
  try {
    // console.log({MSG: "Restart it", plan})
    // config.headers["Authorization"] = `Bearer ${token}`;    
    // const res = await axios.post(
    //   `${URL}/v1/payment/restart/${plan}`,
    //   JSON.stringify({}),
    //   config
    // );
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, 'error'));
  }
}