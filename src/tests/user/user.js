const request = require('superagent');
const expect = require('expect.js');
const testValidUser = "jehunter5811.id";
const userDoesNotExist = "thisusershouldneverexist.io"
const testInvalidKey = "2897347423899832";
const testValidKey = "035e888a584770cc0c296d40c4bad277f930899e67336fb1f47f5214d906f89362";

module.exports = {
    invalidUserToken: function() {
        describe('Token required', function(){
            it ("Verifies token requirement for user routes", function(done){
                request.get(`http://localhost:5000/account/user/${testValidUser}/${testInvalidKey}`)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Invalid Token")
                    done();
              })
            });
        });
    }, 
    validUserToken: function() {
        describe('Valid token', function(){
            it ("Verifies valid token, no user", function(done){
                request.get(`http://localhost:5000/account/user/${userDoesNotExist}/${testInvalidKey}`)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Invalid Token")
                    done();
              })
            });

            it ("Verifies valid token, user can't access", function(done){
                request.get(`http://localhost:5000/account/user/${testUser}/${testValidKey}`)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("To fetch info about other users, please use API Key")
                    done();
              })
            });

            it ("Verifies valid token, user found", function(done){
                request.get(`http://localhost:5000/account/user/${testValidUser}/${testValidKey}`)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.data).to.exist;
                    done();
              })
            });
        });
    }
}