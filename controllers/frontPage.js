const frontPageTpl = require('../templates/frontPage');

function handle (request, response) {
  response.end(frontPageTpl({
    title: 'Home page'
  }));
}

module.exports = {
  handle
};