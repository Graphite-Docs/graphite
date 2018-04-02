var i = 0;
describe('shorten.url tests', function () {

  it('shorten should expose a url function', function () {
    expect(shorten.url).to.be.a('function');
  });

  it('form should be appended', function () {
    expect(document.getElementById('shorten-form').id).to.equal('shorten-form');
  });

it('form should have two input fields', function () {
    expect(document.getElementById('shorten-form')).to.have.length(2);
  });




    it('http links should work (http://google.com/?q=shorten.js)', function () {
      setTimeout(function(){
        shorten.url('http://google.com/?q=shorten.js', function(err, shortenUrl){
          console.log(shortenUrl);
          return expect(shortenUrl).to.contain('git.io/');
        })
      }, 500*(++i));
    });



    it('https links should work (https://google.com/?q=shorten.js)', function () {
      setTimeout(function(){
        shorten.url('https://google.com/?q=shorten.js', function(err, shortenUrl){
          console.log(shortenUrl);
          return expect(shortenUrl).to.contain('git.io/');
        })
      }, 500*(++i));
    });



    it('invalid links should not work (h**p://google.com/?q=shorten.js)', function () {
      setTimeout(function(){
        shorten.url('h**p://google.com/?q=shorten.js', function(err, shortenUrl){
          console.log(err);
          return expect(err).to.be.a(Error);

        })
      }, 500*(++i));
    });

});