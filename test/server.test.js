'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

lab.test('test server is initialized ', (done) => {
  const server = new Hapi.Server();
  server.connection({ port: 8081 });

  server.register({
    register: require('../'),
    options: {
      reporters: {
        consoleColor: {
          reporter: 'logr-console-color',
          options: {
          }
        }
      }
    }
  }, (err) => {
    if (err) {
      throw err;
    }
    server.start((startErr) => {
      code.expect(startErr).to.equal(undefined);
      const oldLog = console.log;
      console.log = (input) => {
        console.warn(input);
        console.log = oldLog;
        code.expect(input).to.include('start');
        code.expect(input).to.include('uri');
        code.expect(input).to.include('server started');
        done();
      };
      server.log(['start'], { message: 'server started', uri: server.info.uri });
    });
  });
});
