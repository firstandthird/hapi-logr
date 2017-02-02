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
      renderOptions: {
        console: {
          colors: false,
          pretty: true
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
        console.log = oldLog;
        code.expect(input).to.include('[start]');
        const obj = JSON.parse(input.split('[start]')[1]);
        code.expect(obj.message).to.equal('server started');
        done();
      };
      server.log(['start'], { message: 'server started', uri: server.info.uri });
    });
  });
});
