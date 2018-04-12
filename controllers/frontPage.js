const frontPageTpl = require('../templates/frontPage');

function handle (request, response) {
  response.write(frontPageTpl({
    title: 'Home page'
  }));
}

module.exports = {
  handle
};