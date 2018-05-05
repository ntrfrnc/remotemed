const User = require('../models/User');
const db = require('../utils/mongodb');
const DataPacket = require('../utils/DataPacket');
const WebSocket = require('ws');

async function handleUpgrade(wss, request, socket, head) {
  const user = await User.loggedIn(request);
  if (!user || user.role !== 1) {
    return false;
  }

  wss.handleUpgrade(request, socket, head, ws => {
    ws.user = user;

    ws.on('message', (message) => {
      handleMessage(message, ws, wss);
    });
  });

  return true;
}

async function handleMessage(data, ws, wss) {
  if (data instanceof Buffer) {
    // Broadcast to doctor if connected and listen to this patient
    for (let client of wss.clients) {
      if (client.readyState === WebSocket.OPEN
        && client.user._id.toString() === ws.user.doctorID.toString()
        && client.listenPatientID
        && client.listenPatientID.toString() === ws.user._id.toString()) {
        client.send(data);
        break;
      }
    }

    // Parse binary data
    const packet = new DataPacket({
      dataType: ws.examinationInfo.dataType,
      nSeries: ws.examinationInfo.series.length,
      data: data
    });

    // Save in database
    const result = await (await db.getCollection('Examinations')).updateOne(
      {_id: ws.examinationInfo._id}, {
        $push: {
          values: {$each: packet.data}
        }
      });
  }
  else if (typeof data === 'string') {
    let msg = JSON.parse(data);

    if (msg && msg.cmd === 'new') {
      const result = await (await db.getCollection('Examinations')).insertOne({
        userID: ws.user._id,
        name: msg.name,
        date: new Date(),
        type: msg.type,
        dataType: msg.dataType,
        samplingFrequency: msg.sf,
        series: msg.series,
        values: []
      });

      ws.examinationInfo = {
        _id: result.insertedId,
        name: msg.name,
        date: new Date(),
        type: msg.type,
        dataType: msg.dataType,
        samplingFrequency: msg.sf,
        series: msg.series
      };

      // Broadcast to doctor if connected and listen to this patient
      for (let client of wss.clients) {
        if (client.readyState === WebSocket.OPEN
          && client.user._id.toString() === ws.user.doctorID.toString()
          && client.listenPatientID
          && client.listenPatientID.toString() === ws.user._id.toString()) {
          const query = Object.assign({cmd:'newExamination'}, ws.examinationInfo);
          client.send(JSON.stringify(query));
          break;
        }
      }

      // Send start command to patient
      ws.send(JSON.stringify({
        cmd: 'start',
        examinationID: result.insertedId
      }));
    }
  }
}

module.exports = {
  handleUpgrade
};