const lograll = require('logr-all');

const register = function(server, options) {
  const log = lograll(options);

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
