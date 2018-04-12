const http = require('http');
const connect = require('connect');
const session = require('client-sessions');
var bodyParser = require('body-parser');
const config = require('./config');
const routing = require('./utils/routingHandler');

global.appRoot = __dirname;

const app = connect();
const server = http.createServer(app);

app.use(session({
  cookieName: 'session',
  secret: '71y2n_0x!$npU3d$@#[{,u-H>xb}m',
  duration: 2 * 60 * 60 * 1000, // 2h
  activeDuration: 15 * 60 * 1000 // 15min
}));

// app.use(session({
//   name: 'session',
//   keys: ['71y2n_0x!$npU3d$@#[{,u-H>xb}m', 'bsr14B.hs)^2s[G4BHad37<d)#'],
//   maxAge: 2 * 60 * 60 * 1000, // 2h
// }));

app.use(bodyParser.urlencoded({extended: true}));

app.use(routing);

server.listen(config.server.port, () => {
  console.log('App running at port:', config.server.port);
});
