import { LANG_SET } from "./types";

export const setLang = (lang) => dispatch => {
  localStorage.setItem('graphite_lang', lang);
  dispatch({
    type: LANG_SET,
    payload: lang
  });
};
