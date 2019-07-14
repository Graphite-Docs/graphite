const server = require('./server/checkSever');
const org = require('./org/org');
const user = require('./user/user');



server.checkServer();
user.invalidUserToken();
org.invalidOrgToken();
org.validToken();