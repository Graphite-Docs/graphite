'use strict';

/**
 * Set a server header
 *
 * @param   {Object}    server      Hapi server
 * @param   {String}    key         Header key
 * @param   {*}         value       Header value
 */
module.exports = (server, key, value) => {
  if (!(server && typeof server.ext === 'function')) {
    throw new TypeError('server.ext is not a function');
  }
  if (!(key && typeof key === 'string')) {
    throw new TypeError('Invalid header key');
  }
  server.ext('onPreResponse', (request, reply) => {
    const response = request.response;
    if (request.response.isBoom) {
      response.output.headers[key] = value;
    } else {
      response.header(key, value);
    }
    reply.continue();
  });
};
