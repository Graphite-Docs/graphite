const request = require('superagent');
const expect = require('expect.js');
const testUser = "jerhunter5811.id";
const testInvalidKey = "2897347423899832";

module.exports = {
    checkServer: function() {
        describe('Check Server', function(){
            it ("Checks if the server is live", function(done){
              request.get(`http://localhost:5000/account/user/${testUser}/${testInvalidKey}`)
              .then((res) => {
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                done();
              })
            });
          });
    }
}