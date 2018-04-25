const db = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;

async function assignPatientToDoctor(patient, doctorID) {
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
  assignPatientToDoctor
};