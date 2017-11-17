'use strict';

const run = async() => {
  const Hapi = require('hapi');
  const server = new Hapi.Server({ port: 8085 });
  await server.register({
    plugin: require('../'),
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
  });
  await server.start();
  server.route({
    path: '/error',
    method: 'get',
    handler: (request, h) => {
      throw new Error('some error here');
    }
  });
  server.route({
    path: '/ok',
    method: 'get',
    handler: (request, h) => {
      return 'it`s all good';
    }
  });
  server.log(['start'], { message: 'server started', uri: server.info.uri });
};

run();
