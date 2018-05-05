const pageTpl = require('../templates/page');
const patientPanelTpl = require('../templates/patientPanel');
const t = require('../utils/translate');
const User = require('../models/User');
const db = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;
const RelationsHandler = require('../models/RelationsHandler');
const DataPacket = require('../utils/DataPacket');

async function handle(request, response) {
  const user = await User.loggedIn(request);

  if (!user || user.role !== 1) {
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

  const doctors = await (await db.getCollection('Users')).find({
    'role': 2
  }, {
    projection: {username: 1}
  }).toArray();

  if (user.doctorID) {
    doctors.forEach(doctor => {
      if (doctor._id.toString() === user.doctorID.toString()) {
        doctor.selected = true;
      }
    });
  }

  response.write(pageTpl({
    title: t('patientPanel'),
    pageClass: 'page--patient-panel',
    content: patientPanelTpl({
      doctors: doctors
    }),
    user: user,
    scripts: ['/public/js/patientPanel.js'],
    css: ['/public/css/patientPanel.css']
  }));

  return true;
}

async function handlePost(request, response) {
  const user = await User.loggedIn(request);

  switch (request.body.command) {
    case 'setDoctorForPatient':
      try {
        await RelationsHandler.assignPatientToDoctor(user, request.body.doctorID);
        response.write('success');
      } catch (e) {
        response.statusCode = 500;
        response.write(e.message);
      }
      return true;

    case 'getExaminations':
      try {
        const examinations = await (await db.getCollection('Examinations')).find({
          userID: user._id
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
          userID: user._id,
          _id: new ObjectID(request.body.examinationID)
        });

        if (examination.userID.toString() !== user._id.toString()) {
          response.statusCode = 403;
          response.write('Access forbidden');
          return true;
        }

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
