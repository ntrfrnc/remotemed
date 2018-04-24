const db = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');

async function add(username, password, role) {
  const users = await db.getCollection('Users');
  const user = await users.findOne({'username': username});
  if (user) {
    throw new Error('User already exists: ' + username);
  }

  const passHash = await bcrypt.hash(password, 10);
  await users.insertOne({
    'username': username,
    'password': passHash,
    'role': Number(role)
  });

  return true;
}

async function authenticate(username, password) {
  if (!username || !password) {
    return false;
  }

  const users = await db.getCollection('Users');
  const user = await users.findOne({'username': username});

  if (!user) {
    return false;
  }

  const correct = bcrypt.compare(password, user.password);

  return correct ? user : false;
}

const loggedIn = (function () {
  const loggedIn = Symbol('loggedIn');

  return async function (request) {
    if (request[loggedIn] !== void(0)) {
      return request[loggedIn];
    }
    if (!request.session || !request.session.userID) {
      return false;
    }

    const users = await db.getCollection('Users');
    request[loggedIn] = await users.findOne({'_id': new ObjectID(request.session.userID)});
    return request[loggedIn];
  }
})();

async function logIn(username, password, request) {
  const user = await authenticate(username, password);

  if (user) {
    request.session.userID = user._id.toString();
    return user;
  } else {
    return false;
  }
}

function logOut(request) {
  request.session.reset();
}

module.exports = {
  add,
  loggedIn,
  logIn,
  logOut
};
