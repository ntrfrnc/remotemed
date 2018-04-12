const tools = require('../utils/tools');
const User = require('../models/User');

function handle (request, response, path) {
  User.logOut(request);
  tools.goto('/login', response);
  return true;
}

module.exports = {
  handle
};
