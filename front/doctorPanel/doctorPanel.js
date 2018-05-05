import './doctorPanel.scss';
import DataChart from '../lib/DataChart';
import {postCommand} from "../lib/Tools";
import loadExaminationList from "../lib/LoadExaminationList";

const DataPacket = require('../../utils/DataPacket');

class ListeningHandler {
  constructor({examinationList, chart}) {
    this.examinationlist = examinationList;
    this.chart = chart;
    this.currentIdx = -1;
    this.cachedExaminations = [];
    this.ws = null;
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
    }
  }

  stopListening() {
    this.cachedExaminations = [];
    this.currentIdx = -1;
    this.ws.close();
    this.ws = null;
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

function appendMergeTimeSeries(target, source) {
  const endTargetTime = +target[target.length - 1][0];

  // TODO: Maybe rewrite to binary search?
  for (let i = 0; i < source.length; i++) {
    if (endTargetTime < +source[i][0]) {
      Array.prototype.push.apply(target, source.slice(i));
      break;
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Handle chart
  const chart = new DataChart({
    chartWrapper: document.getElementById('examinationChartWrapper')
  });

  // Handle patient change
  const patientSelect = document.getElementById('patientSelect');
  const examinationListWrapper = document.getElementById('examinationListWrapper');
  let listenHandler = null;
  patientSelect.addEventListener('change', async (e) => {
    const select = e.target;
    select.disabled = true;
    const patientID = select.options[select.selectedIndex].value;

    chart.clear();

    const selectList = await loadExaminationList({
      wrapper: examinationListWrapper,
      userID: patientID
    });

    if (listenHandler) {
      listenHandler.stopListening();
    }
    listenHandler = new ListeningHandler({
      chart: chart,
      examinationList: selectList
    });

    selectList.onSelect = async (item) => {
      chart.setSeries(item.data.series);

      const cachedExam = listenHandler.getCachedExam(item.data._id);
      if (item.data.wholeInCache) {
        if (cachedExam.buffer.length > 0) {
          chart.setData(cachedExam.buffer);
        } else {
          chart.clear(cachedExam.buffer);
        }
        return;
      }

      chart.chart.showLoading();

      const data = await postCommand({
        url: window.location.toString(),
        command: 'getExaminationData',
        data: {
          examinationID: item.data._id
        },
        isBinary: true
      });

      const packet = new DataPacket({
        data: data,
        dataType: item.data.dataType,
        nSeries: item.data.series.length
      });

      chart.chart.hideLoading();

      const timeSeries = packet.toTimeSeries(new Date(item.data.date), item.data.samplingFrequency);

      if (cachedExam && cachedExam.buffer.length > 0) {
        appendMergeTimeSeries(timeSeries, cachedExam.buffer);
      }

      chart.setData(timeSeries);
    };

    listenHandler.startListening(patientID);

    select.disabled = false;
  });
});
