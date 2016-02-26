'use strict';

const Logr = require('logr');
exports.register = function(server, options, next) {
  const log = new Logr(options);

  server.on('log', (event, tags) => {
    log(event.tags, event.data);
  });

  server.on('request-internal', (request, event, tags) => {
    if (tags.error) {
      const data = {
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
