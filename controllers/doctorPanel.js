const pageTpl = require('../templates/page');
const doctorPanelTpl = require('../templates/doctorPanel');

function handle (request, response) {
  response.end(pageTpl({
    title: 'Panel lekarza',
    content: doctorPanelTpl({

    })
  }));
}

module.exports = {
  handle
};
