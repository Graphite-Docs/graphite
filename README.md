## Graphite

Graphite is a decentralized and encrypted alternative to Google's G-Suite, built on [Blockstack](http://blockstack.org). The app never stores your identity or any of your data. You own your files, you choose what to share.

Check it out at http://app.graphitedocs.com

Graphite is open source and available for contributions. It is also available to simple run locally. One of the exciting things about this app is you can run it (alongside Blockstack) without ever going to the Graphite URL.

## Install

Graphite is open source and welcomes new issues, feature requests, and contributions.

Steps to install:

1) Clone the repo.
2) cd into `graphite`
3) cd into `web`
3) Run `npm install`
4) Run `npm run start`

If you will be running a local websockets server, then you will also need to take the following steps:

1) cd into `server`  
2) `node index.js`
3) In your `web` folder, access `src/components/documents/editor`
4) In the `SocketEditor` file, change the endpoint to `http://localhost:5000`

Note 1: Local development will result in CORS errors on authentication. Use a CORS browser extension to get around this. Future version will eliminate this need and when pushed to a hosted site, the CORS error is resolved.

Note 2: Configuration files `src/components/helpers/prod.js` and `src/components/helpers/dev.js` both need to be present in order to compile successfully. In case they are missing, add them before starting the project.

## Motivation

This project stemmed from the increasing control companies place on user data. At any given moment, Google can remove access to every single one of the documents you write and store with them. That's unacceptable.

Additionally, government censorship, which has always been around, seems to be growing more prevalent.

Graphite sets out to change that, and this was only possible because of the work done by Blockstack.

## Contributing  

If you'd like to contribute to this project, there are a few ways to do so:

#### Report bugs
You can create a new issue any time, but please make sure your bug reports are clean and clear. Here's a good guide:

https://testlio.com/blog/the-ideal-bug-report/

Please make sure you search any existing issues for the bug you would like to report before opening a new issue.

#### Suggest Features
A public roadmap will soon be up at http://graphitedocs.com, but feature requests are always welcome. To suggest a feature, please open a new issue in this format:

Feature: [Your feature title]
Description of the feature requests

Be as detailed as possible in feature requests and be sure to search existing issues to make sure you are not making a duplicate feature request.

#### Bug Fixes
If you'd like to contribute by fixing any existing bugs, please create a pull request. Here's a basic guide for doing so:

https://help.github.com/articles/creating-a-pull-request/

## License

GPLv3. See the License file.
