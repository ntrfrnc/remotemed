import './patientPanel.scss';
import AccDataProvider from '../lib/AccDataProvider';
import StreamingHandler from '../lib/StreamingHandler';
import DataChart from '../lib/DataChart';

async function onDoctorChange(e) {
  const select = e.target;
  select.disabled = true;
  const doctorID = select.options[select.selectedIndex].value;

  try {
    await fetch(window.location.toString(), {
      method: "POST",
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: "include",
      body: JSON.stringify({
        command: 'setDoctorForPatient',
        doctorID: doctorID
      })
    });
  } catch (e) {
    alert(e.message);
  }

  select.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
  // Handle doctor change
  const doctorSelect = document.getElementById('doctorSelect');
  doctorSelect.addEventListener('change', onDoctorChange);

  const dataProvider = new AccDataProvider();

  // Handle chart
  const chart = new DataChart({
    chartWrapper: document.getElementById('examinationChartWrapper')
  });
  chart.setSeries(dataProvider.series);

  // Handle streaming toggle
  const streamingToggle = document.getElementById('streamingToggle');
  const strHandler = new StreamingHandler({
    toggler: streamingToggle,
    dataProvider: dataProvider,
    samplingFrequency: 10,
    aggregationTime: 1000,
    onStreaming: (self, packet) => {
      chart.concatData(packet.toTimeSeries(self.startTime, self.sf));
    }
  });
});
