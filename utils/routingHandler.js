const url = require('url');
const path = require('path');
const fs = require('fs');
const util = require('util');
const routes = require('../routes');

async function http(request, response, next) {
  const pathName = url.parse(request.url).pathname;
  let resolved = false;

  if (pathName.substr(0, 7) === '/public') {
    resolved = await handleStatic(pathName, response);
  } else {
    for (let route of routes) {
      if (pathName === route.path && route.controller) {
        try {
          const controller = require('../controllers/' + route.controller);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/html');

          resolved = await controller.handle(request, response, route.path);
        } catch (e) {
          console.log(`Controller "${route.controller}" error, message:\n`, e);
        }

        break;
      }
    }
  }

  if (!resolved) {
    response.statusCode = 404;
    response.write('Page not found');
  }

  response.end();

  if (typeof next === 'function') {
    next();
  }
}

async function ws(wss, request, socket, head, next) {
  const pathName = url.parse(request.url).pathname;
  let resolved = false;

  for (let route of routes) {
    if (pathName === route.path && route.wsController) {
      try {
        const controller = require('../controllers/' + route.wsController);

        resolved = await controller.handleUpgrade(wss, request, socket, head, route.path);
      } catch (e) {
        console.log(`Controller "${route.wsController}" error, message:\n`, e);
      }

      break;
    }
  }

  if (!resolved) {
    socket.destroy();
  }

  if (typeof next === 'function') {
    next();
  }
}

async function handleStatic(pathName, response) {
  const ctMap = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword'
  };

  try {
    const data = await util.promisify(fs.readFile)(global.appRoot + pathName);
    response.writeHead(200, {'Content-Type': ctMap[path.extname(pathName)] || 'text/plain'});
    response.write(data);

    return true;

  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  http,
  ws
};
