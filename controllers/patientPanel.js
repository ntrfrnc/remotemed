const pageTpl = require('../templates/page');
const patientPanelTpl = require('../templates/patientPanel');
const t = require('../utils/translate');

function handle (request, response) {
  response.end(pageTpl({
    title: t('patientPanel'),
    content: patientPanelTpl({

    })
  }));
}

module.exports = {
  handle
};
