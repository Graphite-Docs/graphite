mkdir dist || true

alias babel="npm-exec babel-cli"

$(npm bin)/babel jstoxml.js --out-file dist/jstoxml.js
$(npm bin)/uglifyjs dist/jstoxml.js -ecma=5 -o dist/jstoxml-min.js