import { setAlert } from "./alert";
import { LOADING, LOGIN_VALIDATED, END_LOADING } from "./types";
import { URL, config } from "../utils/api";
import axios from "axios";

export const uploadAvatar = (token, user, image) => async (dispatch) => {
  dispatch({
    type: LOADING,
  });
  let formData = new FormData();
  formData.append("image", image);
  try {
    config.headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.put(`${URL}/v1/profile/avatar`, formData, config);
    dispatch({
      type: LOGIN_VALIDATED,
      payload: { token, user: res.data.user, paymentMade: res.data.user.subscription },
    });

    dispatch({
      type: END_LOADING
    })
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};
