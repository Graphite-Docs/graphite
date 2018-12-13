const { toXML } = require('./dist/jstoxml');
const assert = require('assert');

describe('toXML', () => {
  describe('primitives', () => {
    const vals = [
      'foo',
      false,
      true,
      4,
      4.56
    ];

    vals.forEach(val => {
      it(`outputs ${val}`, () => {
        const result = toXML(val);
        const expectedResult = `${val}`;
        assert.equal(result, expectedResult);
      });
    });
  });

  describe('functions', () => {
    describe('primitive outputs', () => {
      const vals = [
        999,
        'foo',
        false,
        true
      ];

      vals.forEach((val) => {
        it(`${val}`, () => {
          const result = toXML(() => val);
          const expectedResult = `${val}`;
          assert.equal(result, expectedResult);
        });
      });
    });

    it('fat arrow', () => {
      const val = 888;
      const result = toXML(() => val);
      const expectedResult = val;
      assert.equal(result, expectedResult);
    });

    it('accessing config within function', () => {
      const val = {
        foo: {
          depth: config => config.depth
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo><depth>2</depth></foo>';
      assert.equal(result, expectedResult);
    });

    it('converts nonprimitive output', () => {
      const val = { foo: 'bar' };
      const result = toXML(() => val);
      const expectedResult = '<foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('converts nested nonprimitive output', () => {
      const val = { foo: { bar: { baz: 2 } } };
      const result = toXML(() => val);
      const expectedResult = '<foo><bar><baz>2</baz></bar></foo>';
      assert.equal(result, expectedResult);
    });

    it('converts nested nonprimitive output with indent', () => {
      const val = { foo: { bar: { baz: 2 } } };
      const config = { indent: '  ' };
      const result = toXML(() => val, config);
      const expectedResult = '<foo>\n  <bar>\n    <baz>2</baz>\n  </bar>\n</foo>';
      assert.equal(result, expectedResult);
    });
  });

  describe('github issues', () => {
    it('issue 3', () => {
      const val = {
        foo: true,
        bar: '',
        foo2: false,
        ok: 'This is ok',
        ok2: 'false',
        ok3: 'true'
      };
      const result = toXML(val);
      const expectedResult = '<foo>true</foo><bar/><foo2>false</foo2><ok>This is ok</ok><ok2>false</ok2><ok3>true</ok3>';
      assert.equal(result, expectedResult);
    });

    it('issue 4a', () => {
      const val = {
        foo: 4,
        bar: '&'
      };
      const result = toXML(val);
      const expectedResult = '<foo>4</foo><bar>&</bar>';
      assert.equal(result, expectedResult);
    });

    it('issue 4b', () => {
      const val = {
        foo: '&'
      };
      const config = {
        filter: {
          '&': '&amp;'
        }
      };
      const result = toXML(val, config);
      const expectedResult = '<foo>&amp;</foo>';
      assert.equal(result, expectedResult);
    });
  });

  describe('arrays', () => {
    it('1', () => {
      const val = [
        { foo: 'bar' },
        { foo: 'baz' },
        { foo2: 'bar2' }
      ];
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo><foo>baz</foo><foo2>bar2</foo2>';
      assert.equal(result, expectedResult);
    });

    it('attributes in subobject', () => {
      const val = [
        { foo: 'bar' },
        { foo: 'baz' },
        { foo: undefined },
        { foo: '' },
        { foo: null },
        {
          _name: 'foo',
          _content: 'bar',
          _attrs: {
            a: 'b',
            c: 'd'
          }
        }
      ];
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo><foo>baz</foo><foo/><foo/>foo<foo a="b" c="d">bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('nesting with indent', () => {
      const val = {
        foo: [
          { foo: 'bar' },
          { foo: 'baz' },
          { foo2: 'bar2' }
        ]
      };
      const config = { indent: '  ' };
      const result = toXML(val, config);
      const expectedResult = `<foo>
  <foo>bar</foo>
  <foo>baz</foo>
  <foo2>bar2</foo2>
</foo>`;
      assert.equal(result, expectedResult);
    });
  });

  describe('special-objects', () => {
    it('1', () => {
      const val = {
        _name: 'foo',
        _content: 'bar',
        _attrs: {
          a: 1,
          b: 2
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo a="1" b="2">bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('2', () => {
      const val = {
        _name: 'foo',
        _content: {
          foo: 'bar'
        },
        _attrs: {
          a: 1,
          b: 2
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo a="1" b="2"><foo>bar</foo></foo>';
      assert.equal(result, expectedResult);
    });

    it('3', () => {
      const val = {
        _name: 'foo',
        _content: () => 1 + 2,
        _attrs: {
          a: 1,
          b: 2
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo a="1" b="2">3</foo>';
      assert.equal(result, expectedResult);
    });
  });

  describe('objects', () => {
    it('1', () => {
      const val = {
        foo: 'bar',
        foo2: 'bar2'
      };
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo><foo2>bar2</foo2>';
      assert.equal(result, expectedResult);
    });

    it('attributes', () => {
      const val = {
        _name: 'a',
        _attrs: {
          foo: 'bar',
          foo2: 'bar2'
        }
      };
      const result = toXML(val);
      const expectedResult = '<a foo="bar" foo2="bar2"/>';
      assert.equal(result, expectedResult);
    });

    it('attributes 2', () => {
      const val = {
        _name: 'a',
        _attrs: {
          foo: 'bar',
          foo2: 'bar2'
        },
        _content: 'la dee da'
      };
      const result = toXML(val);
      const expectedResult = '<a foo="bar" foo2="bar2">la dee da</a>';
      assert.equal(result, expectedResult);
    });

    it('attributes nesting', () => {
      const val = {
        _name: 'foo',
        _attrs: {
          a: 'b'
        },
        _content: {
          _name: 'bar',
          _attrs: {
            c: 'd'
          }
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo a="b"><bar c="d"/></foo>';
      assert.equal(result, expectedResult);
    });
    it('with mixed content', () => {
      const val = {
        blah: null,
        foo: 'bar',
        'more blah': null,
        bar: 0,
        'more more blah': null,
        baz: false
      };
      const result = toXML(val);
      const expectedResult =
        'blah<foo>bar</foo>more blah<bar>0</bar>more more blah<baz>false</baz>';
      assert.equal(result, expectedResult);
    });

    it('nesting with indent', () => {
      const val = {
        foo: {
          foo: 'bar',
          foo2: 'bar2'
        }
      };
      const config = { indent: '  ' };
      const result = toXML(val, config);
      const expectedResult = `<foo>
  <foo>bar</foo>
  <foo2>bar2</foo2>
</foo>`;
      assert.equal(result, expectedResult);
    });

    it('deep nesting', () => {
      const val = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      h: {
                        i: {
                          j: {
                            k: {
                              l: {
                                m: {
                                  foo: 'bar'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const result = toXML(val);
      const expectedResult = '<a><b><c><d><e><f><g><h><i><j><k><l><m><foo>bar</foo></m></l></k></j></i></h></g></f></e></d></c></b></a>';
      assert.equal(result, expectedResult);
    });
  });

  describe('header', () => {
    it('default header', () => {
      const val = {
        foo: 'bar'
      };
      const config = {
        header: true
      };
      const result = toXML(val, config);
      const expectedResult = '<?xml version="1.0" encoding="UTF-8"?><foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('no header', () => {
      const val = {
        foo: 'bar'
      };
      const config = {
        header: false
      };
      const result = toXML(val, config);
      const expectedResult = '<foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('no header by default', () => {
      const val = {
        foo: 'bar'
      };
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('default header with indent', () => {
      const val = {
        foo: 'bar'
      };
      const config = {
        header: true,
        indent: '  '
      };
      const result = toXML(val, config);
      const expectedResult = '<?xml version="1.0" encoding="UTF-8"?>\n<foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('custom header', () => {
      const val = {
        foo: 'bar'
      };
      const config = {
        header: '<?FOO BAR="123" BAZ="XX"?>'
      };
      const result = toXML(val, config);
      const expectedResult = '<?FOO BAR="123" BAZ="XX"?><foo>bar</foo>';
      assert.equal(result, expectedResult);
    });
  });

  describe('filtering', () => {
    it('values', () => {
      const val = {
        foo: '<a>',
        bar: '"b"',
        baz: '\'&whee\''
      };
      const config = {
        filter: {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '&': '&amp;'
        }
      };
      const result = toXML(val, config);
      const expectedResult =
        '<foo>&lt;a&gt;</foo><bar>&quot;b&quot;</bar><baz>&apos;&amp;whee&apos;</baz>';
      assert.equal(result, expectedResult);
    });

    it('attributes', () => {
      const val = {
        _name: 'foo',
        _attrs: { a: '<"\'&"foo>' }
      };
      const config = {
        attributesFilter: {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '&': '&amp;'
        }
      };
      const result = toXML(val, config);
      const expectedResult = '<foo a="&lt;&quot;&apos;&amp;&quot;foo&gt;"/>';
      assert.equal(result, expectedResult);
    });
  });

  describe('misc', () => {
    it('outputs <_content> if it has no tag name', () => {
      const val = {
        _content: 'foo'
      };
      const result = toXML(val);
      const expectedResult = '<_content>foo</_content>';
      assert.equal(result, expectedResult);
    });

    it('outputs emoji attributes', () => {
      const val = {
        html: {
          _attrs: [
            { '⚡': true },
            { lang: 'en' },
            { lang: 'klingon' }
          ]
        }
      };
      const result = toXML(val);
      const expectedResult = '<html ⚡ lang="en" lang="klingon"/>';
      assert.equal(result, expectedResult);
    });

    it('does not force self close if tag has content', () => {
      const val = {
        _name: 'foo',
        _selfCloseTag: true,
        _content: 'bar'
      };
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('nested elements with self-closing sibling', () => {
      const val = {
        people: {
          students: [
            {
              student: { name: 'Joe' }
            },
            {
              student: { name: 'Jane' }
            }
          ],
          teacher: {
            _selfCloseTag: true,
            _attrs: {
              name: 'Yoda'
            }
          }
        }
      };
      const result = toXML(val);
      const expectedResult = '<people><students><student><name>Joe</name></student><student><name>Jane</name></student></students><teacher name="Yoda"/></people>';
      assert.equal(result, expectedResult);
    });

    it('sibling _content tag', () => {
      const val = {
        foo: {
          bar: 'baz',
          _content: {
            bar2: 'baz2'
          }
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo><bar>baz</bar><bar2>baz2</bar2></foo>';
      assert.equal(result, expectedResult);
    });
  });

  describe('examples', () => {
    it('1 simple object', () => {
      const val = {
        foo: 'bar',
        foo2: 'bar2'
      };
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo><foo2>bar2</foo2>';
      assert.equal(result, expectedResult);
    });

    it('2 simple array', () => {
      const val = [
        { foo: 'bar' },
        { foo: 'bar2' }
      ];
      const result = toXML(val);
      const expectedResult = '<foo>bar</foo><foo>bar2</foo>';
      assert.equal(result, expectedResult);
    });

    it('3 simple function', () => {
      const date = new Date();
      const val = {
        currentTime: () => date
      };
      const result = toXML(val);
      const expectedResult = `<currentTime>${date}</currentTime>`;
      assert.equal(result, expectedResult);
    });

    it('4 attributes', () => {
      const val = {
        _name: 'foo',
        _content: 'bar',
        _attrs: {
          a: 'b',
          c: 'd'
        }
      };
      const result = toXML(val);
      const expectedResult = '<foo a="b" c="d">bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('5 tags with mixed content', () => {
      const val = {
        text1: null,
        foo: 'bar',
        text2: null
      };
      const result = toXML(val);
      const expectedResult = 'text1<foo>bar</foo>text2';
      assert.equal(result, expectedResult);
    });

    it('6 nested tags with indent', () => {
      const val = {
        a: {
          foo: 'bar',
          foo2: 'bar2'
        }
      };
      const config = {
        header: false,
        indent: '  '
      };
      const result = toXML(val, config);
      const expectedResult = `<a>
  <foo>bar</foo>
  <foo2>bar2</foo2>
</a>`;
      assert.equal(result, expectedResult);
    });

    it('7 nested tags attributes', () => {
      const val = {
        ooo: {
          _name: 'foo',
          _attrs: {
            a: 'b'
          },
          _content: {
            _name: 'bar',
            _attrs: {
              c: 'd'
            }
          }
        }
      };
      const config = {
        header: false,
        indent: '  '
      };
      const result = toXML(val, config);
      const expectedResult = `<ooo>
  <foo a="b">
    <bar c="d"/>
  </foo>
</ooo>`;
      assert.equal(result, expectedResult);
    });

    it('8 complex functions', () => {
      const val = {
        someNestedXML: () => ({ foo: 'bar' })
      };
      const result = toXML(val);
      const expectedResult = '<someNestedXML><foo>bar</foo></someNestedXML>';
      assert.equal(result, expectedResult);
    });

    it('9 RSS feed', () => {
      const date = new Date();

      const val = {
        _name: 'rss',
        _attrs: {
          version: '2.0'
        },
        _content: {
          channel: [
            { title: 'RSS Example' },
            { description: 'Description' },
            { link: 'google.com' },
            { lastBuildDate: () => date },
            { pubDate: () => date },
            { language: 'en' },
            { item: {
              title: 'Item title',
              link: 'Item link',
              description: 'Item Description',
              pubDate: () => date
            } },
            { item: {
              title: 'Item2 title',
              link: 'Item2 link',
              description: 'Item2 Description',
              pubDate: () => date
            } }
          ]
        }
      };
      const config = {
        header: true,
        indent: '  '
      };
      const result = toXML(val, config);
      const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Example</title>
    <description>Description</description>
    <link>google.com</link>
    <lastBuildDate>${date}</lastBuildDate>
    <pubDate>${date}</pubDate>
    <language>en</language>
    <item>
      <title>Item title</title>
      <link>Item link</link>
      <description>Item Description</description>
      <pubDate>${date}</pubDate>
    </item>
    <item>
      <title>Item2 title</title>
      <link>Item2 link</link>
      <description>Item2 Description</description>
      <pubDate>${date}</pubDate>
    </item>
  </channel>
</rss>`;
      assert.equal(result, expectedResult);
    });

    it('10 podcast RSS', () => {
      const val = {
        _name: 'rss',
        _attrs: {
          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
          version: '2.0'
        },
        _content: {
          channel: [
            { title: 'Title' },
            { link: 'google.com' },
            { language: 'en-us' },
            { copyright: 'Copyright 2011' },
            { 'itunes:subtitle': 'Subtitle' },
            { 'itunes:author': 'Author' },
            { 'itunes:summary': 'Summary' },
            { description: 'Description' },
            { 'itunes:owner': {
              'itunes:name': 'Name',
              'itunes:email': 'Email'
            } },
            {
              _name: 'itunes:image',
              _attrs: {
                href: 'image.jpg'
              }
            },
            {
              _name: 'itunes:category',
              _attrs: {
                text: 'Technology'
              },
              _content: {
                _name: 'itunes:category',
                _attrs: {
                  text: 'Gadgets'
                }
              }
            },
            {
              _name: 'itunes:category',
              _attrs: {
                text: 'TV &amp; Film'
              }
            },
            {
              item: [
                { title: 'Podcast Title' },
                { 'itunes:author': 'Author' },
                { 'itunes:subtitle': 'Subtitle' },
                { 'itunes:summary': 'Summary' },
                { 'itunes:image': 'image.jpg' },
                {
                  _name: 'enclosure',
                  _attrs: {
                    url: 'http://example.com/podcast.m4a',
                    length: '8727310',
                    type: 'audio/x-m4a'
                  }
                },
                { guid: 'http://example.com/archive/aae20050615.m4a' },
                { pubDate: 'Wed, 15 Jun 2011 19:00:00 GMT' },
                { 'itunes:duration': '7:04' },
                { 'itunes:keywords': 'salt, pepper, shaker, exciting' }
              ]
            },
            {
              item: [
                { title: 'Podcast2 Title' },
                { 'itunes:author': 'Author2' },
                { 'itunes:subtitle': 'Subtitle2' },
                { 'itunes:summary': 'Summary2' },
                { 'itunes:image': 'image2.jpg' },
                {
                  _name: 'enclosure',
                  _attrs: {
                    url: 'http://example.com/podcast2.m4a',
                    length: '655555',
                    type: 'audio/x-m4a'
                  }
                },
                { guid: 'http://example.com/archive/aae2.m4a' },
                { pubDate: 'Wed, 15 Jul 2011 19:00:00 GMT' },
                { 'itunes:duration': '11:20' },
                { 'itunes:keywords': 'foo, bar' }
              ]
            }
          ]
        }
      };
      const config = {
        header: true,
        indent: '  '
      };

      const result = toXML(val, config);
      const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
  <channel>
    <title>Title</title>
    <link>google.com</link>
    <language>en-us</language>
    <copyright>Copyright 2011</copyright>
    <itunes:subtitle>Subtitle</itunes:subtitle>
    <itunes:author>Author</itunes:author>
    <itunes:summary>Summary</itunes:summary>
    <description>Description</description>
    <itunes:owner>
      <itunes:name>Name</itunes:name>
      <itunes:email>Email</itunes:email>
    </itunes:owner>
    <itunes:image href="image.jpg"/>
    <itunes:category text="Technology">
      <itunes:category text="Gadgets"/>
    </itunes:category>
    <itunes:category text="TV &amp; Film"/>
    <item>
      <title>Podcast Title</title>
      <itunes:author>Author</itunes:author>
      <itunes:subtitle>Subtitle</itunes:subtitle>
      <itunes:summary>Summary</itunes:summary>
      <itunes:image>image.jpg</itunes:image>
      <enclosure url="http://example.com/podcast.m4a" length="8727310" type="audio/x-m4a"/>
      <guid>http://example.com/archive/aae20050615.m4a</guid>
      <pubDate>Wed, 15 Jun 2011 19:00:00 GMT</pubDate>
      <itunes:duration>7:04</itunes:duration>
      <itunes:keywords>salt, pepper, shaker, exciting</itunes:keywords>
    </item>
    <item>
      <title>Podcast2 Title</title>
      <itunes:author>Author2</itunes:author>
      <itunes:subtitle>Subtitle2</itunes:subtitle>
      <itunes:summary>Summary2</itunes:summary>
      <itunes:image>image2.jpg</itunes:image>
      <enclosure url="http://example.com/podcast2.m4a" length="655555" type="audio/x-m4a"/>
      <guid>http://example.com/archive/aae2.m4a</guid>
      <pubDate>Wed, 15 Jul 2011 19:00:00 GMT</pubDate>
      <itunes:duration>11:20</itunes:duration>
      <itunes:keywords>foo, bar</itunes:keywords>
    </item>
  </channel>
</rss>`;
      assert.equal(result, expectedResult);
    });

    it('11 filter', () => {
      const val = {
        foo: '<a>',
        bar: '"b"',
        baz: '\'&whee\''
      };
      const config = {
        filter: {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '&': '&amp;'
        }
      };
      const result = toXML(val, config);
      const expectedResult =
        '<foo>&lt;a&gt;</foo><bar>&quot;b&quot;</bar><baz>&apos;&amp;whee&apos;</baz>';
      assert.equal(result, expectedResult);
    });

    it('11b attributes filter', () => {
      const val = {
        _name: 'foo',
        _content: 'bar',
        _attrs: {
          a: 'http://example.com/?test=\'1\'&foo=<bar>&whee="sha"',
          b: 'http://example2.com/?test=\'2\'&md=<5>&sum="sha"'
        }
      };
      const config = {
        attributesFilter: {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&apos;',
          '&': '&amp;'
        }
      };
      const result = toXML(val, config);
      const expectedResult =
        '<foo a="http://example.com/?test=&apos;1&apos;&amp;foo=&lt;bar&gt;&amp;whee=&quot;sha&quot;" b="http://example2.com/?test=&apos;2&apos;&amp;md=&lt;5&gt;&amp;sum=&quot;sha&quot;">bar</foo>';
      assert.equal(result, expectedResult);
    });

    it('12 avoiding self closing tags', () => {
      const val = [
        {
          _name: 'foo',
          _content: '',
          _selfCloseTag: false
        },
        {
          _name: 'bar',
          _content: undefined,
          _selfCloseTag: false
        }
      ];
      const result = toXML(val);
      const expectedResult = '<foo></foo><bar></bar>';
      assert.equal(result, expectedResult);
    });

    it('13 custom xml header', () => {
      const val = {
        foo: 'bar'
      };
      const config = {
        header: '<?xml version="1.0" encoding="UTF-16" standalone="yes"?>'
      };
      const result = toXML(val, config);
      const expectedResult =
        '<?xml version="1.0" encoding="UTF-16" standalone="yes"?><foo>bar</foo>';
      assert.equal(result, expectedResult);
    });


    it('14 emoji attributes', () => {
      const val = {
        html: {
          _attrs: {
            '⚡': true
          }
        }
      };
      const result = toXML(val);
      const expectedResult = '<html ⚡/>';
      assert.equal(result, expectedResult);
    });

    it('15 duplicate attribute keys', () => {
      const val = {
        html: {
          _attrs: [
            { lang: 'en' },
            { lang: 'klingon' }
          ]
        }
      };
      const result = toXML(val);
      const expectedResult = '<html lang="en" lang="klingon"/>';
      assert.equal(result, expectedResult);
    });

    it('issue #33: array of primitives', () => {
      const val = {
        x: [1, 2, 3]
      };
      const result = toXML(val);
      const expectedResult = '<x>1</x><x>2</x><x>3</x>';
      assert.equal(result, expectedResult);
    });

    it('issue #33: array of primitives 2', () => {
      const val = {
        a: {
          x: [1, 2, 3]
        }
      };
      const result = toXML(val);
      const expectedResult = '<a><x>1</x><x>2</x><x>3</x></a>';
      assert.equal(result, expectedResult);
    });

    it('issue #33: array of primitives 2 with indent', () => {
      const val = {
        a: {
          x: [1, 2, 3]
        }
      };
      const config = { indent: '  ' };
      const result = toXML(val, config);
      const expectedResult = '<a>\n  <x>1</x>\n  <x>2</x>\n  <x>3</x>\n</a>';
      assert.equal(result, expectedResult);
    });
    it('issue #33: array of objects', ()=>{
      const val = {
        a: {
          x: [{b:1,c:2},{d:3,e:4},{f:5,g:6}]
        }
      }
      const result = toXML(val);
      const expectedResult = '<a><x><b>1</b><c>2</c></x><x><d>3</d><e>4</e></x><x><f>5</f><g>6</g></x></a>'
    });
    it('issue #33: array of objects jstoxml format', () => {
      const val = {
        a: [
          {
            _name: 'foo',
            _content: '1',
          },
          {
            _name: 'foo',
            _content: '2',
          }
        ]
      };
      const result = toXML(val);
      const expectedResult = '<a><foo>1</foo><foo>2</foo></a>';
      assert.equal(result, expectedResult);
    });
    it('issue #34: array of array', () => {
      const val =  {
        Response: [
          [
            {
              _name: 'Play',
              _content: 'first sound'
            },
            {
              _name: 'Play',
              _content: 'second sound'
            }
          ]
        ]
      };
      const result = toXML(val);
      const expectedResult = '<Response><Play>first sound</Play><Play>second sound</Play></Response>';
      assert.equal(result, expectedResult);
    });
    it('issue #34', () => {
      const val =  {t:[{foo: 'bar'},{foo: 'bar2'}]};
      const result = toXML(val);
      const expectedResult = '<t><foo>bar</foo><foo>bar2</foo></t>';
      assert.equal(result, expectedResult);
    });
    it('issue #34', () => {
      const val =  {t:[{_name: "foo", _content: 'bar'},{_name: "foo", _content: 'bar2'}]};
      const result = toXML(val);
      const expectedResult = '<t><foo>bar</foo><foo>bar2</foo></t>';
      assert.equal(result, expectedResult);
    });
  });
});
