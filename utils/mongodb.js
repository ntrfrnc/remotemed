const config = require('../config').db;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.name}`;

let _db;

async function connect() {
  const client = await MongoClient.connect(uri);
  return client.db(config.name);
}

function disconnect() {
  return _db.close();
}

async function connection() {
  return _db ? _db : await connect();
}

async function getCollection(collectionName) {
  const db = await connection();
  return db.collection(collectionName);
}

module.exports = {
  connection,
  disconnect,
  getCollection
};
