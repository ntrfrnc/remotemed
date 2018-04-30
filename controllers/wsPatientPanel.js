const User = require('../models/User');
const db = require('../utils/mongodb');

async function handleUpgrade(wss, request, socket, head) {
  const user = await User.loggedIn(request);
  if (!user || user.role !== 1) {
    return false;
  }

  wss.handleUpgrade(request, socket, head, ws => {
    ws.user = user;
    ws.isFirstMessage = true;

    ws.on('message', (message) => {
      handleMessage(message, ws);
    });

  });

  return true;
}

async function handleMessage(data, ws) {
  if (data instanceof Buffer) {
    const dataArray = getTypedArray(new Uint8Array(data).buffer, ws.examinationInfo.dataType);
    const result = await (await db.getCollection('Examinations')).updateOne(
      {_id: ws.examinationInfo.id}, {
        $push: {
          values: {$each: parseDataArray(dataArray, ws.examinationInfo.nSeries)}
        }
      });
  }
  else if (typeof data === 'string') {
    let msg = JSON.parse(data);

    if (msg && msg.cmd === 'new') {
      const result = await (await db.getCollection('Examinations')).insertOne({
        userID: ws.user._id,
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

      ws.send(JSON.stringify({cmd: 'start'}));
    }
  }
}

function getTypedArray(buffer, type) {
  switch (type) {
    case 'uint8': return new Uint8Array(buffer);
    case 'int8': return new Int8Array(buffer);
    case 'uint16': return new Uint16Array(buffer);
    case 'int16': return new Int16Array(buffer);
    case 'uint32': return new Uint32Array(buffer);
    case 'int32': return new Int32Array(buffer);
    case 'float32': return new Float32Array(buffer);
    case 'float64': return new Float64Array(buffer);
  }
}

function parseDataArray(dataArray, nSeries) {
  const result = [];

  for (let i = 0; i < dataArray.length; i += nSeries) {
    let sample = [];

    for (let j = 0; j < nSeries; j++) {
      sample.push(dataArray[i + j]);
    }

    result.push(sample);
  }

  return result;
}

module.exports = {
  handleUpgrade
};