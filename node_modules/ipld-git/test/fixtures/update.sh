#!/bin/bash

ls . | awk -F '' 'NF == 40' | xargs rm
rm testdata.tar.gz -f
wget https://github.com/ipfs/go-ipld-git/raw/master/testdata.tar.gz
tar xzf testdata.tar.gz
rm testdata.tar.gz
mv .git git

find git/objects -type f | cut -d'/' -f3- | sed 's/\///g' | jq --raw-input . | jq --slurp . > objects.json
paste <(find git/objects -type f) <(find git/objects -type f | cut -d'/' -f3- | sed 's/\///g') | xargs -L 1 mv -v
rm -rf git
