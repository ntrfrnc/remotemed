const pageTpl = require('../templates/page');
const patientPanelTpl = require('../templates/patientPanel');
const t = require('../utils/translate');
const User = require('../models/User');

async function handle (request, response) {
  const user = await User.loggedIn(request);

  if (!user || user.role !== 1) {
    response.statusCode = 403;
    response.write('Access forbidden.');
    return true;
  }

  response.write(pageTpl({
    title: t('patientPanel'),
    content: patientPanelTpl({

    })
  }));
}

module.exports = {
  handle
};
