const pageTpl = require('../templates/page');
const loginTpl = require('../templates/loginForm');
const t = require('../utils/translate');
const tools = require('../utils/tools');
const User = require('../models/User');

async function handle(request, response, path) {
  switch (request.method) {
    case 'GET':
      await handleGet(request, response, path);
      return true;

    case 'POST':
      await handlePost(request, response, path);
      return true;

    default:
      return false;
  }
}

async function handleGet(request, response, path) {
  const user = await User.loggedIn(request);

  if (user) {
    redirectUserToPanel(user, response);
  } else {
    showLoginPage(response, path);
  }
}

async function handlePost(request, response, path) {
  const user = await User.logIn(request.body.username, request.body.password, request);

  if (user) {
    redirectUserToPanel(user, response);
  } else {
    showLoginPage(response, path, t('incorrectLoginPass'));
  }
}

function showLoginPage(response, path, error) {
  response.write(pageTpl({
    title: t('loginPage'),
    pageClass: 'page--login',
    content: loginTpl({
      formActionPath: path
    }),
    message: error ? {
      type: 'error',
      content: error
    } : false
  }));
}

function redirectUserToPanel(user, response) {
  switch (user.role) {
    case 1:
      tools.goto('/patient-panel', response);
      break;
    case 2:
      tools.goto('/doctor-panel', response);
      break;
    default:
      throw new Error('Don\'t know what to do with user role: ' + user.role);
  }
}

module.exports = {
  handle
};
