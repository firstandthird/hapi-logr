<h1 align="center">hapi-logr</h1>

<p align="center">
  <a href="https://github.com/firstandthird/hapi-logr/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/hapi-logr/Test/main?label=Tests&style=for-the-badge" alt="Test Status"/>
  </a>
  <a href="https://github.com/firstandthird/hapi-logr/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/hapi-logr/Lint/main?label=Lint&style=for-the-badge" alt="Lint Status"/>
  </a>
  <img src="https://img.shields.io/npm/v/hapi-logr.svg?label=npm&style=for-the-badge" alt="NPM" />
</p>

Hapi plugin to integrate logr reporters

## Instalation

```sh
npm install hapi-logr
```

_or_

```sh
yarn add hapi-logr
```

## Usage

```javascript
const Hapi = require('@hapi/hapi');
const server = new Hapi.Server();
await server.register({
  plugin: require('hapi-logr'),
  options: { // logr-all options can be set here
    unhandledRejection: true
    uncaughtException: true
  }
});

// Logr handles this
server.log(['start'], { message: 'server started', uri: server.info.uri });
```


---

<a href="https://firstandthird.com"><img src="https://firstandthird.com/_static/ui/images/safari-pinned-tab-62813db097.svg" height="32" width="32" align="right"></a>

_A [First + Third](https://firstandthird.com) Project_
