/* eslint-env mocha */
var shared = require("./shared");

var expect = shared.expect;
var samples = shared.samples;
var expectImmutableEqual = shared.expectImmutableEqual;

var transitJS = require('transit-js');

var handlers = require('../').handlers;

var reader = transitJS.reader('json', { handlers: handlers.read });
var writer = transitJS.writer('json', { handlers: handlers.write });

describe("direct handlers usage", function() {

  samples.get('Immutable').forEach(function(data, desc) {
    describe(desc + " - " + data.inspect(), function() {
      it('should encode to JSON', function() {
        var json = writer.write(data);
        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.not.eql(null);
      });
      it('should round-trip', function() {
        var roundTrip = reader.read(writer.write(data));
        expect(roundTrip).to.be.an('object');
        expectImmutableEqual(roundTrip, data);
        expect(roundTrip).to.be.an.instanceOf(data.constructor);
      });
    });
  });

  describe("extending handlers", function() {
    function Blah(x) { this.x = x; }
    var extendedRead = {
      blah: function(v) { return new Blah(v); }
    };
    Object.keys(handlers.read).forEach(function(tag) {
      extendedRead[tag] = handlers.read[tag];
    });
    var extendedWrite = handlers.write.clone();
    extendedWrite.set(Blah, transitJS.makeWriteHandler({
      tag: function() { return 'blah'; },
      rep: function(v) { return v.x; }
    }));

    var readerX = transitJS.reader('json', {handlers: extendedRead});
    var writerX = transitJS.writer('json', {handlers: extendedWrite});

    describe("extended type", function() {
      it('should encode to JSON', function() {
        var json = writerX.write(new Blah(123));
        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.not.eql(null);
      });
      it('should round-trip', function() {
        var roundTrip = readerX.read(writerX.write(new Blah(456)));
        expect(roundTrip).to.be.an.instanceOf(Blah);
        expect(roundTrip).to.have.property("x", 456);
      });
    });

    samples.get('Immutable').forEach(function(data, desc) {
      describe(desc + " - " + data.inspect(), function() {
        it('should encode to JSON', function() {
          var json = writerX.write(data);
          expect(json).to.be.a('string');
          expect(JSON.parse(json)).to.not.eql(null);
        });
        it('should round-trip', function() {
          var roundTrip = readerX.read(writerX.write(data));
          expect(roundTrip).to.be.an('object');
          expectImmutableEqual(roundTrip, data);
          expect(roundTrip).to.be.an.instanceOf(data.constructor);
        });
      });
    });

  });
});
