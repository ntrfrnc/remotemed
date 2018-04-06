const config = require('../config').db;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.name}`;

let _db;

function connect() {
  return MongoClient.connect(uri);
}

function disconnect() {
  return _db.close();
}

function connection() {
  return _db ? _db : connect();
}

module.exports = {
  connection,
  disconnect
};
