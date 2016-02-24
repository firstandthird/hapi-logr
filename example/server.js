'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 8085 });

server.register({
  register: require('../'),
  options: {

  }
}, (err) => {
  if (err) {
    throw err;
  }
  server.start((startErr) => {
    if (startErr) {
      throw startErr;
    }

    server.log(['start'], { message: 'server started', uri: server.info.uri });
  });
});
