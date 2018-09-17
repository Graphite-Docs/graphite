// import {
//   loadUserData
// } from 'blockstack';

if(window.location.origin === 'http://localhost:3000' || window.location.origin === 'https://serene-hamilton-56e88e.netlify.com' || window.location.origin === 'http://127.0.0.1:3000') {
  module.exports = require("./dev");
} else {
  module.exports = require("./prod");
}
