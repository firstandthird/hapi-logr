'use strict';
const Hapi = require('hapi');
const code = require('code');
const lab = exports.lab = require('lab').script();
const Boom = require('boom');

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
  const oldLog = console.log;
  console.log = async (input) => {
    console.warn(input);
    console.log = oldLog;
    code.expect(input).to.include('start');
    code.expect(input).to.include('uri');
    code.expect(input).to.include('server started');
    await server.stop();
  };
  server.log(['start'], { message: 'server started', uri: server.info.uri });
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
  ms => new Promise(resolve => setTimeout(resolve, ms))(1000);
  // wait a bit so event lifecycle is completely processed:
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

lab.test('can change client errors to warnings ', async() => {
  const server = new Hapi.Server({ port: 8081 });
  await server.register({
    plugin: require('../'),
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
  });
  await server.start();
  const oldLog = console.log;

  console.log = async(input) => {
    console.warn(input);
    console.log = oldLog;
    code.expect(input).to.include('warning');
    code.expect(input).to.not.include('error');
    await server.stop();
  };
  server.log(['error', 'client'], new Error('server started'));
});
