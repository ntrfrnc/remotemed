const User = require('../models/User');
const db = require('../utils/mongodb');
const DataPacket = require('../utils/DataPacket');

async function handleUpgrade(wss, request, socket, head) {
  const user = await User.loggedIn(request);
  if (!user || user.role !== 1) {
    return false;
  }

  wss.handleUpgrade(request, socket, head, ws => {
    ws.user = user;

    ws.on('message', (message) => {
      handleMessage(message, ws);
    });
  });

  return true;
}

async function handleMessage(data, ws) {
  if (data instanceof Buffer) {
    const packet = new DataPacket({
     dataType: ws.examinationInfo.dataType,
     nSeries: ws.examinationInfo.nSeries,
     data: data
    });
    const result = await (await db.getCollection('Examinations')).updateOne(
      {_id: ws.examinationInfo.id}, {
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
        id: result.insertedId,
        dataType: msg.dataType,
        nSeries: msg.series.length
      };

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