const pageTpl = require('../templates/page');
const doctorPanelTpl = require('../templates/doctorPanel');
const t = require('../utils/translate');
const User = require('../models/User');
const db = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;
const DataPacket = require('../utils/DataPacket');

async function handle(request, response) {
  const user = await User.loggedIn(request);

  if (!user || user.role !== 2) {
    response.statusCode = 403;
    response.write('Access forbidden.');
    return true;
  }

  switch (request.method) {
    case 'GET':
      return await handleGet(request, response);

    case 'POST':
      return await handlePost(request, response);

    default:
      return false;
  }
}

async function handleGet(request, response) {
  const user = await User.loggedIn(request);

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

async function handlePost(request, response) {
  const user = await User.loggedIn(request);

  switch (request.body.command) {
    case 'getExaminations':
      try {
        const examinations = await (await db.getCollection('Examinations')).find({
          userID: new ObjectID(request.body.userID)
        }, {
          projection: {name: 1, date: 1, samplingFrequency: 1, dataType: 1, series: 1}
        }).toArray();
        response.write(JSON.stringify(examinations));
      } catch (e) {
        response.statusCode = 500;
        response.write(e.message);
      }
      return true;

    case 'getExaminationData':
      try {
        const examination = await (await db.getCollection('Examinations')).findOne({
          _id: new ObjectID(request.body.examinationID)
        });

        // TODO: permission check

        const packet = new DataPacket({
          data: examination.values,
          dataType: examination.dataType,
          nSeries: examination.series.length
        });
        response.writeHeader(200, {'Content-Type': 'application/octet-stream'});
        response.write(packet.toBuffer());
      } catch (e) {
        response.statusCode = 500;
        response.write(e.message);
      }
      return true;

    default:
      response.statusCode = 501;
      response.write('Command not recognized.');
      return true;
  }
}

module.exports = {
  handle
};
