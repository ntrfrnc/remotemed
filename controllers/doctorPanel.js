const pageTpl = require('../templates/page');
const doctorPanelTpl = require('../templates/doctorPanel');
const t = require('../utils/translate');
const User = require('../models/User');
const db = require('../utils/mongodb');

async function handle(request, response) {
  const user = await User.loggedIn(request);

  if (!user || user.role !== 2) {
    response.statusCode = 403;
    response.write('Access forbidden.');
    return true;
  }

  let patients;

  if (user.patientsID && user.patientsID.length > 0) {
    patients = await (await db.getCollection('Users')).find({
      _id: {$in: user.patientsID}
    }, {
      projection: {username: 1}
    }).toArray();
  }

  response.write(pageTpl({
    title: t('doctorPanel'),
    pageClass: 'page--doctor-panel',
    content: doctorPanelTpl({
      patients: patients
    }),
    user: user,
    scripts: ['/public/js/doctorPanel.js'],
    css: ['/public/css/doctorPanel.css']
  }));

  return true;
}

module.exports = {
  handle
};
