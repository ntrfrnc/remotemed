import './doctorPanel.scss';
import DataChart from '../lib/DataChart';
import {postCommand} from "../lib/Tools";
import DynamicSelectList from "../lib/DynamicSelectList/DynamicSelectList";
import loadExaminationList from "../lib/LoadExaminationList";
import ListeningHandler from './ListeningHandler';

const DataPacket = require('../../utils/DataPacket');

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

  const selectList = new DynamicSelectList({
    wrapper: document.getElementById('examinationListWrapper'),
    clearBeforeCreate: true,
    noItemsInfo: true,
    labels: {
      noItems: 'No examinations to show'
    }
  });

  const listenHandler = new ListeningHandler({
    chart: chart,
    examinationList: selectList
  });

  // Handle patient change
  const patientSelect = document.getElementById('patientSelect');
  patientSelect.addEventListener('change', async (e) => {
    const select = e.target;
    select.disabled = true;
    const patientID = select.options[select.selectedIndex].value;

    listenHandler.stopListening();
    chart.clear();
    selectList.clear();

    if (!patientID || patientID === 'none') {
      select.disabled = false;
      return;
    }

    const list = await loadExaminationList(patientID);
    list.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    selectList.addItems(list);

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
