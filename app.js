const http = require('http');
const connect = require('connect');
const session = require('client-sessions');
const bodyParser = require('body-parser');
const config = require('./config');
const routing = require('./utils/routingHandler');
const WebSocket = require('ws');

global.appRoot = __dirname;

// Http server
const app = connect();
const server = http.createServer(app);
const sessionHandler = session({
  cookieName: 'session',
  secret: '71y2n_0x!$npU3d$@#[{,u-H>xb}m',
  duration: 2 * 60 * 60 * 1000, // 2h
  activeDuration: 15 * 60 * 1000 // 15min
});

app.use(sessionHandler);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(routing.http);

// WebSocket server
const wss = new WebSocket.Server({
  noServer: true
});

server.on('upgrade', async (request, socket, head) => {
  // TODO: same origin protection
  sessionHandler(request, {socket}, () => {});
  await routing.ws(wss, request, socket, head);
});

// Start listening
server.listen(config.server.port, () => {
  console.log('App running at port:', config.server.port);
});
