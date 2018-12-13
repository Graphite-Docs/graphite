# Epimetheus
[![CircleCI](https://img.shields.io/circleci/project/roylines/node-epimetheus.svg)]()
[![Coveralls](https://img.shields.io/coveralls/roylines/node-epimetheus.svg)]()
[![David](https://img.shields.io/david/roylines/node-epimetheus.svg)]()

[![NPM](https://nodei.co/npm/epimetheus.png)](https://nodei.co/npm/epimetheus/)

Middleware to automatically instrument node applications for consumption by a [Prometheus](https://prometheus.io/) server.

Prometheus is an open source monitoring solution that obtains metrics from servers by querying against the /metrics endpoint upon them.

Once instrumented, Epimetheus automatically serves [response duration](#duration) metrics, plus nodejs [system metrics](#system) on the /metrics endpoint ready to be consumed by Prometheus.

Epimetheus will instrument websites and webservices that use [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify).

# Instrumentation
Epimetheus automatically measures a number of metrics once instrumented.
The following metrics are instrumented via the /metrics endpoint:

## <a name="duration"></a> Duration Metrics
There are two metrics measuring request duration:

- **http\_request\_duration\_milliseconds (summary)**: a [summary](https://prometheus.io/docs/concepts/metric_types/#summary) metric measuring the duration in milliseconds of all requests. It can be used to [calculate average request durations](https://prometheus.io/docs/practices/histograms/#count-and-sum-of-observations).
- **http\_request\_buckets\_milliseconds (histogram)**: a [histogram](https://prometheus.io/docs/concepts/metric_types/#histogram) metric used to count duration in buckets of sizes 500ms and 2000ms. This can be used to [calculate apdex](https://prometheus.io/docs/practices/histograms/#apdex-score) using a response time threshold of 500ms.

In each case, the following [labels](https://prometheus.io/docs/practices/naming/#labels) are used:

- **status**: the http status code of the response, e.g. 200, 500
- **method**: the http method of the request, e.g. put, post.
- **path**: the path of the request. Note that /users/freddie is labelled /users/ so as not to flood prometheus with labels
- **cardinality**: the cardinality of the request, e.g. /users/freddie has cardinality 'one', /users/ has cardinality 'many'

## <a name="system"></a> System Metrics
These are metrics provided by [prom-client](https://github.com/siimon/prom-client#default-metrics) that instrument the nodejs heap/rss usage and cpu usage etc.

# Installation
```
> npm install --save epimetheus
```

Epimetheus has only one method, instrument, and it has the following signature:
## instrument(server, options)

The first argument represents the server of the middleware.

The second argument is optional, and allows some configuration of epimetheus

- `url` - the url on which to serve metrics. Defaults to `/metrics`.

See the following examples of use with [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify).

# <a name="http"></a> http
```
const http = require('http');
const epimetheus = require('../../index');

const server = http.createServer((req, res) => {
  if(req.url !== '/metrics') {
    res.statusCode = 200;
    res.end();
  }
});

epimetheus.instrument(server);

server.listen(8003, '127.0.0.1', () => {
  console.log('http listening on 8003');
});

```
# <a name="express"></a> Express
```
const express = require('express');
const epimetheus = require('epimetheus');

const app = express();
epimetheus.instrument(app);

app.get('/', (req, res) => {
  res.send();
});

app.listen(3000, () => {
  console.log('express server listening on port 3000');
});

```
# <a name="hapi"></a> Hapi
```
const Hapi = require('hapi');
const epimetheus = require('epimetheus');

const server = new Hapi.Server();

server.connection({
  port: 3000
});

epimetheus.instrument(this.server);

server.route({
  method: 'GET',
  path: '/',
  handler: (req, resp) => {
    resp();
  }
});

server.start(() => {
  console.log('hapi server listening on port 3000');
});
```
# <a name="restify"></a> Restify
```
const restify = require('restify');
const epimetheus = require('epimetheus');

const server = restify.createServer();

epimetheus.instrument(this.server);

server.get('/', (req, res, done) => {
  res.send();
  done();
});

server.listen(3000, () => {
  console.log('restify server listening on port 3000');
});

```

# Try It Out
The docker-compose.yml file in the examples directory will create a prometheus server and an example each of an [http](#http), [express](#express), [hapi](#hapi) and [restify](#restify) server.

Assuming you have installed [docker](https://docs.docker.com) and [docker-compose](https://docs.docker.com/compose/install/), you can try it out by doing the following:

```
> cd examples
> docker-compose up
```

You can then view the prometheus server on [http://127.0.0.1:9090](http://127.0.0.1:9090)

# Etymology

![Epimetheus](http://www.greekmythology.com/images/mythology/epimetheus_28.jpg)

Epimetheus was one of the Titans and the brother of Prometheus
His name is derived from the Greek word meaning 'afterthought',
which is the antonym of his brother's name, Prometheus, meaning 'forethought'.
