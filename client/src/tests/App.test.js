const request = require('superagent');
const expect = require('expect.js');
const axios = require("axios");
const testUser = "jerhunter5811.id";
const testInvalidKey = "2897347423899832";

describe('Suite one', function(){
  it ("Checks if the server is live", function(done){
    request.get(`http://localhost:5000/account/user/${testUser}/${testInvalidKey}`).end(function(res){
      expect(res).to.exist;
      expect(res.body).to.equal("Invalid Token");
      expect(res.status).to.equal(200);
      done();
    });
  });
});
