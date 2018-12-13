#!/bin/bash

# npm install -g rsa-json first

rsa-json --bits=$1 > keys$2.json

openssl rsa \
    -in <(node -e "console.log(require('./keys$2.json').private)") \
    -noout -text \
    > keys$2.txt

node parse.js keys$2.txt > expected$2.json
