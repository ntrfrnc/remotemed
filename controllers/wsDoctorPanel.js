const User = require('../models/User');
const ObjectID = require('mongodb').ObjectID;
const WebSocket = require('ws');

async function handleUpgrade(wss, request, socket, head) {
  const user = await User.loggedIn(request);
  if (!user || user.role !== 2) {
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
  if (typeof data === 'string') {
    let msg = JSON.parse(data);

    if (msg && msg.cmd === 'startListening') {
      for (let client of wss.clients) {
        if (client.readyState === WebSocket.OPEN
          && msg.patientID === client.user._id.toString()
          && client.examinationInfo) {
          ws.send(JSON.stringify(Object.assign({
            cmd: 'examinationInProgress'
          }, client.examinationInfo)));
          break;
        }
      }

      ws.listenPatientID = ObjectID(msg.patientID);
    }
  }
}

module.exports = {
  handleUpgrade
};