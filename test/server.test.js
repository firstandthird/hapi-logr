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
      method: 'GET',
      path: '/test',
      handler(request, reply) {
        reply('hello');
      }
    });
    server.route({
      method: 'GET',
      path: '/error',
      handler(request, reply) {
        reply('hello').code(500);
      }
    });
    server.route({
      method: 'GET',
      path: '/warning',
      handler(request, reply) {
        reply('hello').code(404);
      }
    });
    server.route({
      method: 'GET',
      path: '/notice',
      handler(request, reply) {
        reply('hello').code(300);
      }
    });

    server.start((startErr) => {
      const oldLog = console.log;
      const all = [];
      const acc = (input) => {
        all.push(input);
      };
      console.log = acc;
      server.inject({
        url: '/test?query=param1',
        method: 'GET'
      }, response => {
        server.inject({
          url: '/notice',
          method: 'GET'
        }, response2 => {
          server.inject({
            url: '/warning',
            method: 'GET'
          }, response3 => {
            server.inject({
              url: '/error',
              method: 'GET'
            }, response4 => {
              // wait a bit so tail events are processed:
              setTimeout(() => {
                console.log = oldLog;
                server.stop(() => {
                  code.expect(all[0]).to.include('path');
                  code.expect(all[0]).to.include('responseTime');
                  code.expect(all[0]).to.include('param1');
                  code.expect(all[1]).to.include('path');
                  code.expect(all[1]).to.include('responseTime');
                  code.expect(all[1]).to.include('request,notice');
                  code.expect(all[2]).to.include('request,warning');
                  code.expect(all[3]).to.include('request,error');
                  done();
                });
              }, 1000);
            });
          });
        });
      });
    });
  });
});

lab.test('can change client errors to warnings ', (done) => {
  const server = new Hapi.Server();
  server.connection({ port: 8081 });

  server.register({
    register: require('../'),
    options: {
      clientErrorsToWarnings: true,
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
        code.expect(input).to.include('warning');
        code.expect(input).to.not.include('error');
        server.stop(done);
      };
      server.log(['error', 'client'], new Error('server started'));
    });
  });
});
