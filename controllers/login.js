const pageTpl = require('../templates/page');
const loginTpl = require('../templates/loginForm');

function handle (request, response) {
  response.end(pageTpl({
    title: 'Logowanie',
    content: loginTpl({
      formActionPath: '/login'
    })
  }));
}

module.exports = {
  handle
};
