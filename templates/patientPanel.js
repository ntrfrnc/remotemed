const tpl = require('../utils/tpl');
const t = require('../utils/translate');

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
    <div class="panel__item examinations">
      <h2>${t('examinationsList')}</h2>
      <div id="examinationListWrapper" class="examination-list-wrapper"></div>
    </div>
    <div id="examinationChartWrapper" class="panel__item examination-chart-wrapper"></div>
  </div>`;
};
