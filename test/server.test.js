'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();
const Boom = require('boom');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

lab.test('test server is initialized ', async () => {
  const server = new Hapi.Server({ port: 8081 });
  await server.register({
    plugin: require('../'),
    options: {
      async logger(input) {
        code.expect(input).to.include('[start] {"message":"server started","uri":"http://');
        await server.stop();
      }
    }
  });
  await server.start();
  server.log(['start'], { message: 'server started', uri: server.info.uri });
  await wait(500);
});

lab.test('option to log all routes ', async() => {
  const all = [];
  const server = new Hapi.Server({ port: 8081 });
  await server.register({
    plugin: require('../'),
    options: {
      requests: true,
      logger(output) {
        // get the logged objects back as json and save them:
        all.push(JSON.parse(output.split(']')[1]));
      }
    }
  });
  server.route({
    method: 'GET',
    path: '/test',
    handler(request, h) {
      return 'hello';
    }
  });
  server.route({
    method: 'GET',
    path: '/error',
    handler(request, h) {
      throw new Error('hello');
    }
  });
  server.route({
    method: 'GET',
    path: '/warning',
    handler(request, h) {
      throw Boom.notFound('hello');
    }
  });
  server.route({
    method: 'GET',
    path: '/notice',
    handler(request, h) {
      return h.redirect('hello');
    }
  });
  await server.start();
  await server.inject({
    url: '/test?query=param1',
    method: 'GET'
  });
  await server.inject({
    url: '/notice',
    method: 'GET'
  });
  await server.inject({
    url: '/warning',
    method: 'GET'
  });
  await server.inject({
    url: '/error',
    method: 'GET'
  });
  // wait a bit so event lifecycle is completely processed:
  await wait(500);
  await server.stop();
  code.expect(all.length).to.equal(4);
  code.expect(Object.keys(all[0])).to.equal(['event', 'method', 'path', 'timestamp', 'query', 'userAgent', 'browser', 'statusCode', 'responseTime', 'info', 'httpVersion']);
  code.expect(all[0].path).to.equal('/test?query=param1');
  code.expect(Object.keys(all[1])).to.equal(['event', 'method', 'path', 'timestamp', 'query', 'userAgent', 'browser', 'statusCode', 'responseTime', 'info', 'httpVersion']);
  code.expect(all[1].path).to.equal('/notice');
  code.expect(Object.keys(all[2])).to.equal(['event', 'method', 'path', 'timestamp', 'query', 'userAgent', 'browser', 'statusCode', 'responseTime', 'info', 'httpVersion']);
  code.expect(all[2].path).to.equal('/warning');
  code.expect(Object.keys(all[3])).to.equal(['event', 'method', 'path', 'timestamp', 'query', 'userAgent', 'browser', 'statusCode', 'responseTime', 'info', 'httpVersion']);
  code.expect(all[3].path).to.equal('/error');
});
