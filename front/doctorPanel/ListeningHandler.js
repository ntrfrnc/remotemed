const DataPacket = require('../../utils/DataPacket');

export default class ListeningHandler {
  constructor({examinationList, chart}) {
    this.examinationlist = examinationList || null;
    this.chart = chart || null;
    this.currentIdx = -1;
    this.cachedExaminations = [];
    this.ws = null;
    this.listening = false;
  }

  setExaminationList(list) {
    this.examinationlist = list;
  }

  setChart(chart) {
    this.chart = chart;
  }

  startListening(patientID) {
    this.ws = new WebSocket(window.location.toString().replace(/^https?/, 'ws'));
    this.ws.binaryType = 'arraybuffer';
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        cmd: 'startListening',
        patientID: patientID
      }))
    };
    this.listening = true;
  }

  stopListening() {
    if(!this.listening) {
      return;
    }

    this.cachedExaminations = [];
    this.currentIdx = -1;
    this.ws.close();
    this.ws = null;
    this.listening = false;
  }

  handleMessage(e) {
    if (e.data instanceof ArrayBuffer) {
      this.onNewData(e.data);
    } else if (typeof e.data === 'string') {
      const msg = JSON.parse(e.data);
      switch (msg.cmd) {
        case 'examinationInProgress':
          this.onExaminationCmd(msg);
          break;
        case 'newExamination':
          this.onExaminationCmd(msg);
          break;
      }
    }
  }

  onExaminationCmd(msg) {
    if (this.currentIdx > -1
      && msg._id === this.cachedExaminations[this.currentIdx]._id) {
      return;
    }

    ++this.currentIdx;
    this.cachedExaminations.push(Object.assign(msg, {
      buffer: []
    }));

    let isInList = false;
    for (let item of this.examinationlist.list) {
      if (item.data._id === msg._id) {
        isInList = true;
        break;
      }
    }

    if (!isInList) {
      this.examinationlist.addItem({
        content: msg.name + ' - ' + (new Date(msg.date)).toLocaleString(),
        classes: 'inprogress',
        data: Object.assign({wholeInCache: true}, msg)
      });
    }
  }

  onNewData(msg) {
    if (this.currentIdx < 0) {
      console.log('Sth wrong');
      return;
    }

    const examInProgress = this.cachedExaminations[this.currentIdx];

    const packet = new DataPacket({
      data: msg,
      dataType: examInProgress.dataType,
      nSeries: examInProgress.series.length
    });

    const timeSeries = packet.toTimeSeries(new Date(examInProgress.date), examInProgress.samplingFrequency);

    const selected = this.examinationlist.lastSelected;
    if (selected && selected.data._id === examInProgress._id) {
      this.chart.concatData(timeSeries);
    } else {
      Array.prototype.push.apply(examInProgress.buffer, timeSeries);
    }
  }

  getCachedExam(examinationID) {
    for (let exam of this.cachedExaminations) {
      if (exam._id === examinationID) {
        return exam;
      }
    }

    return false;
  }
}
