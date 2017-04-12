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
        server.stop(done);
      };
      server.log(['start'], { message: 'server started', uri: server.info.uri });
    });
  });
});

lab.test('option to log all routes ', (done) => {
  const server = new Hapi.Server();
  server.connection({ port: 8081 });

  server.register({
    register: require('../'),
    options: {
      requests: true
    }
  }, (err) => {
    if (err) {
      throw err;
    }
    server.route({
      path: '/test',
      method: 'GET',
      handler(request, reply) {
        reply('hello');
      }
    });
    server.start((startErr) => {
      const oldLog = console.log;
      const all = [];
      console.log = (input) => {
        all.push(input);
      };
      server.inject({
        url: '/test',
        method: 'GET'
      }, response => {
        console.log = oldLog;
        server.stop(() => {
          code.expect(all[0]).to.include('referrer');
          code.expect(all[0]).to.include('hostname');
          code.expect(all[0]).to.include('userAgent');
          done();
        });
      });
    });
  });
});
