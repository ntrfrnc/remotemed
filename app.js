const routes = require('./routes');
const url = require('url');
const path = require('path');
const fs = require('fs');
const util = require('util');

async function handleRequest(request, response) {
  const pathName = url.parse(request.url).pathname;
  let resolved = false;

  if (pathName.substr(0, 7) === '/public') {
    resolved = await handleStatic(pathName, response);
  } else {
    for (let route of routes) {
      if (pathName === route.path) {
        try {
          const controller = require('./controllers/' + route.controller);
          response.writeHead(200, {'Content-Type': 'text/html'});
          resolved = true;

          controller.handle(request, response);
        } catch (e) {
          console.log(`Controller "${route.controller}" not found, error message:\n`, e);
        }

        break;
      }
    }
  }

  if (!resolved) {
    response.writeHead(404);
    response.end('Page not found');
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
    const data = await util.promisify(fs.readFile)(__dirname + pathName);
    response.writeHead(200, {'Content-Type': ctMap[path.extname(pathName)] || 'text/plain'});
    response.end(data);

    return true;

  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  handleRequest
};