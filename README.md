## Graphite

Graphite is a secure, private, and encrypted alternative to Google's G-Suite. Using [Blockstack's](http://blockstack.org) developer tools and protocol, Graphite gives people control over their identity. People get all the convenience of cloud computing with none of the privacy tradeoffs.

Check it out at http://app.graphitedocs.com

Graphite is open source and available for contributions. It is also available to simple run locally. One of the exciting things about this app is you can run it (alongside Blockstack) without ever going to the Graphite URL.

# Quick Start  

## Install

Graphite is open source and welcomes new issues, feature requests, and contributions.

Steps to install:

1) Clone the repo.
2) Run `npm install`
3) Run `npm run start`
4) Run `cp .env.sample .env`

**Note: Local development will result in CORS errors on authentication. Use a CORS browser extension to get around this. Future version will eliminate this need and when pushed to a hosted site, the CORS error is resolved.**  

## Using Locally with Graphite Pro  

It is possible to run Graphite locally and access Graphite Pro features. There are two options:  

1. Update the code in the `src/index.js`.  Set the `axios.defaults.baseURL` to `process.env.REACT_APP_API_URL_SOCKET` (https://socket.graphitedocs.com)
2. Clone and run the `graphite-server`. This server handles websockets and Graphire Pro requires. It is available at [https://github.com/graphite-docs/graphite-server](https://github.com/graphite-docs/graphite-server).

# Technical Architecture  
There is a lot that goes into making Graphite work well while hiding the complexities of encryption behind the scenes. But at the same time, it's important to understand how that complexity works so that people can audit and adopt similar approaches elsewhere.

### Identity  
When creating a user account, people are directed to the Blockstack Browser. While the name is a bit of a misnomer, the Blockstack Browser is an authenticator. The best way to think of it is like the little window that pops up when you sign into applications using Google or Facebook. The difference here is that the Blockstack Browser is simply verifying or generating application-specific encryption keys for you to use within Graphite.

Basic flow for a new user:   

* Click Sign Up  
* Directed to Blockstack Browser  
* Choose username  
* Name is registered  
* Master keychain created   
* Application-specific encryption keys generated  
* Storage hub selected and specified in profile  
* Authentication response included in a redirect to Graphite

What's actually happening above?

If a user has never used an application built on Blockstack's protocol, they'll need to select a user name. Let's explore that first.  

**Username selection and registration**  

Initially, a username is created for free as a sponsored name under the `id.blockstack` name within the `.blockstack` namespace. The best way to think of names are like website domains, and the best way to think of namespaces are like top-level domains (.com, .org, etc). Because all name registrations require a transaction on the bitcoin blockchain (this is how these names become wholly owned by the people who register them and not by apps like Graphite), a payment is required. However, by issuing sponsored names under and existing name, these name registrations can be batched together. This allows hundreds of names to be registered at once, thus bringing down the cost significantly.

Example: `justin.id.blockstack` is a sponsored name under the `id.blockstack` name within the `blockstack` namespace. Although the owner of `id.blockstack` controls the availability of name registrations through that name, once a name is created, it is entirely owned and controlled by the person using it.

People have the opportunity to create additional names, and those names do not have to be sponsored names. It's important to note that as of this time, any names created outside the sponsored `id.blockstack` name will require payment from the user to issue the name transaction on the blockchain.

In a soon-to-be-released version of Graphite's authentication system, users will simply be able to select a username and enter a password. The process described above will happen behind the scenes and without the user ever having to leave Graphite's web app.  

**Master keychain creation**  
For brand new users, a keychain is created. This keychain is a combination of things. It helps generate their publicly available profile file, but it also includes sensitive information such as master private key, master payment key, and a seed phrase.

Currently, each user must record the seed phrase and keep it somewhere safe. *Loss of the seed phrase equates to loss of data*.

This keychain is created client-side and encrypted.

**Application-specific encryption keys generated**  
Because Blockstack's protocol is designed to be used with a single username across multiple applications, the user is presented with application-specific encryption keys. These keys are used only within the app the person is logging into. In the case of Graphite, Graphite-specific keys are used for encryption and decryption. If someone were to try to use those keys in another app, they would not work.

These keys, of course, are unique per person and are derived by a combination of the verification of Graphite's application origin (https://app.graphitedocs.com) and the person's master seed phrase.

Because of this derivation process, a user never has to memorize or store their Graphite-specific encryption keys. As long as they have their seed phrase somewhere safe, they will always be able to encrypt and decrypt data behind the scenes with the same simplicity as using unencrypted Google Products.

### Storage

**Storage hub selected and specified in profile**  
While not all applications buuilding with Blockstack's protocol offer this, Graphite offers people the opportunity to provide a user-selected storage hub URL. Should a user not want to deal with the technical requirements of configuring and deploying a storage hub, they can simply use Blockstack's sponsored storage hub for free. All data is encrypted before being sent to Blockstack's sponsored hub, so people can freely work and communicate without fear of snooping or data breaches.

If a person would like to run their own storage hub, they can follow the instructions here: [Gaia Storage](https://github.com/blockstack/gaia/).

*Notes about storage and Graphite Pro plans:*  
Paying users of Graphite's enterprise offering, Graphite Pro, will have pointer information stored in a Graphite managed database. This database contains no personal information and simply allows teams to work together by signalling where a file is currently located (i.e. which users on the account has the most recent updates in their storage hub).

### Collaboration  
To get a sense for how sharing of documents and files works in Graphite at a base level, consider the diagram below.

![](https://blog.graphitedocs.com/content/images/downloaded_images/Collaborative-Writing-With-User-Owned-Storage-and-Encryption/1-9UV_B4MirauPOQsrBZzMWA.png)

Essentially, every file or document that is shared is copied then encrypted with the recipient's public key. This is true of real-time collaboration as well, but with the added convenience of back and forth updates possible in real time.

Graphite uses a websockets server to manage real-time collaboration. The server uses a secure `wss` connections (the equivalent of tls connections for web browsers). No data is stored on the server or sent anywhere other than to the other collaborators. This is all verifiable by reviewing the open source code for Graphite's server [here](https://github.com/graphite-docs/graphite-server).

### Graphite Pro  
Paying customer under Graphite's enterprise plan, Graphite Pro, have added benefits such as team management, roles and permissions, and team sharing. To enable these features, Graphite takes a security-first approach while still recognizing the need for convenience.

When a team is created, encryption keys for that team are also created. This happens client-side. When a team member is added to the team an email invite is sent which includes a token that allows the team member to receive and store and encrypted copy of the team-specific encryption keys in their storage hub.

Any files, forms, or documents shared amongst a team are encrypted with team-specific keys. Because Graphite Pro also makes use of a server and a database for pointer files, additional security is put in place to verify the authenticity of an API call to request information about a file's storage location. Should a teammate be removed from the team, the database knows about this, the client knows about this, and the encryption keys for the team are rotated.

To get an even better sense of how this all works, please review the blog post that outlines [Graphite Pro](https://blog.graphitedocs.com/re-introducing-graphite-pro/).

# Motivation

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
