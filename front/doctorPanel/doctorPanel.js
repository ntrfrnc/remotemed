import './doctorPanel.scss';
import DataChart from '../lib/DataChart';
import {postCommand} from "../lib/Tools";
import loadExaminationList from "../lib/LoadExaminationList";

const DataPacket = require('../../utils/DataPacket');

document.addEventListener('DOMContentLoaded', async () => {
  // Handle chart
  const chart = new DataChart({
    chartWrapper: document.getElementById('examinationChartWrapper')
  });

  // Handle patient change
  const patientSelect = document.getElementById('patientSelect');
  const examinationListWrapper = document.getElementById('examinationListWrapper');
  patientSelect.addEventListener('change', async (e) => {
    const select = e.target;
    select.disabled = true;
    const patientID = select.options[select.selectedIndex].value;

    chart.clear();

    try {
      const selectList = await loadExaminationList({
        wrapper: examinationListWrapper,
        userID: patientID
      });

      selectList.onSelect = async (item) => {
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
    } catch (e) {
      alert(e.message);
    }

    select.disabled = false;
  });
});
