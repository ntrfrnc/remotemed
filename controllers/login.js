const pageTpl = require('../templates/page');
const loginTpl = require('../templates/loginForm');
const t = require('../utils/translate');

function handle (request, response) {
  response.end(pageTpl({
    title: t('loginPage'),
    content: loginTpl({
      formActionPath: '/login'
    })
  }));
}

module.exports = {
  handle
};
