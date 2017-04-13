'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 8085 });

server.register({
  register: require('../'),
  options: {
    requests: true,
    reporters: {
      console: {
        reporter: require('logr-console-color')
      },
      flat: {
        reporter: require('logr-flat')
      }
    }
  }
}, (err) => {
  if (err) {
    throw err;
  }
  server.start((startErr) => {
    if (startErr) {
      throw startErr;
    }

    server.route({
      path: '/error',
      method: 'get',
      handler: (request, reply) => {
        reply(new Error('some error here'));
      }
    });
    server.route({
      path: '/ok',
      method: 'get',
      handler: (request, reply) => {
        reply('it`s all good');
      }
    });

    server.log(['start'], { message: 'server started', uri: server.info.uri });
  });
});
