'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

lab.test('test server is initialized ', async () => {
  const server = new Hapi.Server({ port: 8081 });
  let called = false;
  await server.register({
    plugin: require('../'),
    options: {
      logger(input) {
        code.expect(input).to.include('[start] {"message":"server started","uri":"http://');
        called = true;
      }
    }
  });
  await server.start();
  server.log(['start'], { message: 'server started', uri: server.info.uri });
  await wait(500);
  await server.stop();
  code.expect(called).to.equal(true);
});
