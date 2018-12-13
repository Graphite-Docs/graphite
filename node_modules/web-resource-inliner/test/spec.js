/*eslint-env mocha */
/*eslint no-unused-vars: [2, { "args": "none" }]*/
var assert = require( "assert" );
var fs = require( "fs" );
var path = require( "path" );
var inline = require( "../src/inline.js" );
var util = require( "../src/util.js" );
var fauxJax = require( "faux-jax" );
var mime = require( "mime-types" );

function normalize( contents )
{
    return process.platform === "win32" ? contents.replace( /\r\n/g, "\n" ) : contents;
}

function readFile( file )
{
    return normalize( fs.readFileSync( file, "utf8" ) );
}

function diff( actual, expected )
{
    if( actual === expected )
    {
        return;
    }

    actual = actual.split( "\n" );
    expected = expected.split( "\n" );

    expected.forEach( function( line, i )
    {
        if( !line.length && i === expected.length - 1 )
        {
            return;
        }
        var other = actual[ i ];
        if( line === other )
        {
            console.error( "%d| %j", i + 1, line );
        }
        else
        {
            console.error( "\033[31m%d| %j%s | %j\033[0m", i + 1, line, "", other );
        }
    } );
}

function testEquality( err, result, expected, done )
{
    result = normalize( result );
    diff( result, expected );
    assert( !err );
    assert.equal( result, expected );
    done();
}

describe( "html", function()
{
    this.timeout(5000);

    describe( "links", function()
    {
        it( "should inline local links", function( done )
        {
            var expected = readFile( "test/cases/css_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline remote links", function( done )
        {
            var expected = readFile( "test/cases/css-remote_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-remote.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should keep data: uris as-is", function( done )
        {
            var expected = readFile( "test/cases/data-uri.html" );

            inline.html( {
                    fileContent: expected,
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline remote links with no protocol", function( done )
        {
            var expected = readFile( "test/cases/css-remote-no-protocol_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-remote-no-protocol.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline remote links relative to a url", function( done )
        {
            var expected = readFile( "test/cases/css-remote-relative-to-url_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-remote-relative-to-url.html" ),
                    relativeTo: "https://raw.githubusercontent.com/jrit/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline local and remote multiline links", function( done )
        {
            var expected = readFile( "test/cases/css-multiline_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-multiline.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should transform links", function( done )
        {
            var expected = readFile( "test/cases/css-transform_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-transform.html" ),
                    relativeTo: "test/cases/",
                    linkTransform: function( content, done )
                    {
                        done( null, "/*inserted*/\n" + content );
                    }
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should rebase inline local links relative to", function( done )
        {
            var expected = readFile( "test/cases/css-rebase_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/css-rebase.html" ),
                    relativeTo: "test/cases/",
                    rebaseRelativeTo: "test/cases/assets/fonts"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

    } );

    describe( "scripts", function()
    {
        it( "should inline scripts", function( done )
        {
            var expected = readFile( "test/cases/script_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/script.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline multiline scripts", function( done )
        {
            var expected = readFile( "test/cases/script-multiline_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/script-multiline.html" ),
                    relativeTo: "test/cases/"
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should transform scripts", function( done )
        {
            var expected = readFile( "test/cases/script-transform_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/script-transform.html" ),
                    relativeTo: "test/cases/",
                    scriptTransform: function( content, done )
                    {
                        done( null, content );
                    }
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );
    } );

    describe( "images", function()
    {
        it( "should inline local images", function( done )
        {
            var expected = readFile( "test/cases/img_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/img.html" ),
                    relativeTo: "test/cases/",
                    images: true
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline remote images", function( done )
        {
            var expected = readFile( "test/cases/img-remote_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/img-remote.html" ),
                    relativeTo: "test/cases/",
                    images: true
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should inline images in one line", function( done )
        {
            var expected = readFile( "test/cases/img-singleline_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/img-singleline.html" ),
                    relativeTo: "test/cases/",
                    images: true
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should include based on size", function( done )
        {
            var expected = readFile( "test/cases/img-opt-out_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/img-opt-out.html" ),
                    relativeTo: "test/cases/",
                    images: 8
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should exclude based on size", function( done )
        {
            var expected = readFile( "test/cases/img-too-large_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/img-too-large.html" ),
                    relativeTo: "test/cases/",
                    images: 0.1
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );
    } );

    describe( "svgs", function()
    {
        it( "should inline local svgs", function( done )
        {
            var expected = readFile( "test/cases/svg/svg_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/svg/svg.html" ),
                    relativeTo: "test/cases/",
                    svgs: true
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should include based on size", function( done )
        {
            var expected = readFile( "test/cases/svg/svg-opt-out_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/svg/svg-opt-out.html" ),
                    relativeTo: "test/cases/",
                    svgs: 8
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );

        it( "should exclude based on size", function( done )
        {
            var expected = readFile( "test/cases/svg/svg-too-large_out.html" );

            inline.html( {
                    fileContent: readFile( "test/cases/svg/svg-too-large.html" ),
                    relativeTo: "test/cases/",
                    svgs: 0.1
                },
                function( err, result )
                {
                    testEquality( err, result, expected, done );
                }
            );
        } );
    } );

    it( "should inline based on inlineAttribute", function( done )
    {
        var expected = readFile( "test/cases/img-opt-in_out.html" );

        inline.html( {
                fileContent: readFile( "test/cases/img-opt-in.html" ),
                relativeTo: "test/cases/",
                images: false
            },
            function( err, result )
            {
                testEquality( err, result, expected, done );
            }
        );
    } );

    it( "should exclude based on inlineAttribute", function( done )
    {
        var expected = readFile( "test/cases/img-opt-out_out.html" );

        inline.html( {
                fileContent: readFile( "test/cases/img-opt-out.html" ),
                relativeTo: "test/cases/",
                images: true
            },
            function( err, result )
            {
                testEquality( err, result, expected, done );
            }
        );
    } );

    it( "should pass HTTP errors up through callbacks when strict", function( done )
    {
        inline.html( {
                fileContent: readFile( "test/cases/404.html" ),
                relativeTo: "test/cases/",
                strict: true
            },
            function( err, result )
            {
                assert.equal( err.message, "https://raw.githubusercontent.com/not-a-file.css returned http 400" );
                done();
            }
        );
    } );

    it( "should pass missing file errors up through callbacks when strict", function( done )
    {
        var expected = readFile( "test/cases/missing-file.html" );

        inline.html( {
                fileContent: readFile( "test/cases/missing-file.html" ),
                relativeTo: "test/cases/",
                strict: true
            },
            function( err, result )
            {
                assert.equal( result, expected );
                assert.equal( !!err, true );
                done();
            }
        );
    } );

    it( "should console.warn HTTP errors when not strict", function( done )
    {
        var expected = readFile( "test/cases/404.html" );

        inline.html( {
                fileContent: readFile( "test/cases/404.html" ),
                relativeTo: "test/cases/"
            },
            function( err, result )
            {
                assert.equal( result, expected );
                assert.equal( !!err, false );
                done();
            }
        );
    } );

    it( "should console.warn missing file errors when not strict", function( done )
    {
        inline.html( {
                fileContent: readFile( "test/cases/missing-file.html" ),
                relativeTo: "test/cases/"
            },
            function( err, result )
            {
                assert.equal( !!err, false );
                done();
            }
        );
    } );

    it( "should properly escape regex vars before calling replace()", function( done )
    {
        inline.html( {
                fileContent: readFile( "test/cases/script-regex-escape.html" ),
                relativeTo: "test/cases/"
            },
            function( err, result )
            {
                assert.equal( result.indexOf( "$&" ) > -1, true );
                done();
            }
        );
    } );

    describe( "(http mocking)", function()
    {
        var baseUrl = "http://example.com/";

        beforeEach( function()
        {
            fauxJax.install();
            fauxJax.on( "request", function( request )
            {
                assert.equal( request.requestURL.indexOf( baseUrl ), 0 );
                var relativePath = request.requestURL.slice( baseUrl.length ).replace( /\?.*/, "" );
                var headers = {
                    "Content-Type": mime.contentType( path.extname( relativePath ) ) || "application/octet-stream"
                };
                var content = fs.readFileSync( "test/cases/" + relativePath );
                request.respond( 200, headers, content );
            } );
        } );

        afterEach( function()
        {
            fauxJax.restore();
        } );

        it( "should not try to inline empty links", function( done )
        {
            const content = '<link href="" rel="stylesheet" />';

            inline.html( {
                    fileContent: content,
                    strict: false,
                    relativeTo: baseUrl
                },
                function( err, result )
                {
                    testEquality( err, result, content, done );
                }
            );
        } );

        it( "should use the base url (relativeTo) to resolve image URLs", function( done )
        {
            var expected = readFile( "test/cases/img_out.html" );
            inline.html( {
                fileContent: readFile( "test/cases/img.html" ),
                relativeTo: baseUrl,
                images: true
            }, function( err, result )
            {
                testEquality( err, result, expected, done );
            } );
        } );

        it( "should unescape HTML entities when extracting URLs from attributes", function( done )
        {
            fauxJax.on( "request", function( request )
            {
                assert( !/&\w+;/.test( request.url ) );
            } );
            inline.html( {
                fileContent: "<img src=\"assets/icon.png?a=b&amp;c='d'\" /><img src=\"assets/icon.png?a=b&amp;c='d'&amp;&amp;\">",
                relativeTo: baseUrl,
                images: true
            }, done );
        } );

        it( "should understand the spaces to the sides of = when parsing attributes", function( done )
        {
            var count = 0;
            fauxJax.on( "request", function( request )
            {
                count++;
            } );
            inline.html( {
                fileContent: "<img src = \"assets/icon.png\">" +
                    "<script src =\"assets/export.js\"></script>" +
                    "<script src =\n\"assets/export.js?foo=1\"></script>" +
                    "<link href=  \"assets/simple.css\" rel=\"stylesheet\"/>",
                relativeTo: baseUrl,
                scripts: true,
                links: true,
                images: true
            }, function()
            {
                assert.equal( count, 4 );
                done();
            } );
        } );

        it( "should apply the requestTransform option", function( done )
        {
            fauxJax.on( "request", function( request )
            {
                assert( request.requestURL.indexOf( "foo=bar" ) !== -1 );
            } );
            inline.html( {
                fileContent: "<img src=\"assets/icon.png\"><img src=\"assets/icon.png?a=1\">",
                relativeTo: baseUrl,
                scripts: true,
                links: true,
                images: true,
                requestTransform: function( options )
                {
                    options.qs = {
                        foo: "bar"
                    };
                }
            }, done );
        } );
    } );
} );

describe( "css", function()
{
    this.timeout(5000);

    it( "should inline local urls", function( done )
    {
        var expected = readFile( "test/cases/css_out.css" );

        inline.css( {
                fileContent: readFile( "test/cases/css.css" ),
                relativeTo: "test/cases/",
                images: false
            },
            function( err, result )
            {
                testEquality( err, result, expected, done );
            }
        );
    } );

    it( "should inline remote urls", function( done )
    {
        var expected = readFile( "test/cases/css-remote_out.css" );

        inline.css( {
                fileContent: readFile( "test/cases/css-remote.css" ),
                relativeTo: "test/cases/",
                images: true
            },
            function( err, result )
            {
                testEquality( err, result, expected, done );
            }
        );
    } );

    it( "should rebase local urls", function( done )
    {
        var expected = readFile( "test/cases/css-rebase_out.css" );

        inline.css( {
                fileContent: readFile( "test/cases/css-rebase.css" ),
                rebaseRelativeTo: "assets",
                images: false
            },
            function( err, result )
            {
                testEquality( err, result, expected, done );
            }
        );
    } );
} );

describe( "util", function()
{

    describe( "#escapeSpecialChars", function()
    {
        it( "should escape special regex characters in a string", function()
        {

            var str = "http://fonts.googleapis.com/css?family=Open+Sans";
            var expected = "http:\\/\\/fonts\\.googleapis\\.com\\/css\\?family=Open\\+Sans";

            var result = util.escapeSpecialChars( str );
            var regex = new RegExp( result, "g" );

            assert.equal( result, expected );
            assert.equal( str.match( regex ).length, 1 );

        } );
    } );

} );
