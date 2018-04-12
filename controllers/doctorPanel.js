const pageTpl = require('../templates/page');
const doctorPanelTpl = require('../templates/doctorPanel');
const t = require('../utils/translate');
const User = require('../models/User');

async function handle(request, response) {
  const user = await User.loggedIn(request);

  if (!user || user.role !== 2) {
    response.statusCode = 403;
    response.write('Access forbidden.');
    return true;
  }

  response.write(pageTpl({
    title: t('doctorPanel'),
    pageClass: 'page--doctor-panel',
    content: doctorPanelTpl({
      content: 'test content'
    }),
    user: user
  }));

  return true;
}

module.exports = {
  handle
};
