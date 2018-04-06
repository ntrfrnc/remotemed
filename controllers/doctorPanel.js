const pageTpl = require('../templates/page');
const doctorPanelTpl = require('../templates/doctorPanel');
const t = require('../utils/translate');

function handle (request, response) {
  response.end(pageTpl({
    title: t('doctorPanel'),
    content: doctorPanelTpl({

    })
  }));
}

module.exports = {
  handle
};
