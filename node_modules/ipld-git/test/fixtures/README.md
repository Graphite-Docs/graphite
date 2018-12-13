Generated with https://github.com/ipfs/go-ipld-git/blob/master/make-test-repo.sh

To update the test objects:
* make sure you have `jq` installed
* cd into this directory
* run `./update.sh`

The script will download test data from https://github.com/ipfs/go-ipld-git and extract it here

To add/change test objects, you'll need to change https://github.com/ipfs/go-ipld-git/blob/master/make-test-repo.sh,
and regenerate testdata there.
