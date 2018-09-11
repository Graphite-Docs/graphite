// import {
//   loadUserData
// } from 'blockstack';

if(window.location.origin === 'http://localhost:3000' || window.location.origin === 'https://serene-hamilton-56e88e.netlify.com') {
  module.exports = require("./dev");
} else {
  module.exports = require("./prod");
}
