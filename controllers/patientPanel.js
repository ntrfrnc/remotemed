const pageTpl = require('../templates/page');
const patientPanelTpl = require('../templates/patientPanel');

function handle (request, response) {
  response.end(pageTpl({
    title: 'Panel pacjenta',
    content: patientPanelTpl({

    })
  }));
}

module.exports = {
  handle
};
