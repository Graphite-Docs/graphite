import { setAlert } from "./alert";
import { LOADING, END_LOADING } from "./types";
import { loadUser } from "./auth";
import { URL, config } from "../utils/api";
import axios from "axios";

export const uploadAvatar = (token, image) => async (dispatch) => {
  dispatch({
    type: LOADING,
  });
  let formData = new FormData();
  formData.append("image", image);
  try {
    config.headers["Authorization"] = `Bearer ${token}`;

    await axios.put(`${URL}/v1/profile/avatar`, formData, config);

    dispatch(loadUser());

    dispatch({
      type: END_LOADING,
    });
    dispatch(setAlert("Updated", "success"));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const updateName = (token, newName) => async (dispatch) => {
  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    const body = {
      name: newName,
    };

    await axios.put(`${URL}/v1/profile/name`, JSON.stringify(body), config);
    dispatch(loadUser());

    dispatch({
      type: END_LOADING,
    });

    dispatch(setAlert("Updated", "success"));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};

export const updateEmail = (token, newEmail) => async (dispatch) => {
  console.log(newEmail)
  try {
    config.headers["Authorization"] = `Bearer ${token}`;
    const body = {
      email: newEmail,
    };

    await axios.put(`${URL}/v1/profile/email`, JSON.stringify(body), config);
    dispatch(loadUser());

    dispatch({
      type: END_LOADING,
    });

    dispatch(setAlert("Updated", "success"));
  } catch (error) {
    console.log(error);
    dispatch(setAlert(error.message, "error"));
  }
};
