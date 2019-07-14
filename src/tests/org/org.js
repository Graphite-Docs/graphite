const request = require('superagent');
const expect = require('expect.js');
const testInvalidKey = "2897347423899832";
const testValidUser = "jehunter5811.id";
const testInvalidOrgId = "123-456-789";
const testValidOrgId = "6af90fcb-db28-48a6-b049-ca9041343c22";
const testValidPubKey = "035e888a584770cc0c296d40c4bad277f930899e67336fb1f47f5214d906f89362";
const blockstack = require('blockstack');
const profile = require('./profile.json');
const serverUrl = "http://localhost:5000";
const bearer = require('./bearer.json');

module.exports = {
    invalidOrgToken: function() {
        describe('Invalid org requests', function(){
            it ("Verifies response failure when bearer token not supplied", function(done){
                request.get(`${serverUrl}/account/org/${testInvalidOrgId}/${testInvalidKey}`)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Bearer token not supplied")
                }).then(() => {
                    done();
                })
            });

            it ("Verifies response failure when invalid token supplied", function(done){
                request.get(`${serverUrl}/account/org/${testInvalidOrgId}/${testInvalidKey}`).set('Authorization', bearer.token)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Invalid Token")
                }).then(() => {
                    done();
                })
            });

            it ("Verifies valid token required for valid org call", function(done){
                request.get(`${serverUrl}/account/org/${testValidOrgId}/${testInvalidKey}`).set('Authorization', bearer.token)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Invalid Token")
                }).then(() => {
                    done();
                })
            });
        })
    }, 
    validToken: function() {
        describe('Valid token, org request', function(){
            it ("Verifies a denial when user is not a member of the org", function(done){
                request.get(`${serverUrl}/account/org/${testValidOrgId}/${testValidPubKey}`).set('Authorization', bearer.token)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.text).to.equal("Access denied");
                }).then(() => {
                    done();
                })
            });

            it ("Verifies user with access can fetch org data", function(done){
                request.get(`${serverUrl}/account/org/${testValidOrgId}/${testValidPubKey}`).set('Authorization', bearer.token)
                .then((res) => {
                    expect(res).to.exist;
                    expect(res.status).to.equal(200);
                    expect(res.body).toNotEqual({});
                }).then(() => {
                    done();
                })
            });
        })
    }, 
    createOrg: function() {
        //Do nothing yet
    }   
}