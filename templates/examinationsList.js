const tpl = require('../utils/tpl');

module.exports = v => {
  return tpl.process`
  <ul id="examinationsList" class="examinations-list">
      ${v.examinations && v.examinations.map(e => tpl.process`
          <li class="examination-list__item examination" data-id="${e._id.toString()}">
            <span class="examination__name">${e.name}</span>
            <span class="examination__date">${e.date}</span>
          </li>
       `)}
  </ul>`;
};
