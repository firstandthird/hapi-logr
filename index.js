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
    server.on('tail', (request) => {
      const data = {
        event: 'request',
        method: request.method,
        path: request.url.path,
        id: request.id,
        timestamp: request.info.received,
        query: request.query,
        userAgent: (request.headers) ? request.headers['user-agent'] : '',
        statusCode: request.response.statusCode,
        instance: request.connection.info.uri,
        labels: request.connection.settings.labels,
        responseTime: Date.now() - request.info.received,
        info: request.info,
        httpVersion: request.raw.req.httpVersion
      };
      const tags = ['hapi-logr'];
      if (request.response.statusCode >= 500) {
        tags.push('error');
      } else if (request.response.statusCode >= 400) {
        tags.push('warning');
      } else if (request.response.statusCode >= 300) {
        tags.push('notice');
      }
      log(tags, data);
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
