/* eslint-env mocha */
var shared = require("./shared");

var expect = shared.expect;
var samples = shared.samples;
var expectImmutableEqual = shared.expectImmutableEqual;
var expectNotImmutableEqual = shared.expectNotImmutableEqual;

var Immutable = require('immutable');

var transit = require('../');

describe('transit', function() {
  samples.get('Immutable').forEach(function(data, desc) {
    describe(desc + " - " + data.inspect(), function() {
      it('should encode to JSON', function() {
        var json = transit.toJSON(data);
        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.not.eql(null);
      });
      it('should round-trip', function() {
        var roundTrip = transit.fromJSON(transit.toJSON(data));
        expect(roundTrip).to.be.an('object');
        expectImmutableEqual(roundTrip, data);
        expect(roundTrip).to.be.an.instanceOf(data.constructor);
      });
    });
  });

  samples.get('JS').forEach(function(data, desc) {
    describe(desc + " - " + JSON.stringify(data), function() {
      it('should encode to JSON', function() {
        var json = transit.toJSON(data);
        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.not.eql(null);
      });
      it('should round-trip', function() {
        var roundTrip = transit.fromJSON(transit.toJSON(data));
        expectImmutableEqual(roundTrip, data);
      });
    });
  });

  it('should ignore functions', function() {
    var input = Immutable.Map({ a: function abc(){} });
    var result = transit.fromJSON(transit.toJSON(input));
    expect(result.get('a')).to.eql(null);
  });

  describe('Records', function() {
    var FooRecord = Immutable.Record({
      a: 1,
      b: 2,
    }, 'foo');

    var BarRecord = Immutable.Record({
      c: '1',
      d: '2'
    }, 'bar');

    var NamelessRecord = Immutable.Record({});

    var ClassyBase = Immutable.Record({name: 'lindsey'}, 'ClassyRecord');
    function ClassyRecord(values) { ClassyBase.call(this, values); }
    ClassyRecord.prototype = Object.create(ClassyBase.prototype);
    ClassyRecord.prototype.constructor = ClassyRecord;

    var recordTransit = transit.withRecords([FooRecord, BarRecord]);

    it('should ensure maps and records compare differently', function() {
      expectNotImmutableEqual(new FooRecord(), Immutable.Map({a: 1, b: 2}));
    });

    it('should round-trip simple records', function() {
      var data = Immutable.Map({
        myFoo: new FooRecord(),
        myBar: new BarRecord()
      });

      var roundTrip = recordTransit.fromJSON(recordTransit.toJSON(data));
      expectImmutableEqual(data, roundTrip);

      expect(roundTrip.get('myFoo').a).to.eql(1);
      expect(roundTrip.get('myFoo').b).to.eql(2);

      expect(roundTrip.get('myBar').c).to.eql('1');
      expect(roundTrip.get('myBar').d).to.eql('2');
    });

    it('should round-trip complex nested records', function() {
      var data = Immutable.Map({
        foo: new FooRecord({
          b: Immutable.List.of(BarRecord(), BarRecord({c: 22}))
        }),
        bar: new BarRecord()
      });

      var roundTrip = recordTransit.fromJSON(recordTransit.toJSON(data));
      expectImmutableEqual(data, roundTrip);
    });

    it('should serialize unspecified Record as a Map', function() {
      var data = Immutable.Map({
        myFoo: new FooRecord(),
        myBar: new BarRecord()
      });

      var oneRecordTransit = transit.withRecords([FooRecord]);
      var roundTripOneRecord = oneRecordTransit.fromJSON(
                                oneRecordTransit.toJSON(data));

      expectImmutableEqual(roundTripOneRecord, Immutable.fromJS({
        myFoo: new FooRecord(),
        myBar: {c: '1', d: '2'}
      }));

      var roundTripWithoutRecords = transit.fromJSON(transit.toJSON(data));

      expectImmutableEqual(roundTripWithoutRecords, Immutable.fromJS({
        myFoo: {a: 1, b: 2},
        myBar: {c: '1', d: '2'}
      }));
    });

    it('should roundtrip ES6-class-style records', function() {
      var data = new ClassyRecord({name: 'jon'});

      var classyTransit = transit.withRecords([ClassyRecord]);
      var roundTrip = classyTransit.fromJSON(classyTransit.toJSON(data));

      expectImmutableEqual(data, roundTrip);
    });

    it('throws an error when it is passed a record with no name', function() {
      expect(function() {
        transit.withRecords([NamelessRecord]);
      }).to.throw();
    });

    it('throws an error when it reads an unknown record type', function() {
      var input = new FooRecord();

      var json = recordTransit.toJSON(input);

      var emptyRecordTransit = transit.withRecords([]);

      expect(function() {
        emptyRecordTransit.fromJSON(json);
      }).to.throw();
    });

    it('throws an error if two records have the same name', function() {
      var R1 = Immutable.Record({}, 'R1');
      var R1_2 = Immutable.Record({}, 'R1');

      expect(function() {
        transit.withRecords([R1, R1_2]);
      }).to.throw();
    });

    it('should not throw an error with custom error-handler', function() {
      var input = new FooRecord();

      var json = recordTransit.toJSON(input);

      var emptyRecordTransit = transit.withRecords([], function() {
        return null;
      });

      expect(function() {
        emptyRecordTransit.fromJSON(json);
      }).to.not.throw();
    });

    it('should deserializing a FooRecord to BarRecord', function() {
      var input = new FooRecord({a: '3', b: '4'});

      var json = recordTransit.toJSON(input);

      var emptyRecordTransit = transit.withRecords([], function(n, v) {
        switch (n) {
        case 'foo':
          return new BarRecord({c: v.a, d: v.b});
        default:
          return null;
        }
      });
      var result = emptyRecordTransit.fromJSON(json);

      expect(result).to.be.an.instanceof(BarRecord);
      expect(result.c).to.eql('3');
      expect(result.d).to.eql('4');
    });
  });

  describe('.withFilter(predicate)', function(){
    var filterFunction = function(val, key) {
      return key[0] !== '_';
    };
    var filter = transit.withFilter(filterFunction);

    it('can ignore Map entries', function() {
      var input = Immutable.Map({
        a: 'foo', _b: 'bar', c: Immutable.Map({d: 'deep', _e: 'hide'})
      });
      var result = filter.fromJSON(filter.toJSON(input));
      expect(result.get('a')).to.eql('foo');
      expect(result.get('_b')).to.eql(undefined);
      expect(result.size).to.eql(2);
      expect(result.getIn(['c', 'd'])).to.eql('deep');
      expect(result.getIn(['c', '_e'])).to.eql(undefined);
      expect(result.getIn(['c']).size).to.eql(1);
    });

    it('can ignore OrderedMap entries', function() {
      var input = Immutable.OrderedMap()
        .set('a', 'baz').set('_b', 'bar')
        .set('c', Immutable.OrderedMap({d: 'deep', _e: 'hide'}));
      var result = filter.fromJSON(filter.toJSON(input));
      expect(result.get('a')).to.eql('baz');
      expect(result.get('_b')).to.eql(undefined);
      expect(result.size).to.eql(2);
      expect(result.getIn(['c', 'd'])).to.eql('deep');
      expect(result.getIn(['c', '_e'])).to.eql(undefined);
      expect(result.getIn(['c']).size).to.eql(1);
    });

    it('can ignore Set entries', function() {
      var input = Immutable.OrderedSet.of(1, 2, 3, 3, 'a');
      filter = transit.withFilter(function(val) {
        return typeof val === 'number';
      });
      var result = filter.fromJSON(filter.toJSON(input));
      expect(result.includes('a')).to.eql(false);
      expect(result.size).to.eql(3);
    });

    it('can ignore OrderedSet entries', function() {
      var input = Immutable.Set.of(1, 2, 3, 3, 'a');
      filter = transit.withFilter(function(val) {
        return typeof val === 'number';
      });
      var result = filter.fromJSON(filter.toJSON(input));
      expect(result.includes('a')).to.eql(false);
      expect(result.size).to.eql(3);
    });

    it('can ignore List entries', function() {
      var input = Immutable.List.of(1, 2, 3, 3, 'a');
      var result = filter.fromJSON(filter.toJSON(input));
      expect(result.includes('a')).to.eql(false);
      expect(result.size).to.eql(4);
    });

    it('can ignore Maps nested in Records', function() {
      var MyRecord = Immutable.Record({
        a: null,
        _b: 'bar'
      }, 'myRecord');

      var input = new MyRecord({a: Immutable.Map({_c: 1, d: 2}), _b: 'baz' });
      var recordFilter = transit
                          .withRecords([MyRecord])
                          .withFilter(filterFunction);

      var result = recordFilter.fromJSON(recordFilter.toJSON(input));

      expect(result.getIn(['a', 'd'])).to.eql(2);
      expect(result.getIn(['a', '_c'])).to.eql(undefined);
      expect(result.get('a').size).to.eql(1);
      expect(result.get('_b')).to.eql('baz');
    });

    it('should use missing-record-handler combined with filter', function() {
      var FooRecord = Immutable.Record({
        a: 1,
        b: 2,
      }, 'foo');

      var BarRecord = Immutable.Record({
        c: '1',
        d: '2'
      }, 'bar');

      var input = new Immutable.Map({
        _bar: new BarRecord(),
        foo: new FooRecord({
          a: 3,
          b: 4
        })
      });

      var missingRecordHandler = function(n, v) {
        switch (n) {
        case 'foo':
          return new BarRecord({c: v.a, d: v.b});
        default:
          return null;
        }
      };

      var recordFilter = transit
                          .withRecords([FooRecord, BarRecord])
                          .withFilter(filterFunction);
      var json = recordFilter.toJSON(input);
      recordFilter = transit
                      .withRecords([BarRecord], missingRecordHandler)
                      .withFilter(filterFunction);

      var result = recordFilter.fromJSON(json);

      expect(result.get('foo').c).to.eql(3);
      expect(result.get('foo').d).to.eql(4);
      expect(result.get('_bar')).to.eql(undefined);
    });

  });

  describe("withExtraHandlers", function() {
    function Point2d(x, y) { this.x = x; this.y = y; }
    function Point3d(x, y, z) { this.x = x; this.y = y; this.z = z; }
    var transitX;
    before(function() {
      transitX = transit.withExtraHandlers([
        {
          tag: "2d", class: Point2d,
          write: function(val) { return [val.x, val.y]; },
          read: function(rep) { return new Point2d(rep[0], rep[1]); }
        },
        {
          tag: "3d", class: Point3d,
          write: function(val) { return {x: val.x, y: val.y, z: val.z}; },
          read: function(rep) { return new Point3d(rep.x, rep.y, rep.z); }
        }
      ]);
    });
    var value = Immutable.Map.of(
      123, new Point2d(3, 5),
      "co-ords", Immutable.List.of(new Point3d(1, 2, 3), new Point3d(4, 5, 6))
    );

    it('should encode into json', function() {
      var json = transitX.toJSON(value);
      expect(json).to.be.a('string');
      expect(JSON.parse(json)).to.not.eql(null);
    });
    it('should round-trip', function() {
      var roundTrip = transitX.fromJSON(transitX.toJSON(value));
      expect(roundTrip).to.be.an.instanceof(Immutable.Map);

      var point2 = roundTrip.get(123);
      expect(point2).to.be.an.instanceof(Point2d);
      expect(point2).to.have.property("x", 3);
      expect(point2).to.have.property("y", 5);

      var point3a = roundTrip.getIn(["co-ords", 0]);
      expect(point3a).to.be.an.instanceof(Point3d);
      expect(point3a).to.have.property("x", 1);
      expect(point3a).to.have.property("y", 2);
      expect(point3a).to.have.property("z", 3);

      var point3b = roundTrip.getIn(["co-ords", 1]);
      expect(point3b).to.be.an.instanceof(Point3d);
      expect(point3b).to.have.property("x", 4);
      expect(point3b).to.have.property("y", 5);
      expect(point3b).to.have.property("z", 6);
    });

    describe("argument checking", function() {
      function makeExtra(override) {
        function ABC() {}
        var extra = {
          tag: "abc", class: ABC,
          read: function(rep) { return ABC(rep); },
          write: function(v) { return v * 0; }
        };
        Object.keys(override || {}).forEach(function(key) {
          extra[key] = override[key];
        });
        return extra;
      }
      it("should check for non-array", function() {
        expect(function() {
          transit.withExtraHandlers({});
        }).to.throw();
      });
      it("should check for string tag", function() {
        expect(function() {
          transit.withExtraHandlers([
            makeExtra(),
            makeExtra({tag: 123})
          ]);
        }).to.throw();
      });
      it("should check for class function", function() {
        expect(function() {
          transit.withExtraHandlers([
            makeExtra({class: "blah"})
          ]);
        }).to.throw();
      });
      it("should check for write function", function() {
        expect(function() {
          transit.withExtraHandlers([
            makeExtra({write: [1, 2, 3]})
          ]);
        }).to.throw();
      });
      it("should check for read function", function() {
        expect(function() {
          transit.withExtraHandlers([
            makeExtra({read: {nope: "not this"}})
          ]);
        }).to.throw();
      });
    });
  });

  describe('Unknown Input', function() {
    it('fails when an unrecognized object is passed', function() {
      var MyObject = function() {};
      var MyObjectInstance = new MyObject();

      expect(function() {
        transit.toJSON(MyObjectInstance);
      }).to.throw();
    });
  });

});
