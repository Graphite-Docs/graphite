# Changelog
All notable changes to the project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0]

### Added
- You can now add custom header fields to the JWS header by passing
  an object to the `TokenSigner.sign()` method's `customHeader` parameter.

### Changed
- Use `Buffer.from` instead of deprecated `new Buffer()`
