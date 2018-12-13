/*jslint es5:true, nomen:true, node:true*/
(function () {
    var hasOwn = Object.prototype.hasOwnProperty,
        Undefined = function (){},
        spawn = require('child_process').spawn,
        StringStripped = function(value){
            return(value.replace('$','').replace('&','').replace(';',''));
        },
        buildOpts = function (options) {
            var opts = [];
            Object.keys(options).forEach(function (key) {
                if (hasOwn.call(validOptions, key)) {
                    opts.push('--' + key);
                    if (validOptions[key] && validOptions[key] !== Undefined) {
                        opts.push(validOptions[key](options[key]));
                    }
                }
            });
            return (opts);
        },
        validOptions = {
            'background': Undefined,
            'collate': Undefined,
            'copies': Number,
            'default-header': Undefined,
            'disable-external-links': Undefined,
            'disable-forms': Undefined,
            'disable-internal-links': Undefined,
            'disable-javascript': Undefined,
            'disable-smart-shrinking': Undefined,
            'disable-toc-back-links': Undefined,
            'enable-external-links': Undefined,
            'enable-forms': Undefined,
            'enable-internal-links': Undefined,
            'enable-javascript': Undefined,
            'enable-smart-shrinking': Undefined,
            'enable-toc-back-links': Undefined,
            'encoding': StringStripped,
            'exclude-from-outline': Undefined,
            'grayscale': Undefined,
            'dpi': Number,
            'image-quality': Number,
            'images': Undefined,
            'include-in-outline': Undefined,
            'javascript-delay': Number,
            'load-error-handling': StringStripped,
            'lowquality': Undefined,
            'margin-bottom': StringStripped,
            'margin-left': StringStripped,
            'margin-right': StringStripped,
            'margin-top': StringStripped,
            'minimum-font-size': Number,
            'no-background': Undefined,
            'no-collate': Undefined,
            'no-images': Undefined,
            'no-outline': Undefined,
            'no-pdf-compression': Undefined,
            'no-print-media-type': Undefined,
            'no-stop-slow-scripts': Undefined,
            'orientation': StringStripped,
            'outline': Undefined,
            'outline-depth': Number,
            'output-format': StringStripped,
            'page-height': StringStripped,
            'page-offset': Number,
            'page-size': StringStripped,
            'page-width': StringStripped,
            'password': StringStripped,
            'print-media-type': Undefined,
            'proxy': StringStripped,
            'stop-slow-scripts': Undefined,
            'title': StringStripped,
            'user-style-sheet': StringStripped,
            'username': StringStripped,
            'zoom': Number
        };
    module.exports.pipePdf = function (options, stream) {
        var child = spawn('/bin/sh', ['-c', 'wkhtmltopdf - - ' + buildOpts(options).join(' ') + ' | cat']);
        child.stdin.end(options.html);
        child.stdout.pipe(stream);
    };
    module.exports.getPdfStream = function (options, callback) {
        var child = spawn('/bin/sh', ['-c', 'wkhtmltopdf - - ' + buildOpts(options).join(' ') + ' | cat']);
        child.stdin.end(options.html);
        callback(child.stdout);
    };
}());