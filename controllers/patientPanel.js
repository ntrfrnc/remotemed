const pageTpl = require('../templates/page');
const patientPanelTpl = require('../templates/patientPanel');
const t = require('../utils/translate');
const User = require('../models/User');
const db = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;

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
    scripts: ['/public/js/patientPanel.js']
  }));

  return true;
}

async function handlePost(request, response) {
  const user = await User.loggedIn(request);

  switch (request.body.command) {
    case 'setDoctorForPatient':
      try {
        await setDoctorForPatient(user, request.body.doctorID);
        response.write('success');
        return true;
      } catch (e) {
        response.statusCode = 500;
        response.write(e.message);
        return true;
      }
    default:
      response.statusCode = 501;
      response.write('Command not recognized.');
      return true;
  }
}

async function setDoctorForPatient(patient, doctorID) {
  if (patient.doctorID && patient.doctorID.toString() === doctorID) {
    return;
  }

  if (!doctorID || doctorID === 'none') {
    if (!patient.doctorID) {
      return;
    }

    // Remove doctor from user
    await (await db.getCollection('Users')).updateOne({_id: patient._id}, {
      $unset: {
        doctorID: ''
      }
    });

  } else {
    const doctorObjID = new ObjectID(doctorID);

    // Set doctor for user
    await (await db.getCollection('Users')).updateOne({_id: patient._id}, {
      $set: {
        doctorID: doctorObjID
      }
    });

    // Add patient to new doctor
    await (await db.getCollection('Users')).updateOne({_id: doctorObjID}, {
      $addToSet: {
        patientsID: patient._id
      }
    });
  }

  // Remove patient from previous doctor
  await (await db.getCollection('Users')).updateOne({_id: patient.doctorID}, {
    $pull: {
      patientsID: patient._id
    }
  });
}

module.exports = {
  handle
};
