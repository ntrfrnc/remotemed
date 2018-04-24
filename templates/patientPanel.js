const tpl = require('../utils/tpl');
const t = require('../utils/translate');

module.exports = v => {
  return tpl.process`
  <div class="panel patient-panel">
    <div class="panel__item">
      <label for="selectDoctor">${t('myDoctor')}</label>
      <div class="simple-select select-doctor">
        <select id="doctorSelect">
              <option value="none">${t('none')}</option>
          ${v.doctors && v.doctors.map(d => `
              <option ${d.selected && 'selected'} value="${d._id.toString()}">${d.username}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div class="panel__item">
       <input type="checkbox" id="startStopStreaming" class="button">
       <label for="startStopStreaming">${t('startStopStreaming')}</label>
    </div>
  </div>`;
};
