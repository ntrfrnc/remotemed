const tpl = require('../utils/tpl');
const t = require('../utils/translate');
const examinationsList = require('./examinationsList');

module.exports = v => {
  return tpl.process`
  <div class="panel patient-panel">
    <div class="panel__item">
      <label for="doctorSelect">${t('myDoctor')}</label>
      <div class="simple-select select-doctor">
        <select id="doctorSelect">
              <option value="none">${t('none')}</option>
          ${v.doctors && v.doctors.map(d => `
              <option ${d.selected && 'selected'} value="${d._id.toString()}">${d.username}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div class="panel__item stream-data">
       <label class="stream-data__label">${t('streamData')}</label>
       <input type="checkbox" id="streamingToggle" class="button stream-data__button">
       <label for="streamingToggle">${t('startStopStreaming')}</label>
    </div>
    <div class="panel__item">
      ${examinationsList(v)}
    </div>
    <div class="panel__item">
      <div id="examinationChartWrapper"></div>
    </div>
  </div>`;
};
