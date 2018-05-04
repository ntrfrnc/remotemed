const tpl = require('../utils/tpl');
const t = require('../utils/translate');

module.exports = v => {
  return tpl.process`
  <div class="panel doctor-panel">
    <div class="panel__item">
      <label for="patientSelect">${t('choosePatient')}</label>
      <div class="simple-select select-patient">
        <select id="patientSelect">
              <option value="none">${t('none')}</option>
          ${v.patients && v.patients.map(p => `
              <option value="${p._id.toString()}">${p.username}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div id="examinationListWrapper" class="panel__item examination-list-wrapper"></div>
    <div id="examinationChartWrapper" class="panel__item examination-chart-wrapper"></div>
  </div>`;
};

