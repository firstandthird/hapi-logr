'use strict';

const Logr = require('logr');
const userAgentLib = require('useragent');

const register = async function(server, options) {
  const log = Logr.createLogger(options);

  server.events.on('log', (event, tags) => {
    if (!event.data) {
      return;
    }
  });
  if (options.requests === true) {
    // run this once per request:
    server.events.on('response', (request) => {
      const data = {
        event: 'request',
        method: request.method,
        path: request.url.path,
        id: request.id,
        timestamp: request.info.received,
        query: Object.assign({}, request.query),
        userAgent: (request.headers) ? request.headers['user-agent'] : '',
        browser: (request.headers) ? userAgentLib.parse(request.headers['user-agent']).toString() : '',
        statusCode: request.response.statusCode,
        instance: request.info.uri,
        responseTime: Date.now() - request.info.received,
        info: request.info,
        httpVersion: request.raw.req.httpVersion
      };
      const tags = ['request'];
      if (request.response.statusCode >= 500) {
        tags.push('error');
      } else if (request.response.statusCode >= 400) {
        tags.push('warning');
      } else if (request.response.statusCode >= 300) {
        tags.push('notice');
      }
      log(tags, data, {});
    });
  }
};

exports.plugin = {
  register,
  once: true,
  pkg: require('./package.json')
};
