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
      reporters: {
        consoleColor: {
          reporter: 'logr-console-color',
          options: {
          }
        }
      }
    }
  });
  await server.start();
  server.events.on('log', async (event, tags) => {
    code.expect(tags).to.equal({ start: true });
    code.expect(typeof event.timestamp).to.equal('number');
    code.expect(event.data.uri.startsWith('http://')).to.equal(true);
    code.expect(event.data.message).to.equal('server started');
    await server.stop();
  });
  //   code.expect(input).to.include('uri');
  server.log(['start'], { message: 'server started', uri: server.info.uri });
  await wait(500);
});

lab.test('option to log all routes ', async() => {
  const server = new Hapi.Server({ port: 8081 });

  await server.register({
    plugin: require('../'),
    options: { requests: true }
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
  const oldLog = console.log;
  const all = [];
  const acc = (input) => {
    all.push(input);
  };
  console.log = acc;
  const response = await server.inject({
    url: '/test?query=param1',
    method: 'GET'
  });
  const response2 = await server.inject({
    url: '/notice',
    method: 'GET'
  });
  const response3 = await server.inject({
    url: '/warning',
    method: 'GET'
  });
  const response4 = await server.inject({
    url: '/error',
    method: 'GET'
  });
  // wait a bit so event lifecycle is completely processed:
  await wait(500);
  await server.stop();
  code.expect(all[0]).to.include('path');
  code.expect(all[0]).to.include('responseTime');
  code.expect(all[0]).to.include('param1');
  code.expect(all[1]).to.include('path');
  code.expect(all[1]).to.include('responseTime');
  code.expect(all[1]).to.include('request,notice');
  code.expect(all[2]).to.include('request,warning');
  code.expect(all[3]).to.include('request,error');
});
