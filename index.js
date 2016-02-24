'use strict';

const Logr = require('logr');
exports.register = function(server, options, next) {
  const log = new Logr(options);

  server.on('log', (event, tags) => {
    log(event.tags, event.data);
  });
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
