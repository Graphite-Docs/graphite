# latency-monitor
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [v0.2.1](https://github.com/mlucool/latency-monitor/compare/v0.2.0...v0.2.1)
### Fixed
- ES6 default import

## [v0.2.0](https://github.com/mlucool/latency-monitor/compare/v0.1.0...v0.2.0)
### Fixed
- Method for monitoring event loop latency is vastly improved. This is considered a breaking change, although is
API compatible.

## [v0.1.0](https://github.com/mlucool/latency-monitor/compare/v0.0.1...v0.1.0)
### Changed
- Latency monitor now is disabled when a browser page is not in focus (where supported) due to 
browsers limiting the number of events fires when the page is hidden
