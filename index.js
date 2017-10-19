'use strict';

const Logr = require('logr');
const userAgentLib = require('useragent');

exports.register = function(server, options, next) {
  // see if there's a default log reporter that was requested:
  // cli log type:
  if (options.logType === 'cli') {
    options.reporters = {
      console: {
        reporter: require('logr-console-color')
      }
    };
  } else if (options.logType === 'flat') {
    options.reporters = {
      console: {
        reporter: require('logr-flat')
      }
    };
  }
  const log = Logr.createLogger(options);

  server.on('log', (event, tags) => {
    if (!event.data) {
      return;
    }
    if (options.clientErrorsToWarnings && event.tags.indexOf('error') !== -1 && event.tags.indexOf('client') !== -1) {
      event.tags[event.tags.indexOf('error')] = 'warning';
    }
    log(event.tags, event.data, { addErrorTagToErrors: !options.clientErrorsToWarnings });
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
        query: Object.assign({}, request.query),
        userAgent: (request.headers) ? request.headers['user-agent'] : '',
        browser: (request.headers) ? userAgentLib.parse(request.headers['user-agent']).toString() : '',
        statusCode: request.response.statusCode,
        instance: request.connection.info.uri,
        labels: request.connection.settings.labels,
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
      log(tags, data, { addErrorTagToErrors: !options.clientErrorsToWarnings });
    });
  }
  server.on('request-internal', (request, event, tags) => {
    if (tags.error && tags.internal) {
      const browser = (request.headers) ? userAgentLib.parse(request.headers['user-agent']).toString() : '';
      const userAgent = (request.headers) ? request.headers['user-agent'] : '';
      const data = {
        method: request.method,
        url: request.url.href,
        userAgent,
        browser,
        message: event.data.message,
        stack: event.data.stack
      };
      if (request.headers.referrer) {
        data.referrer = request.headers.referrer;
      }
      if (options.clientErrorsToWarnings && event.tags.indexOf('error') !== -1 && event.tags.indexOf('client') !== -1) {
        event.tags[event.tags.indexOf('error')] = 'warning';
      }
      log(event.tags, data, { addErrorTagToErrors: !options.clientErrorsToWarnings });
    }
  });
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
