import './patientPanel.scss';
import AccDataProvider from '../lib/AccDataProvider';
import SinDataProvider from '../lib/SinDataProvider';
import StreamingHandler from '../lib/StreamingHandler';
import DataChart from '../lib/DataChart';
import {postCommand} from "../lib/Tools";
import DynamicSelectList from "../lib/DynamicSelectList/DynamicSelectList";
import loadExaminationList from "../lib/LoadExaminationList";

const DataPacket = require('../../utils/DataPacket');

async function onDoctorChange(e) {
  const select = e.target;
  select.disabled = true;
  const doctorID = select.options[select.selectedIndex].value;

  try {
    await postCommand({
      url: window.location.toString(),
      command: 'setDoctorForPatient',
      data: {
        doctorID: doctorID
      }
    });
  } catch (e) {
    alert(e.message);
  }

  select.disabled = false;
}

function getDataProvider(name) {
  switch(name) {
    case 'acc':
      return new AccDataProvider();
    case 'sin':
    default:
      return new SinDataProvider();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Handle doctor change
  const doctorSelect = document.getElementById('doctorSelect');
  doctorSelect.addEventListener('change', onDoctorChange);

  // Handle chart
  const chart = new DataChart({
    chartWrapper: document.getElementById('examinationChartWrapper')
  });

  // Get streaming handler
  const streamHandler = new StreamingHandler({
    samplingFrequency: 20,
    aggregationTime: 1000,
    onStreaming: (self, packet) => {
      chart.concatData(packet.toTimeSeries(self.startTime, self.sf));
    },
    onStreamingOn: (self) => {
      chart.clear();
      chart.setSeries(self.dataProvider.series);
      doctorSelect.disabled = true;
      dataSourceSelect.disabled = true;
    },
    onStreamingOff: () => {
      doctorSelect.disabled = false;
      dataSourceSelect.disabled = false;
    }
  });

  // Set default dataProvider
  const dataSourceSelect = document.getElementById('dataSourceSelect');
  const sourceName = dataSourceSelect.options[dataSourceSelect.selectedIndex].value;
  streamHandler.setDataProvider(getDataProvider(sourceName));

  // Handle data source change
  dataSourceSelect.addEventListener('change', (e) => {
    const select = e.target;
    const sourceName = select.options[select.selectedIndex].value;
    streamHandler.setDataProvider(getDataProvider(sourceName));
  });

  // Load and create examination list
  const items = await loadExaminationList();
  items.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  const selectList = new DynamicSelectList({
    wrapper: document.getElementById('examinationListWrapper'),
    clearBeforeCreate: true,
    items: items,
    addNewForm: true,
    addNewFormPosition: 'top',
    addNewAtTop: true,
    noItemsInfo: true,
    labels: {
      add: 'Start new',
      name: 'Title',
      noItems: 'No examinations to show'
    }
  });

  let itemInProgress;

  selectList.onSelect = async (item) => {
    if (streamHandler.inProgress) {
      const r = confirm('Do you want stop currently running examination?');
      if (r) {
        itemInProgress.element.classList.remove('stream-inprogress');
        streamHandler.turnStreamingOff();

        if (itemInProgress === item) {
          return;
        }
      } else {
        selectList.unselectLast();
        return;
      }
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

    chart.setSeries(item.data.series);
    chart.setData(packet.toTimeSeries(new Date(item.data.date), item.data.samplingFrequency));
  };

  selectList.onBeforeAddNew = async (item) => {
    if (streamHandler.inProgress) {
      const r = confirm('Do you want stop currently running examination?');
      if (r) {
        itemInProgress.element.classList.remove('stream-inprogress');
        streamHandler.turnStreamingOff();
      } else {
        return false;
      }
    }

    item.classes = 'stream-inprogress';
    item.attributes = [{name: 'data-stop-label', value: 'Stop'}];

    const {startTime, msg} = await streamHandler.turnStreamingOn({name: item.data.name});
    item.content += ' - ' + startTime.toLocaleString();
    item.data._id = msg.examinationID;
    item.data.series = streamHandler.dataProvider.series;
    item.data.dataType = streamHandler.dataProvider.dataType;
    item.data.date = startTime.toJSON();
    item.data.samplingFrequency = streamHandler.sf;

    itemInProgress = item;

    selectList.listElement.scrollTop = 0;
    selectList.unselectLast();
  };

});
