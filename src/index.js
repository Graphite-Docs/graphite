import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/fa-all.min.css';
import 'milligram/dist/milligram.min.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

document.addEventListener("click", (e) => {
  const elem = e.target;
  if (!elem.classList.contains("global-menu")) {
    const menus = document.getElementsByClassName("global-menu");
    for (const menu of menus) {
      menu.style.display = "none";
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
