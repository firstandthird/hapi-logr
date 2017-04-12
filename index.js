'use strict';

const Logr = require('logr');
exports.register = function(server, options, next) {
  const log = new Logr.createLogger(options);

  server.on('log', (event, tags) => {
    if (!event.data) {
      return;
    }
    log(event.tags, event.data);
  });
  if (options.requests === true) {
    // run this once per request:
    server.ext('onRequest', (request, reply) => {
      const data = {
        event: 'request',
        path: `${request.method.toUpperCase()} ${request.url.path}`,
        id: request.id,
        userAgent: (request.headers) ? request.headers['user-agent'] : '',
        info: request.info
      };
      log(['hapi-logr', 'request'], data);
      reply.continue();
    });
  }
  server.on('request-internal', (request, event, tags) => {
    if (tags.error && tags.internal) {
      const userAgent = (request.headers) ? request.headers['user-agent'] : '';
      const data = {
        method: request.method,
        url: request.url.href,
        userAgent,
        message: event.data.message,
        stack: event.data.stack
      };
      log(event.tags, data);
    }
  });
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
