'use strict';

const Logr = require('logr');

const register = function(server, options) {
  const log = Logr.createLogger(options);

  server.events.on('log', (event, tags) => {
    if (!event.data && !event.error) {
      return;
    }
    log(event.tags, event.data || event.error, {});
  });
};

exports.plugin = {
  register,
  once: true,
  pkg: require('./package.json')
};
