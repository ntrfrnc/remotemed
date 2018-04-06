const http = require('http');
const config = require('./config').server;
const app = require('./app');

const server = http.createServer(app.handleRequest);

server.listen(config.port, () => {
  console.log('App running at port:', config.port);
});
